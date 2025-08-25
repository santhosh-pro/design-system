import {
  AfterViewInit,
  Component,
  ContentChildren,
  input,
  output,
  QueryList,
  signal,
  WritableSignal,
  Type,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild
} from '@angular/core';
import { PaginationComponent, PaginationEvent } from '../../display/pagination/pagination.component';
import { DatePipe, NgClass } from '@angular/common';
import { StatusBadgeComponent } from '../../feedback/status-badge/status-badge.component';
import { SortableTableDirective, TableSortEvent } from './base-table/sortable-table.directive';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessorV3 } from '../../../core/base-control-value-accessor-v3';
import { MultiSelectDropdownComponent } from '../../forms/select/multi-select-dropdown/multi-select-dropdown.component';
import { debounceTime } from 'rxjs/operators';
import { resolveTemplateWithObject } from '../../../core/template-resolver';
import { provideNgxMask } from '../../forms/input-mask/ngx-mask.providers';
import { DynamicRendererComponent } from '../../misc/dynamic-renderer/dynamic-renderer.component';
import { ContextMenuButtonAction, ContextMenuButtonComponent } from '../../overlay/context-menu-button/context-menu-button.component';
import { CheckboxComponent } from '../../forms/checkbox/checkbox.component';
import { TextInputComponent } from '../../forms/text-input/text-input.component';
import { DateInputComponent, InputDateFormat } from '../../forms/date/date-input/date-input.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    PaginationComponent,
    NgClass,
    DatePipe,
    StatusBadgeComponent,
    SortableTableDirective,
    // TableResizableColumnsDirective,
    CheckboxComponent,
    FormsModule,
    TextInputComponent,
    DynamicRendererComponent,
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
    DateInputComponent,
    ContextMenuButtonComponent
],
  providers: [provideNgxMask()],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent<T> extends BaseControlValueAccessorV3<TableStateEvent> implements OnInit, AfterViewInit {
  @ContentChildren('filter') headerComponents!: QueryList<any>;
  @ViewChild('table', { static: false }) tableRef!: ElementRef;

  public InputDateFormat = InputDateFormat;

  columnGroups = input.required<ColumnGroup[]>();
  pageSize = input(50);
  private internalPageSize: number = this.pageSize();
  enableHorizontallyScrollable = input(true);
  enableResizableColumns = input(false);
  enableClickableRows = input(false);
  expandableComponent = input<any>();
  filterComponent = input<any>();
  enableSearch = input(true);
  disableInitialLoad = input(false);
  rowSelectionKey = input<string>('id');
  enableRowSelection = input(false);
  defaultSelectedKeys = input<any[]>([]);
  initialValue = input<TableStateEvent>({ searchText: '' });
  data = input<T[]>([]);
  totalCount = input<number>(0);
  maxPinnedLeft = input<number>(3);
  maxPinnedRight = input<number>(3);

  pageChange = output<PaginationEvent>();
  sortChanged = output<TableSortEvent>();
  tableStateChanged = output<TableStateEvent>();
  onActionPerformed = output<TableActionEvent>();
  filterChanged = output<FilterEvent>();
  onRowClicked = output<any>();
  rowSelectionChange = output<any[]>();
  pinChanged = output<{ column: ColumnDef; pinned: 'left' | 'right' | null }>();

  subscriptions: any[] = [];
  private isInitializingFilters = true;
  private lastStateChangeTimestamp = 0;
  private readonly debounceTime = 200;

  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  searchText: string = '';
  columnFilters: { [key: string]: { value?: any; min?: any; max?: any; operation: string } } = {};
  filterControls: { [key: string]: { [prop: string]: FormControl } } = {};
  selectedIds = signal<any[]>([]);
  columnGroupsSignal: WritableSignal<ColumnGroup[]> = signal([]);

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    const initialValue = this.initialValue();
    console.log('Initial value:', initialValue);
    if (initialValue) {
      this.applyInitialState(initialValue);
    }
    // Initialize column visibility and sync with signal
    const updatedGroups = this.columnGroups().map(group => ({
      ...group,
      columns: group.columns.map(col => ({ ...col, visible: col.visible ?? true, pinned: col.type === 'actions' ? 'right' : (col.pinned ?? null) }))
    }));
    this.columnGroupsSignal.set(updatedGroups);
  }

  protected onValueReady(value: TableStateEvent): void {
    console.log('onValueReady called with:', value);
    this.applyInitialState(value);
    this.tableStateChanged.emit(value);
  }

  private applyInitialState(value: TableStateEvent): void {
    if (value) {
      this.searchText = value.searchText ?? '';
      this.paginationEvent = value.paginationEvent;
      this.tableSortEvent = value.tableSortEvent;
      this.columnFilters = value.columnFilters ?? {};
      if (value.paginationEvent?.pageSize) {
        this.internalPageSize = value.paginationEvent.pageSize;
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.enableRowSelection() && this.defaultSelectedKeys().length > 0) {
      this.selectedIds.set([...this.defaultSelectedKeys()]);
      this.rowSelectionChange.emit(this.selectedIds());
      console.log('Default selected IDs:', this.selectedIds());
    }

    this.columnGroupsSignal().forEach(group => {
      group.columns.forEach(column => {
        if (column.filterConfig) {
          const filterKey = this.getFilterKey(column);
          if (!this.columnFilters[filterKey]?.value) {
            this.columnFilters[filterKey] = {
              value: column.filterConfig.type === 'select' ? [] : undefined,
              operation: this.columnFilters[filterKey]?.operation ?? this.getDefaultOperation(column.filterConfig.type),
            };
          }
          const control = this.getFilterControl(column, 'value');
          control.valueChanges.pipe(debounceTime(300)).subscribe(value => {
            if (!this.isInitializingFilters) {
              this.onFilterChanged(value, null, null, column);
            }
          });
        }
      });
    });

    let paginationEvent: PaginationEvent = {
      pageNumber: 1,
      pageSize: this.internalPageSize,
    };
    this.paginationEvent = paginationEvent;
    this.pageChange.emit(paginationEvent);

    let tableStateEvent: TableStateEvent = {
      searchText: '',
      paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters,
    };

    this.onValueChange(tableStateEvent);

    this.headerComponents.forEach((component) => {
      if (component.filtersChanged) {
        let emitter = component.filtersChanged;
        const sub = emitter.subscribe((newFilters: any) => {
          console.log('Custom filter changed:', newFilters);
          if (newFilters && Object.keys(newFilters).length > 0) {
            this.columnFilters['custom'] = { value: newFilters, operation: 'custom' };
          } else {
            delete this.columnFilters['custom'];
          }
          let updatedTableStateEvent: TableStateEvent = {
            searchText: this.searchText,
            paginationEvent: this.paginationEvent,
            tableSortEvent: this.tableSortEvent,
            columnFilters: { ...this.columnFilters },
          };
          const filterEvent: FilterEvent = { key: 'custom', value: newFilters, operation: 'custom' };
          this.filterChanged.emit(filterEvent);
          this.emitTableStateChanged(updatedTableStateEvent);
        });
        this.subscriptions.push(sub);
      }
    });

    // Delay offset calculation to ensure DOM is ready
    setTimeout(() => {
      this.cdr.detectChanges();
      this.isInitializingFilters = false;
    }, 0);
  }

  private emitTableStateChanged(tableStateEvent: TableStateEvent) {
    const now = Date.now();
    if (this.isInitializingFilters) {
      console.log('Skipping tableStateChanged emission during filter initialization:', tableStateEvent);
      return;
    }
    if (now - this.lastStateChangeTimestamp < this.debounceTime) {
      console.log('Debouncing tableStateChanged emission:', tableStateEvent);
      return;
    }
    this.lastStateChangeTimestamp = now;
    console.log('Emitting tableStateChanged:', tableStateEvent);
    this.tableStateChanged.emit(tableStateEvent);
  }

  private areTableStatesEqual(state1: TableStateEvent, state2: TableStateEvent): boolean {
    const paginationEqual =
      (state1.paginationEvent?.pageNumber ?? 1) === (state2.paginationEvent?.pageNumber ?? 1) &&
      (state1.paginationEvent?.pageSize ?? this.internalPageSize) === (state2.paginationEvent?.pageSize ?? this.internalPageSize);
    const sortEqual =
      (state1.tableSortEvent?.key ?? null) === (state2.tableSortEvent?.key ?? null) &&
      (state1.tableSortEvent?.direction ?? null) === (state2.tableSortEvent?.direction ?? null);
    const searchEqual = (state1.searchText ?? '') === (state2.searchText ?? '');
    const filtersEqual = this.areFiltersEqual(state1.columnFilters ?? {}, state2.columnFilters ?? {});
    return paginationEqual && sortEqual && searchEqual && filtersEqual;
  }

  private areFiltersEqual(
    filters1: { [key: string]: { value?: any; min?: any; max?: any; operation: string } },
    filters2: { [key: string]: { value?: any; min?: any; max?: any; operation: string } }
  ): boolean {
    const keys1 = Object.keys(filters1);
    const keys2 = Object.keys(filters2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => {
      const filter1 = filters1[key];
      const filter2 = filters2[key];
      if (!filter2) return false;
      const valueEqual = filter1.value === filter2.value || (
        Array.isArray(filter1.value) && Array.isArray(filter2.value) &&
        filter1.value.length === filter2.value.length &&
        filter1.value.every((val: any, i: number) => val === filter2.value[i])
      );
      const minEqual = filter1.min === filter2.min;
      const maxEqual = filter1.max === filter2.max;
      const operationEqual = filter1.operation === filter2.operation;
      return valueEqual && minEqual && maxEqual && operationEqual;
    });
  }

  onSearchTextChanged($event: string) {
    this.searchText = $event;
    let paginationEvent: PaginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
    };
    this.paginationEvent = paginationEvent;
    let tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  getFilterKey(column: ColumnDef): string {
    return column.key || column.sortKey || (column.displayTemplate?.replace(/^\$/, '') || '');
  }

  getFilterValue(column: ColumnDef, property: 'min' | 'max' | 'value'): any {
    const filterKey = this.getFilterKey(column);
    return this.columnFilters[filterKey]?.[property];
  }

  getFilterControl(column: ColumnDef, property: 'min' | 'max' | 'value'): FormControl {
    const filterKey = this.getFilterKey(column);
    if (!this.filterControls[filterKey]) {
      this.filterControls[filterKey] = {};
    }
    if (!this.filterControls[filterKey][property]) {
      const initialValue = this.getFilterValue(column, property) || (column.filterConfig?.type === 'select' ? [] : null);
      if (column.filterConfig?.type === 'date' && initialValue) {
        const dateValue = new Date(initialValue);
        this.filterControls[filterKey][property] = new FormControl(this.isValidDate(dateValue) ? dateValue : null);
      } else {
        this.filterControls[filterKey][property] = new FormControl(initialValue);
      }
    }
    return this.filterControls[filterKey][property];
  }

  private isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  hasFilterConfig(): boolean {
    return this.columnGroupsSignal().some(group =>
      group.columns.some(column => !!column.filterConfig)
    );
  }

  onFilterChanged(value: any, min: any, max: any, column: ColumnDef) {
    console.log('onFilterChanged called with:', { value, min, max, column: column.title });
    const filterKey = this.getFilterKey(column);
    if (!filterKey) {
      console.warn('No valid filter key found for column:', column.title);
      return;
    }
    const existingFilter = this.columnFilters[filterKey] || {
      operation: this.getDefaultOperation(column.filterConfig?.type),
    };
    const operation = existingFilter.operation;
    let parsedValue = value;
    let parsedMin = min;
    let parsedMax = max;

    if (column.filterConfig?.type === 'select') {
      parsedValue = Array.isArray(value) ? value : value ? [value] : [];
    } else if (column.filterConfig?.type === 'date') {
      parsedValue = value ? new Date(value) : null;
      parsedMin = min ? new Date(min) : null;
      parsedMax = max ? new Date(max) : null;
      parsedValue = parsedValue && this.isValidDate(parsedValue) ? parsedValue : null;
      parsedMin = parsedMin && this.isValidDate(parsedMin) ? parsedMin : null;
      parsedMax = parsedMax && this.isValidDate(parsedMax) ? parsedMax : null;
    }

    if (operation === 'range') {
      if (parsedMin || parsedMax) {
        this.columnFilters[filterKey] = { min: parsedMin, max: parsedMax, operation };
      } else {
        delete this.columnFilters[filterKey];
      }
    } else {
      if (parsedValue && (Array.isArray(parsedValue) ? parsedValue.length > 0 : parsedValue)) {
        this.columnFilters[filterKey] = { value: parsedValue, operation };
      } else {
        delete this.columnFilters[filterKey];
      }
    }

    const filterEvent: FilterEvent = operation === 'range'
      ? { key: filterKey, min: parsedMin, max: parsedMax, operation }
      : { key: filterKey, value: parsedValue, operation };
    console.log('Emitting filterChanged:', filterEvent);
    this.filterChanged.emit(filterEvent);

    const paginationEvent: PaginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize,
    };
    this.paginationEvent = paginationEvent;
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: { ...this.columnFilters },
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onFilterOperationChanged(operation: string, column: ColumnDef) {
    console.log('onFilterOperationChanged called with:', { operation, column: column.title });
    const filterKey = this.getFilterKey(column);
    if (!filterKey) {
      console.warn('No valid filter key found for column:', column.title);
      return;
    }
    const existingFilter = this.columnFilters[filterKey] || {
      value: undefined,
      min: undefined,
      max: undefined,
      operation: this.getDefaultOperation(column.filterConfig?.type)
    };
    this.columnFilters[filterKey] = operation === 'range'
      ? { min: existingFilter.min, max: existingFilter.max, operation }
      : { value: existingFilter.value, operation };
    if (this.filterControls[filterKey]) {
      if (operation === 'range') {
        this.filterControls[filterKey]['value']?.setValue(null, { emitEvent: false });
      } else {
        this.filterControls[filterKey]['min']?.setValue(null, { emitEvent: false });
        this.filterControls[filterKey]['max']?.setValue(null, { emitEvent: false });
      }
    }
    const filterEvent: FilterEvent = operation === 'range'
      ? { key: filterKey, min: existingFilter.min, max: existingFilter.max, operation }
      : { key: filterKey, value: existingFilter.value, operation };
    console.log('Emitting filterChanged (operation):', filterEvent);
    this.filterChanged.emit(filterEvent);
    let paginationEvent: PaginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
    };
    this.paginationEvent = paginationEvent;
    let tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: { ...this.columnFilters }
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  public getDefaultOperation(type?: string): string {
    switch (type) {
      case 'text':
        return 'contains';
      case 'number':
      case 'date':
        return 'equal';
      case 'select':
        return 'equals';
      default:
        return 'contains';
    }
  }

  public getFilterOperations(type?: string): { value: string; label: string }[] {
    switch (type) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'exact', label: 'Exact' }
        ];
      case 'number':
      case 'date':
        return [
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lesserThan', label: 'Lesser Than' },
          { value: 'equals', label: 'Equals' },
          { value: 'notEqual', label: 'Not Equal' },
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'notEqual', label: 'Not Equal' }
        ];
      default:
        return [];
    }
  }

  getPropertyValue(item: any, column: ColumnDef): any {
    if (column.displayTemplate) {
      return resolveTemplateWithObject(item, column.displayTemplate);
    }
    let value = '';
    if (column.key) {
      value = column.key.split('.').reduce((acc, part) => acc && acc[part], item);
    }
    if (column.formatter) {
      return column.formatter ? column.formatter(value) : value;
    } else if (column.objectFormatter) {
      return column.objectFormatter ? column.objectFormatter(item) : item;
    } else {
      return value;
    }
  }

  onPageChange(event: PaginationEvent) {
    this.paginationEvent = event;
    let tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: event,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters
    };
    this.pageChange.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onSortChanged(event: TableSortEvent) {
    this.tableSortEvent = event;
    let tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: {
        pageNumber: 1,
        pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
      },
      tableSortEvent: event,
      columnFilters: this.columnFilters
    };
    this.sortChanged.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  getThTrClass(column: ColumnDef) {
    switch (column.alignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }

  getFlexJustify(column: ColumnDef) {
    switch (column.alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  }

  getBadgeProperty(item: any, column: ColumnDef): BadgeConfigProperty | null {
    let badgeConfigProperties = column.badgeConfig?.properties ?? [];
    let matchedBadgeConfigProperty: BadgeConfigProperty | null = null;
    badgeConfigProperties.forEach(badgeConfigProperty => {
      let value = this.getPropertyValue(item, column);
      if (value === badgeConfigProperty.data) {
        matchedBadgeConfigProperty = badgeConfigProperty;
      }
    });
    return matchedBadgeConfigProperty;
  }

  getContextMenuActions(actions: ContextMenuActionConfig[] | ((item: any) => ContextMenuActionConfig[]) | null | undefined, item: any): ContextMenuButtonAction[] {
    let actionConfigs: ContextMenuActionConfig[] = [];
    if (typeof actions === 'function') {
      actionConfigs = actions(item);
    } else if (actions) {
      actionConfigs = actions;
    }
    return actionConfigs.map(action => {
      let configAction: ContextMenuButtonAction = {
        iconPath: action.iconPath,
        label: action.label,
        actionKey: action.actionKey
      };
      return configAction;
    });
  }

  _onActionClicked($event: string, item: any, mouseEvent: MouseEvent | null) {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    let tableActionEvent: TableActionEvent = {
      actionKey: $event,
      item: item
    };
    this.onActionPerformed.emit(tableActionEvent);
    console.log('Action clicked:', tableActionEvent);
  }

  expandedRowIndex = signal<number | null>(null);

  onRowExpandedClicked(i: number) {
    if (this.expandedRowIndex() == i) {
      this.expandedRowIndex.set(null);
    } else {
      this.expandedRowIndex.set(i);
    }
  }

  _onRowClicked(item: any) {
    this.onRowClicked.emit(item);
  }

  onCellActionPerformed($event: TableActionEvent) {
    this.onActionPerformed.emit($event);
    console.log('Cell action performed:', $event);
  }

  onRowActionPerformed($event: TableActionEvent) {
    this.onActionPerformed.emit($event);
    console.log('Row action performed:', $event);
  }

  isRowSelected(item: any): boolean {
    const id = this.getItemId(item);
    return this.selectedIds().includes(id);
  }

  onRowSelectionChange(selected: boolean, item: any) {
    const id = this.getItemId(item);
    let updatedIds: any[];
    if (selected) {
      updatedIds = [...this.selectedIds(), id];
    } else {
      updatedIds = this.selectedIds().filter(selectedId => selectedId !== id);
    }
    this.selectedIds.set(updatedIds);
    this.rowSelectionChange.emit(this.selectedIds());
    console.log('Row selection changed:', this.selectedIds());
  }

  private getItemId(item: any): any {
    const key = this.rowSelectionKey();
    return key.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  isAllSelected(): boolean {
    if (this.data().length === 0) return false;
    return this.data().every((item: any) => this.isRowSelected(item));
  }

  onSelectAllRows(selected: boolean) {
    let updatedIds: any[];
    if (selected) {
      const newIds = this.data().map((item: any) => this.getItemId(item)).filter((id: any) => !this.selectedIds().includes(id));
      updatedIds = [...this.selectedIds(), ...newIds];
    } else {
      const currentPageIds = this.data().map((item: any) => this.getItemId(item));
      updatedIds = this.selectedIds().filter(id => !currentPageIds.includes(id));
    }
    this.selectedIds.set(updatedIds);
    this.rowSelectionChange.emit(this.selectedIds());
    console.log('Select all changed:', this.selectedIds());
  }

  // Pinning functionality
  onPinToggle(column: ColumnDef) {
    console.log('Pin toggle for column:', column.title);
    let newPinnedValue: 'left' | 'right' | null;
    if (column.pinned === null) {
      newPinnedValue = 'left';
    } else if (column.pinned === 'left') {
      newPinnedValue = 'right';
    } else {
      newPinnedValue = null;
    }

    // Check max pinned limit
    const leftPinnedCount = this.columnGroupsSignal().reduce((count, group) => 
      count + group.columns.filter(col => col.pinned === 'left' && (col.visible ?? true)).length, 0);
    const rightPinnedCount = this.columnGroupsSignal().reduce((count, group) => 
      count + group.columns.filter(col => col.pinned === 'right' && (col.visible ?? true)).length, 0);

    if (newPinnedValue === 'left' && leftPinnedCount >= this.maxPinnedLeft() && column.pinned !== 'left') {
      console.warn('Maximum left-pinned columns reached:', this.maxPinnedLeft());
      return;
    }
    if (newPinnedValue === 'right' && rightPinnedCount >= this.maxPinnedRight() && column.pinned !== 'right') {
      console.warn('Maximum right-pinned columns reached:', this.maxPinnedRight());
      return;
    }

    // Update the column's pinned property
    this.columnGroupsSignal.update(groups => {
      const updatedGroups = groups.map(group => ({
        ...group,
        columns: group.columns.map(col => col === column ? { ...col, pinned: newPinnedValue } : col)
      }));
      return updatedGroups;
    });

    // Emit pinning change
    this.pinChanged.emit({ column, pinned: newPinnedValue });

    // Trigger change detection
    this.cdr.detectChanges();
  }

getPinnedLeftOffset(column: ColumnDef, group: ColumnGroup): string {
  if (column.pinned !== 'left') return '0';

  const allPinnedColumns: { column: ColumnDef; groupIndex: number }[] = [];
  this.columnGroupsSignal().forEach((grp, groupIndex) => {
    grp.columns.forEach(col => {
      if (col.pinned === 'left' && (col.visible ?? true)) {
        allPinnedColumns.push({ column: col, groupIndex });
      }
    });
  });

  allPinnedColumns.sort((a, b) => {
    if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
    return this.columnGroupsSignal()[a.groupIndex].columns.indexOf(a.column) - 
           this.columnGroupsSignal()[b.groupIndex].columns.indexOf(b.column);
  });

  const pinnedIndex = allPinnedColumns.findIndex(item => item.column === column);
  if (pinnedIndex === -1) return '0';

  let offset = 0;
  const hasCheckbox = this.enableRowSelection();
  const domIndex = hasCheckbox ? pinnedIndex + 1 : pinnedIndex;

  if (this.tableRef?.nativeElement) {
    const headerRow = this.tableRef.nativeElement.querySelector('thead tr:first-child');
    if (headerRow) {
      const thElements = headerRow.querySelectorAll('th.sticky');
      if (thElements && thElements.length > 0) {
        for (let i = 0; i < domIndex && i < thElements.length; i++) {
          const th = thElements[i] as HTMLElement;
          const width = th?.offsetWidth;
          if (width && !isNaN(width)) {
            offset += width;
          } else {
            // Fallback to default widths
            if (hasCheckbox && i === 0) {
              offset += 48; // Checkbox column width
            } else {
              const fallbackIndex = hasCheckbox ? i - 1 : i;
              if (fallbackIndex >= 0 && fallbackIndex < allPinnedColumns.length) {
                offset += allPinnedColumns[fallbackIndex].column.width ?? 120;
              }
            }
          }
        }
      } else {
        // DOM elements not ready, use fallback calculation
        if (hasCheckbox) {
          offset += 48;
        }
        for (let i = 0; i < pinnedIndex; i++) {
          offset += allPinnedColumns[i].column.width ?? 120;
        }
      }
    } else {
      // Header row not found, use fallback
      if (hasCheckbox) {
        offset += 48;
      }
      for (let i = 0; i < pinnedIndex; i++) {
        offset += allPinnedColumns[i].column.width ?? 120;
      }
    }
  } else {
    // TableRef not available, use fallback
    if (hasCheckbox) {
      offset += 48;
    }
    for (let i = 0; i < pinnedIndex; i++) {
      offset += allPinnedColumns[i].column.width ?? 120;
    }
  }

  // Ensure we never return NaN
  return isNaN(offset) ? '0' : `${offset}px`;
}

  getPinnedRightOffset(column: ColumnDef, group: ColumnGroup): string {
    if (column.pinned !== 'right') return '0';

    const allPinnedColumns: { column: ColumnDef; groupIndex: number }[] = [];
    this.columnGroupsSignal().forEach((grp, groupIndex) => {
      grp.columns.forEach(col => {
        if (col.pinned === 'right' && (col.visible ?? true)) {
          allPinnedColumns.push({ column: col, groupIndex });
        }
      });
    });

    allPinnedColumns.sort((a, b) => {
      if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
      return this.columnGroupsSignal()[a.groupIndex].columns.indexOf(a.column) - 
             this.columnGroupsSignal()[b.groupIndex].columns.indexOf(b.column);
    });

    const pinnedIndex = allPinnedColumns.findIndex(item => item.column === column);
    if (pinnedIndex === -1) return '0';

    let offset = 0;

    if (this.tableRef) {
      const headerRow = this.tableRef.nativeElement.querySelector('thead tr:first-child');
      let thElements: NodeListOf<HTMLElement> | null = null;
      if (headerRow) {
        thElements = headerRow.querySelectorAll('th.sticky[pinned="right"]');
      }
      if (thElements) {
        // For right, sum widths of elements to the right (higher indices)
        for (let i = pinnedIndex + 1; i < allPinnedColumns.length; i++) {
          const domI = i - allPinnedColumns.length + thElements.length; // Adjust if needed, but since sorted, use fallback
          const th = thElements[domI];
          if (th) {
            offset += th.offsetWidth;
          } else {
            offset += allPinnedColumns[i].column.width ?? 120;
          }
        }
      } else {
        // Fallback
        for (let i = pinnedIndex + 1; i < allPinnedColumns.length; i++) {
          offset += allPinnedColumns[i].column.width ?? 120;
        }
      }
    } else {
      // No tableRef fallback
      for (let i = pinnedIndex + 1; i < allPinnedColumns.length; i++) {
        offset += allPinnedColumns[i].column.width ?? 120;
      }
    }

    return `${offset}px`;
  }

  getPinnedZIndex(column: ColumnDef, group: ColumnGroup): number {
    if (!column.pinned) return 0;

    const direction = column.pinned;
    const allPinnedColumns: { column: ColumnDef; groupIndex: number }[] = [];
    this.columnGroupsSignal().forEach((grp, groupIndex) => {
      grp.columns.forEach(col => {
        if (col.pinned === direction && (col.visible ?? true)) {
          allPinnedColumns.push({ column: col, groupIndex });
        }
      });
    });

    allPinnedColumns.sort((a, b) => {
      if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
      return this.columnGroupsSignal()[a.groupIndex].columns.indexOf(a.column) - 
             this.columnGroupsSignal()[b.groupIndex].columns.indexOf(b.column);
    });

    let index = allPinnedColumns.findIndex(item => item.column === column);

    if (direction === 'right') {
      // For right, reverse index so rightmost has highest z-index
      index = allPinnedColumns.length - 1 - index;
    }

    return 30 - index;
  }

  getCheckboxColumnOffset(): string {
    return this.enableRowSelection() ? '0' : '';
  }
}

export interface ColumnGroup {
  title: string;
  columns: ColumnDef[];
}

export interface ColumnDef {
  title: string;
  key?: string;
  displayTemplate?: string;
  sortKey?: string;
  alignment?: 'left' | 'center' | 'right';
  type: 'text' | 'date' | 'badge' | 'custom' | 'actions' | 'checkbox';
  pinned?: 'left' | 'right' | null;
  visible?: boolean | null;
  component?: Type<any>;
  textConfig?: TextConfig;
  dateConfig?: DateConfig;
  badgeConfig?: BadgeConfig;
  customConfig?: CustomRendererConfig;
  actionsConfig?: ActionConfig;
  formatter?: (value: any) => any;
  objectFormatter?: (value: any) => any;
  propertyStyle?: (value: any) => any;
  filterConfig?: FilterConfig;
  width?: number;
}

export interface TextConfig {
  textColorClass?: string;
}

export interface DateConfig {
  dateFormat?: string;
  showIcon?: boolean;
}

export interface BadgeConfig {
  properties: BadgeConfigProperty[];
}

export interface BadgeConfigProperty {
  data: string;
  displayText: string;
  backgroundColorClass?: string;
  borderColorClass?: string;
  textColorClass?: string;
  indicatorColorClass?: string;
}

export interface CustomRendererConfig {
  data?: any;
}

export interface ActionConfig {
  iconActions?: IconAction[];
  threeDotMenuActions?: ContextMenuActionConfig[] | null | ((item: any) => ContextMenuActionConfig[]);
  textMenuActions?: ContextMenuActionConfig[] | null;
  components?: Type<any>[];
}

export interface IconAction {
  iconPath: string;
  actionKey: string;
  label?: string;
}

export interface ContextMenuActionConfig {
  iconPath?: string;
  actionKey: string;
  label: string;
}

export interface TableActionEvent {
  actionKey: string;
  item: any;
  data?: any;
}

export interface TableStateEvent {
  searchText: string;
  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  columnFilters?: { [key: string]: { value?: any; min?: any; max?: any; operation: string } };
}

export interface FilterEvent {
  key: string;
  value?: any;
  min?: any;
  max?: any;
  operation: string;
}

export interface FilterConfig {
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select';
  placeholder?: string;
  options?: { value: any; label: string }[];
  dateFormat?: 'mm/dd/yyyy' | 'dd/MM/yyyy';
  operation?: 'contains' | 'exact' | 'greaterThan' | 'lesserThan' | 'equal' | 'notEqual' | 'range';
  enableMinMax?: boolean;
}