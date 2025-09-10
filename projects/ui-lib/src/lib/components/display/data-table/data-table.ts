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
  ViewChild,
  OnDestroy
} from '@angular/core';
import { PaginationComponent, PaginationEvent } from '../../display/pagination/pagination';
import { DatePipe } from '@angular/common';
import { StatusBadgeComponent } from '../../feedback/status-badge/status-badge';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
import { MultiSelectDropdownComponent } from '../../forms/select/multi-select-dropdown/multi-select-dropdown';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { resolveTemplateWithObject } from '../../../core/template-resolver';
import { provideNgxMask } from '../../forms/input-mask/ngx-mask.providers';
import { DynamicRendererComponent } from './dynamic-renderer';
import { ContextMenuButtonAction, ContextMenuButtonComponent } from '../../overlay/context-menu-button/context-menu-button';
import { CheckboxComponent } from '../../forms/checkbox/checkbox';
import { TextInputComponent } from '../../forms/text-input/text-input';
import { DateInputComponent } from '../../forms/date/date-input/date-input';
import { AppSvgIconComponent } from "../../misc/app-svg-icon/app-svg-icon";
import { InputDateFormat } from '../../forms/date/date-format';
import { SortableTableDirective, TableSortEvent } from './sortable-table';

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [
    PaginationComponent,
    DatePipe,
    StatusBadgeComponent,
    SortableTableDirective,
    CheckboxComponent,
    FormsModule,
    TextInputComponent,
    DynamicRendererComponent,
    MultiSelectDropdownComponent,
    ReactiveFormsModule,
    DateInputComponent,
    ContextMenuButtonComponent,
    AppSvgIconComponent
  ],
  providers: [provideNgxMask()],
  templateUrl: './data-table.html',
})
export class DataTableComponent<T> extends BaseControlValueAccessor<TableStateEvent> implements OnInit, AfterViewInit, OnDestroy {
  @ContentChildren('filter') headerComponents!: QueryList<any>;
  @ViewChild('table', { static: false }) tableRef!: ElementRef;

  public InputDateFormat = InputDateFormat;

  // Inputs
  columnGroups = input.required<ColumnNode[]>();
  pageSize = input(50);
  enableHorizontallyScrollable = input(true);
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
  enablePagination = input(true);
  footerComponent = input<any>();

  // Outputs
  pageChange = output<PaginationEvent>();
  sortChange = output<TableSortEvent>();
  stateChange = output<TableStateEvent>();
  action = output<TableActionEvent>(); 
  filterChange = output<FilterEvent>();
  rowClick = output<any>(); 
  rowSelectionChange = output<any[]>();
  footerAction = output<TableActionEvent>();

  // Signals
  private internalPageSize: number = this.pageSize();
  selectedIds = signal<any[]>([]);
  columnGroupsSignal: WritableSignal<ColumnNode[]> = signal([]);
  headerHeight = signal(0);

