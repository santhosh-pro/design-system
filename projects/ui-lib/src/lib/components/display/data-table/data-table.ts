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
  OnDestroy,
  effect
} from '@angular/core';
import { Pagination, PaginationEvent } from '../../display/pagination/pagination';
import { DatePipe } from '@angular/common';
import { StatusBadge } from '../../feedback/status-badge/status-badge';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
import { DynamicRenderer } from './dynamic-renderer';
import { ContextMenuButtonAction, ContextMenuButton } from '../../overlay/context-menu-button/context-menu-button';
import { AppSvgIcon } from "../../misc/app-svg-icon/app-svg-icon";
import { SortableTable, TableSortEvent } from './sortable-table';
import { SearchField } from '../../forms/text/search-field/search-field';
import { resolveTemplateWithObject } from '../../../core/template-resolver';

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [
    Pagination,
    DatePipe,
    StatusBadge,
    SortableTable,
    FormsModule,
    ReactiveFormsModule,
    DynamicRenderer,
    ContextMenuButton,
    AppSvgIcon,
    SearchField
  ],
  templateUrl: './data-table.html',
})
export class DataTable<T> extends BaseControlValueAccessor<TableStateEvent> implements OnInit, AfterViewInit, OnDestroy {
  @ContentChildren('filter') headerComponents!: QueryList<any>;
  @ViewChild('table', { static: false }) tableRef!: ElementRef;

  // Inputs
  columnGroups = input.required<ColumnNode[]>();
  pageSize = input(50);
  enableHorizontallyScrollable = input(true);
  enableClickableRows = input(false);
  expandableComponent = input<any>();
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
  rowClick = output<any>(); 
  rowSelectionChange = output<any[]>();
  footerAction = output<TableActionEvent>();

  // Signals
  private internalPageSize: number = this.pageSize();
  selectedIds = signal<any[]>([]);
  columnGroupsSignal: WritableSignal<ColumnNode[]> = signal([]);
  headerHeight = signal(0);

  // Internal state
  private subscriptions: any[] = [];
  private lastStateChangeTimestamp = 0;
  private readonly debounceTimeMs = 200;

  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  searchText: string = '';

  // Reactive Forms
  selectAllControl = new FormControl<boolean>(false, { nonNullable: true });
  itemControls = new Map<T, FormControl<boolean>>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
    // Effect to react to data changes
    effect(() => {
      this.data(); // Access data to trigger effect
      this.initializeItemControls();
      this.updateSelectAllControl();
      this.cdr.detectChanges();
    });
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

    // Subscribe to selectAllControl changes
    this.subscriptions.push(
      this.selectAllControl.valueChanges.subscribe((checked) => {
        this.onSelectAllRows(checked);
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.enableRowSelection() && this.defaultSelectedKeys().length > 0) {
      this.selectedIds.set([...this.defaultSelectedKeys()]);
      this.initializeItemControls();
      this.updateItemControls();
      this.updateSelectAllControl();
      this.rowSelectionChange.emit(this.selectedIds());
    }

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
    };
    this.onValueChange(tableStateEvent);

    // Subscribe to custom header component actions
    this.headerComponents.forEach((component) => {
      if (component.filtersChanged) {
        const sub = component.filtersChanged.subscribe((newFilters: any) => {
          const updatedTableStateEvent: TableStateEvent = {
            searchText: this.searchText,
            paginationEvent: this.paginationEvent,
            tableSortEvent: this.tableSortEvent,
          };
          this.emitTableStateChanged(updatedTableStateEvent);
        });
        this.subscriptions.push(sub);
      }
    });

    this.updateHeaderHeight();

    // Delay to ensure DOM is ready
    setTimeout(() => {
      this.cdr.detectChanges();
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
    }
  }

  private emitTableStateChanged(tableStateEvent: TableStateEvent): void {
    const now = Date.now();
    if (now - this.lastStateChangeTimestamp < this.debounceTimeMs) {
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
    };
    this.sortChange.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onRowSelectionChange(selected: boolean, item: T): void {
    const id = this.getItemId(item);
    let updatedIds: any[];
    if (selected) {
      updatedIds = [...this.selectedIds(), id];
    } else {
      updatedIds = this.selectedIds().filter(selectedId => selectedId !== id);
    }
    this.selectedIds.set(updatedIds);
    this.updateItemControls();
    this.updateSelectAllControl();
    this.rowSelectionChange.emit(this.selectedIds());
    this.cdr.detectChanges();
  }

  onSelectAllRows(selected: boolean): void {
    let updatedIds: any[];
    if (selected) {
      const newIds = this.data().map((item: any) => this.getItemId(item)).filter((id: any) => !this.selectedIds().includes(id));
      updatedIds = [...this.selectedIds(), ...newIds];
    } else {
      const currentPageIds = this.data().map((item: any) => this.getItemId(item));
      updatedIds = this.selectedIds().filter(id => !currentPageIds.includes(id));
    }
    this.selectedIds.set(updatedIds);
    this.initializeItemControls(); // Reinitialize to ensure all controls are created
    this.updateItemControls();
    this.updateSelectAllControl();
    this.rowSelectionChange.emit(this.selectedIds());
    this.cdr.detectChanges();
  }

  private initializeItemControls(): void {
    this.itemControls.clear(); // Clear existing controls to avoid duplicates
    this.data().forEach((item) => {
      const control = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      control.valueChanges.subscribe((checked) => {
        if (checked !== this.isRowSelected(item)) {
          this.onRowSelectionChange(checked, item);
        }
      });
      this.itemControls.set(item, control);
    });
  }

  private updateItemControls(): void {
    this.data().forEach((item) => {
      const control = this.itemControls.get(item);
      if (control) {
        control.setValue(this.isRowSelected(item), { emitEvent: false });
      } else {
        // Create control if it doesn't exist
        const newControl = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
        newControl.valueChanges.subscribe((checked) => {
          if (checked !== this.isRowSelected(item)) {
            this.onRowSelectionChange(checked, item);
          }
        });
        this.itemControls.set(item, newControl);
      }
    });
  }

  private updateSelectAllControl(): void {
    const isAllSelected = this.isAllSelected();
    this.selectAllControl.setValue(isAllSelected, { emitEvent: false });
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
      const headers = this.tableRef.nativeElement.querySelectorAll('thead tr');
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
        return 'w-32 min-w-[128px] max-w-[128px]';
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

  protected getItemControl(item: T): FormControl<boolean> {
    let control = this.itemControls.get(item);
    if (!control) {
      control = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      control.valueChanges.subscribe((checked) => {
        if (checked !== this.isRowSelected(item)) {
          this.onRowSelectionChange(checked, item);
        }
      });
      this.itemControls.set(item, control);
    }
    return control;
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
}