  // Internal state
  private subscriptions: Subscription[] = [];
  private isInitializingFilters = true;
  private lastStateChangeTimestamp = 0;
  private readonly debounceTimeMs = 200;

  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  searchText: string = '';
  columnFilters: { [key: string]: { value?: any; min?: any; max?: any; operation: string } } = {};
  filterControls: { [key: string]: { [prop: string]: FormControl } } = {};

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  // Lifecycle hooks
  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue) {
      this.applyInitialState(initialValue);
    }
    // Initialize column visibility and sync with signal
    const updatedGroups = this.columnGroups().map(node => this.cloneNodeWithVisibility(node));
    this.columnGroupsSignal.set(updatedGroups);
  }

  ngAfterViewInit(): void {
    if (this.enableRowSelection() && this.defaultSelectedKeys().length > 0) {
      this.selectedIds.set([...this.defaultSelectedKeys()]);
      this.rowSelectionChange.emit(this.selectedIds());
    }

    // Initialize filter controls and subscriptions
    this.allLeafColumns().forEach(column => {
      if (column.filterConfig) {
        const filterKey = this.getFilterKey(column);
        if (!this.columnFilters[filterKey]?.value) {
          this.columnFilters[filterKey] = {
            value: column.filterConfig.type === 'select' ? [] : undefined,
            operation: this.columnFilters[filterKey]?.operation ?? this.getDefaultOperation(column.filterConfig.type),
          };
        }
        const control = this.getFilterControl(column, 'value');
        const sub = control.valueChanges.pipe(debounceTime(300)).subscribe(value => {
          if (!this.isInitializingFilters) {
            this.onFilterChanged(value, null, null, column);
          }
        });
        this.subscriptions.push(sub);
      }
    });

    // Initial pagination setup
    this.paginationEvent = {
      pageNumber: 1,
      pageSize: this.internalPageSize,
    };
    this.pageChange.emit(this.paginationEvent);

    // Initial table state
    const tableStateEvent: TableStateEvent = {
      searchText: '',
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters,
    };
    this.onValueChange(tableStateEvent);

    // Subscribe to custom header component filters
    this.headerComponents.forEach((component) => {
      if (component.filtersChanged) {
        const sub = component.filtersChanged.subscribe((newFilters: any) => {
          if (newFilters && Object.keys(newFilters).length > 0) {
            this.columnFilters['custom'] = { value: newFilters, operation: 'custom' };
          } else {
            delete this.columnFilters['custom'];
          }
          const updatedTableStateEvent: TableStateEvent = {
            searchText: this.searchText,
            paginationEvent: this.paginationEvent,
            tableSortEvent: this.tableSortEvent,
            columnFilters: { ...this.columnFilters },
          };
          const filterEvent: FilterEvent = { key: 'custom', value: newFilters, operation: 'custom' };
          this.filterChange.emit(filterEvent);
          this.emitTableStateChanged(updatedTableStateEvent);
        });
        this.subscriptions.push(sub);
      }
    });

    this.updateHeaderHeight();

    // Delay to ensure DOM is ready
    setTimeout(() => {
      this.cdr.detectChanges();
      this.isInitializingFilters = false;
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // State management
  protected onValueReady(value: TableStateEvent): void {
    this.applyInitialState(value);
    this.stateChange.emit(value);
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

  private emitTableStateChanged(tableStateEvent: TableStateEvent): void {
    const now = Date.now();
    if (this.isInitializingFilters || now - this.lastStateChangeTimestamp < this.debounceTimeMs) {
      return;
    }
    this.lastStateChangeTimestamp = now;
    this.stateChange.emit(tableStateEvent);
  }

  // Event handlers
  onSearchTextChanged(event: string | any): void {
    this.searchText = event;
    this.paginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
    };
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onFilterChanged(value: any, min: any, max: any, column: ColumnDef): void {
    const filterKey = this.getFilterKey(column);
    if (!filterKey) {
      return;
    }
    const existingFilter = this.columnFilters[filterKey] || {
      operation: this.getDefaultOperation(column.filterConfig?.type),
    };
    const operation = existingFilter.operation;
    let parsedValue = this.parseFilterValue(value, column.filterConfig?.type);
    let parsedMin = this.parseFilterValue(min, column.filterConfig?.type);
    let parsedMax = this.parseFilterValue(max, column.filterConfig?.type);

    if (operation === 'range') {
      if (parsedMin || parsedMax) {
        this.columnFilters[filterKey] = { min: parsedMin, max: parsedMax, operation };
      } else {
        delete this.columnFilters[filterKey];
      }
    } else {
      if (parsedValue && (Array.isArray(parsedValue) ? parsedValue.length > 0 : true)) {
        this.columnFilters[filterKey] = { value: parsedValue, operation };
      } else {
        delete this.columnFilters[filterKey];
      }
    }

    const filterEvent: FilterEvent = operation === 'range'
      ? { key: filterKey, min: parsedMin, max: parsedMax, operation }
      : { key: filterKey, value: parsedValue, operation };
    this.filterChange.emit(filterEvent);

    this.paginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize,
    };
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: { ...this.columnFilters },
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onFilterOperationChanged(operation: string, column: ColumnDef): void {
    const filterKey = this.getFilterKey(column);
    if (!filterKey) {
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
    this.filterChange.emit(filterEvent);

    this.paginationEvent = {
      pageNumber: 1,
      pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
    };
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
      columnFilters: { ...this.columnFilters }
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onPageChange(event: PaginationEvent): void {
    this.paginationEvent = event;
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: event,
      tableSortEvent: this.tableSortEvent,
      columnFilters: this.columnFilters
    };
    this.pageChange.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onSortChanged(event: TableSortEvent): void {
    this.tableSortEvent = event;
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: {
        pageNumber: 1,
        pageSize: this.paginationEvent?.pageSize ?? this.internalPageSize
      },
      tableSortEvent: event,
      columnFilters: this.columnFilters
    };
    this.sortChange.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onRowSelectionChange(selected: boolean | any, item: any): void {
  const id = this.getItemId(item);
  let updatedIds: any[];
  if (selected) {
    updatedIds = [...this.selectedIds(), id];
  } else {
    updatedIds = this.selectedIds().filter(selectedId => selectedId !== id);
  }
  this.selectedIds.set(updatedIds);
  this.rowSelectionChange.emit(this.selectedIds());
}

  onSelectAllRows(selected: boolean | any): void {
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
}

  onFooterActionPerformed(event: TableActionEvent): void {
    this.footerAction.emit(event);
  }

  // Helper methods
  private cloneNodeWithVisibility(node: ColumnNode): ColumnNode {
    if ('children' in node) {
      return {
        ...node,
        children: node.children.map(child => this.cloneNodeWithVisibility(child))
      };
    } else {
      return {
        ...node,
        visible: node.visible ?? true
      };
    }
  }

  private updateHeaderHeight(): void {
    if (this.tableRef) {
      const headers = this.tableRef.nativeElement.querySelectorAll('thead tr:not(:last-child)');
      let height = 0;
      headers.forEach((tr: HTMLElement) => {
        height += tr.offsetHeight;
      });
      this.headerHeight.set(height);
    }
  }

  getHeaderHeight(): number {
    return this.headerHeight();
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

  private parseFilterValue(value: any, type?: string): any {
    if (type === 'select') {
      if (Array.isArray(value)) {
        return value.map(v => typeof v === 'string' ? v : v?.value).filter(Boolean);
      } else if (value) {
        return [typeof value === 'string' ? value : value?.value].filter(Boolean);
      } else {
        return [];
      }
    } else if (type === 'date') {
      const parsed = value ? new Date(value) : null;
      return this.isValidDate(parsed) ? parsed : null;
    }
    return value;
  }

  private isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  hasFilterConfig(): boolean {
    return this.allLeafColumns().some(column => !!column.filterConfig);
  }

  getDefaultOperation(type?: string): string {
    switch (type) {
      case 'text':
        return 'contains';
      case 'number':
      case 'date':
        return 'equals';
      case 'select':
        return 'equals';
      default:
        return 'contains';
    }
  }

  getFilterOperations(type?: string): { value: string; label: string }[] {
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
      return column.formatter(value);
    } else if (column.objectFormatter) {
      return column.objectFormatter(item);
    } else {
      return value;
    }
  }

 getCellClass(column: ColumnDef): string {
  let classes = this.getAlignmentClass(column);
  
  if (column.type === 'actions') {
    classes += ' sticky right-0 z-[40] bg-white shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-gray-300 w-32 min-w-[128px] max-w-[128px]';
  } else {
    classes += ' ' + this.getColumnWidthClass(column);
  }
  
  return classes;
}

getHeaderThClass(cell: HeaderCell): string {
  let classes = this.getAlignmentClass(cell.node);
  
  if (!this.isColumnGroup(cell.node) && (cell.node as ColumnDef).type === 'actions') {
    classes += ' sticky right-0 z-[110] bg-gray-100 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-gray-300 w-32 min-w-[128px] max-w-[128px]';
  } else {
    classes += ' ' + this.getColumnWidthClass(cell.node);
  }
  
  if (this.isColumnGroup(cell.node) && cell.colspan > 1) {
    classes += ' border-r-2 border-gray-400';
  }
  
  return classes;
}

  private getAlignmentClass(node: ColumnNode): string {
    const alignment = node.alignment;
    switch (alignment) {
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

  getFlexJustifyClass(cell: HeaderCell): string {
    const alignment = cell.node.alignment;
    switch (alignment) {
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

  getFlexJustify(column: ColumnDef): string {
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

getColumnWidthClass(node: ColumnNode): string {
  if ('children' in node) return '';

  const column = node as ColumnDef;
  switch (column.type) {
    case 'checkbox':
      return 'w-12 min-w-[48px] max-w-[48px]';
    case 'actions':
      return 'w-32 min-w-[128px] max-w-[128px]'; // Increased width for better button spacing
    default:
        return 'w-40 min-w-[120px] max-w-[200px]';
  }
}

getTableStyles(): string {
  return `
    /* Custom shadow for sticky elements */
    .shadow-right {
      box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
    }
    
    /* Ensure proper table layout */
    .table-fixed {
      table-layout: fixed;
    }
    
    /* Enhanced hover effects */
    .group:hover .group-hover\\:bg-blue-50 {
      background-color: rgb(239 246 255);
    }
    
    .group:hover .group-hover\\:bg-blue-200 {
      background-color: rgb(191 219 254);
    }
    
    /* Context menu positioning fix */
    app-context-menu-button {
      position: relative;
      z-index: 70;
    }
    
    /* Ensure actions column stays fixed */
    td[class*="actions"] {
      position: sticky;
      right: 0;
      background: inherit;
    }
    
    th[class*="actions"] {
      position: sticky;
      right: 0;
      background: inherit;
    }
    
    /* Better scrollbar styling */
    .overflow-auto::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }
    
    .overflow-auto::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    
    .overflow-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    .overflow-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Fix for border gaps on scroll */
    table {
      border-collapse: separate;
      border-spacing: 0;
    }
    
    /* Ensure consistent border rendering */
    td, th {
      border-style: solid;
      border-color: inherit;
    }
  `;
}

  getBadgeProperty(item: any, column: ColumnDef): BadgeConfigProperty | null {
    const badgeConfigProperties = column.badgeConfig?.properties ?? [];
    let matchedBadgeConfigProperty: BadgeConfigProperty | null = null;
    const value = this.getPropertyValue(item, column);
    badgeConfigProperties.forEach(badgeConfigProperty => {
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
    return actionConfigs.map(action => ({
      iconPath: action.iconPath,
      label: action.label,
      actionKey: action.actionKey
    }));
  }

  onActionClicked(actionKey: string, item: any, mouseEvent: MouseEvent | null): void {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    const tableActionEvent: TableActionEvent = {
      actionKey,
      item
    };
    this.action.emit(tableActionEvent);
  }

  expandedRowIndex = signal<number | null>(null);

  onRowExpandedClicked(i: number): void {
    this.expandedRowIndex.set(this.expandedRowIndex() === i ? null : i);
  }

  onRowClicked(item: any): void {
    this.rowClick.emit(item);
  }

  onCellActionPerformed(event: TableActionEvent): void {
    this.action.emit(event);
  }

  onRowActionPerformed(event: TableActionEvent): void {
    this.action.emit(event);
  }

  isRowSelected(item: any): boolean {
  const id = this.getItemId(item);
  return this.selectedIds().includes(id);
}

  private getItemId(item: any): any {
    const key = this.rowSelectionKey();
    return key.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  isAllSelected(): boolean {
    if (this.data().length === 0) return false;
    return this.data().every((item: any) => this.isRowSelected(item));
  }

  // Nested header utilities
  getMaxDepth(): number {
    const nodes = this.columnGroupsSignal();
    let max = 1;
    const recurse = (node: ColumnNode, depth: number) => {
      if ('children' in node && node.children.length > 0) {
        node.children.forEach(child => recurse(child, depth + 1));
      } else {
        max = Math.max(max, depth);
      }
    };
    nodes.forEach(node => recurse(node, 1));
    return max;
  }

  getHeaderLevels(): number[] {
    return Array.from({ length: this.getMaxDepth() }, (_, i) => i);
  }

  allLeafColumns(): ColumnDef[] {
    const leaves: ColumnDef[] = [];
    const traverse = (node: ColumnNode) => {
      if ('children' in node) {
        node.children.forEach(traverse);
      } else if (node.visible ?? true) {
        leaves.push(node);
      }
    };
    this.columnGroupsSignal().forEach(traverse);
    return leaves;
  }

  private getLeafCount(node: ColumnNode): number {
    if (!('children' in node)) return (node.visible ?? true) ? 1 : 0;
    return node.children.reduce((sum, child) => sum + this.getLeafCount(child), 0);
  }

  getHeaderCellsAtLevel(level: number): HeaderCell[] {
    const cells: HeaderCell[] = [];
    const maxDepth = this.getMaxDepth();
    const traverse = (node: ColumnNode, currentLevel: number) => {
      if (currentLevel === level) {
        const isGroup = 'children' in node;
        const colspan = this.getLeafCount(node);
        let rowspan = 1;
        if (!isGroup) {
          rowspan = maxDepth - currentLevel;
        }
        if (colspan > 0) {
          cells.push({
            title: node.title,
            colspan,
            rowspan,
            node,
            sortKey: isGroup ? undefined : node.sortKey,
            alignment: node.alignment
          });
        }
      } else if ('children' in node) {
        node.children.forEach(child => traverse(child, currentLevel + 1));
      }
    };
    this.columnGroupsSignal().forEach(node => traverse(node, 0));
    return cells;
  }

  isColumnGroup(node: ColumnNode): node is ColumnGroup {
    return 'children' in node;
  }

  hasActionColumn(): boolean {
    return this.allLeafColumns().some(col => col.type === 'actions');
  }

  getHeaderRowSpan(): number {
    return this.getMaxDepth();
  }
}

// Interfaces and types
export type ColumnNode = ColumnDef | ColumnGroup;

export interface ColumnGroup {
  title: string;
  children: ColumnNode[];
  alignment?: 'left' | 'center' | 'right';
}

export interface HeaderCell {
  title: string;
  colspan: number;
  rowspan: number;
  node: ColumnNode;
  sortKey?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ColumnDef {
  title: string;
  key?: string;
  displayTemplate?: string;
  sortKey?: string;
  alignment?: 'left' | 'center' | 'right';
  type: 'text' | 'date' | 'badge' | 'custom' | 'actions' | 'checkbox';
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
  searchText?: string;
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