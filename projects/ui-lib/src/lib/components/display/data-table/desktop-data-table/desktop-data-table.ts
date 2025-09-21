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
  effect,
  computed,
  Inject,
  PLATFORM_ID,
  model
} from '@angular/core';
import { TemplateRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Pagination, PaginationEvent } from '../../../display/pagination/pagination';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { DynamicRenderer } from './../dynamic-renderer';
import { ContextMenuButtonAction } from '../../../overlay/context-menu-button/context-menu-button';
import { SortableTable, TableSortEvent } from './../sortable-table';
import { ColumnDef, ColumnGroup, ColumnNode, HeaderCell, TableActionEvent, TableStateEvent, ContextMenuActionConfig, BadgeConfigProperty } from '../data-table-model';
import { SearchField } from '../../../forms/text/search-field/search-field';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { TableCellRenderer } from './../table-cell-renderer/table-cell-renderer';
import { OverlayStore } from '../../../overlay/overlay';
import { MobileFiltersOverlay } from './../mobile-data-table/filters-overlay/filters-overlay';

// Import refactored components

interface RowSelectionEvent {
  selected: boolean;
  item: any;
}
@Component({
  selector: 'ui-desktop-data-table',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicRenderer,
    // Header and controls
    SortableTable,
    SearchField,
    Pagination,
    TableCellRenderer
  ],
  templateUrl: './desktop-data-table.html',
})
export class DesktopDataTable<T> extends BaseControlValueAccessor<TableStateEvent> implements OnInit, AfterViewInit, OnDestroy {

  protected onValueReady(value: TableStateEvent): void {
    this.applyInitialState(value);
    this.stateChange.emit(value);
  }

  @ContentChildren('filter') headerComponents!: QueryList<any>;
  @ViewChild('table', { static: false }) tableRef!: ElementRef;

  // Core Data Inputs
  columnGroups = input.required<ColumnNode[]>();
  data = input<T[]>([]);
  totalCount = input<number>(0);

  // State Integration Inputs
  isLoading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Configuration Inputs
  // Two-way bindable page size for parent control
  pageSize = model<number>(50);
  enableSearch = input<boolean>(true);
  enablePagination = input<boolean>(true);
  // Filters enable/indicator
  enableFilters = input<boolean>(true);
  filtersApplied = input<boolean>(false);
  enableRowSelection = input<boolean>(false);
  enableClickableRows = input<boolean>(false);
  rowSelectionKey = input<string>('id');
  defaultSelectedKeys = input<any[]>([]);
  expandableComponent = input<any | null>(null);
  footerComponent = input<any | null>(null);
  enableHorizontallyScrollable = input<boolean>(true);
  initialValue = input<TableStateEvent>({ searchText: '' });
  showLoadingOnlyInitial = input<boolean>(true);
  // Optional filters template for wrapper projection
  filtersTemplate = input<TemplateRef<any> | null>(null);
  // Control automatic page reset on search/sort/clear
  resetPageOnQueryChange = input<boolean>(true);

  // Outputs
  pageChange = output<PaginationEvent>();
  sortChange = output<TableSortEvent>();
  stateChange = output<TableStateEvent>();
  action = output<TableActionEvent>();
  rowClick = output<T>();
  rowSelectionChange = output<any[]>();
  footerAction = output<TableActionEvent>();
  // Clear filters action
  clearFilters = output<void>();
  // Apply filters action
  applyFilters = output<void>();

  // Allow parent to control container height (e.g., in a dialog). When provided, overrides default viewport-based height.
  containerHeight = input<string | null>(null);

  // Expose current page for two-way binding from parents via [(pageNumber)]
  pageNumber = model<number>(1);

  // Internal Signals
  selectedIds = signal<any[]>([]);
  columnGroupsSignal: WritableSignal<ColumnNode[]> = signal([]);
  headerHeight = signal<number>(0);
  expandedRowIndex = signal<number | null>(null);

  // Local Error State
  private _hasLocalError = signal<boolean>(false);
  private _localErrorMessage = signal<string | null>(null);

  // Track if we've ever had data (for initial load detection)
  private hasEverHadData = signal<boolean>(false);

  // Mobile Responsiveness
  isMobile = signal<boolean>(false);
  private mediaQueryList?: MediaQueryList;
  private updateMobile?: () => void;

  // Computed States - Loading detection
  isInitialLoading = computed(() => {
    // If showLoadingOnlyInitial is false, always show loading when isLoading=true
    if (!this.showLoadingOnlyInitial()) {
      return this.isLoading();
    }

    // For initial load only: show loading spinner when isLoading=true AND (no data OR first time)
    return this.isLoading() && (
      this.data().length === 0 ||
      !this.hasEverHadData()
    );
  });

  isDataLoading = computed(() => {
    // Show existing data during loading for subsequent loads when showLoadingOnlyInitial=true
    return this.showLoadingOnlyInitial() &&
      this.isLoading() &&
      this.data().length > 0 &&
      this.hasEverHadData();
  });

  isErrorState = computed(() => this.hasError() || this._hasLocalError());
  isSuccess = computed(() => !this.isLoading() && !this.isErrorState() && this.columnGroups().length > 0);

  // Template State Logic - Prioritize loading states
  currentState = computed(() => {
    // If table is not configured, show empty
    if (!this.columnGroups() || this.columnGroups().length === 0) {
      return 'empty';
    }

    // PRIORITY 1: Show initial loading spinner (blocks content)
    if (this.isInitialLoading()) {
      return 'initializing';
    }

    // PRIORITY 2: Show data during subsequent loading (no spinner, just data)
    if (this.isDataLoading()) {
      return 'loading';
    }

    // PRIORITY 3: Show error state
    if (this.isErrorState()) {
      return 'error';
    }

    // PRIORITY 4: Show success with data
    if (this.isSuccess() && this.data().length > 0) {
      return 'success';
    }

    // PRIORITY 5: Show empty state
    return 'empty';
  });

  // Change Detection
  private previousDataLength = 0;
  private subscriptions: any[] = [];
  private lastStateChangeTimestamp = 0;
  private readonly debounceTimeMs = 200;
  private itemControlSubscriptions: Subscription[] = [];

  // State Management
  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  searchText: string = '';

  // Reactive Forms
  selectAllControl = new FormControl<boolean>(false, { nonNullable: true });
  itemControls = new Map<T, FormControl<boolean>>();

  constructor(private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object, private overlayStore: OverlayStore) {
    super();

    // Track data changes and initial load state
    effect(() => {
      const dataLength = this.data().length;
      const isLoading = this.isLoading();

      // Only mark as having data if we're not currently loading
      // This prevents false positives during initial load
      if (dataLength > 0 && !isLoading && !this.hasEverHadData()) {
        this.hasEverHadData.set(true);
      }

      // Clear error when data changes and not loading
      if (dataLength !== this.previousDataLength && !isLoading) {
        this.previousDataLength = dataLength;
        this.clearLocalError();
      }
    });

    // Auto-process column groups
    effect(() => {
      const columns = this.columnGroups();
      if (columns?.length > 0) {
        const updatedGroups = columns.map(node => this.cloneNodeWithVisibility(node));
        this.columnGroupsSignal.set(updatedGroups);
      }
    });

    // Initialize default selected IDs only when defaults change or selection is enabled
    effect(() => {
      const enabled = this.enableRowSelection();
      const defaults = this.defaultSelectedKeys();
      if (enabled && defaults && defaults.length > 0 && this.selectedIds().length === 0) {
        this.selectedIds.set([...defaults]);
      }
    });

    // Keep item controls in sync with data when selection is enabled
    effect(() => {
      const enabled = this.enableRowSelection();
      const _data = this.data();
      if (enabled) {
        this.initializeItemControls();
        this.updateItemControls();
        this.updateSelectAllControl();
      }
    });

    // SSR-safe Mobile detection
    if (isPlatformBrowser(this.platformId)) {
      this.mediaQueryList = window.matchMedia('(max-width: 768px)');
      this.updateMobile = () => this.isMobile.set(this.mediaQueryList!.matches);
      this.updateMobile();
      this.mediaQueryList.addEventListener('change', this.updateMobile);
    } else {
      this.isMobile.set(false);
    }
  }

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue) {
      this.applyInitialState(initialValue);
    }

    this.subscriptions.push(
      this.selectAllControl.valueChanges.subscribe((checked) => {
        this.onSelectAllRows(checked);
      })
    );
  }

  ngAfterViewInit(): void {
    this.paginationEvent = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
    this.pageChange.emit(this.paginationEvent);

    const tableStateEvent: TableStateEvent = {
      searchText: '',
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
    };
    this.onValueChange(tableStateEvent);

    // Handle header components
    this.headerComponents.changes.subscribe(() => {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.headerComponents.forEach((component) => {
        if (component.filtersChanged) {
          const sub = component.filtersChanged.subscribe((newFilters: any) => {
            this.onFiltersChanged();
          });
          this.subscriptions.push(sub);
        }
      });
    });

    this.updateHeaderHeight();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.clearItemControlSubscriptions();
    if (this.mediaQueryList && this.updateMobile) {
      this.mediaQueryList.removeEventListener('change', this.updateMobile);
    }
  }

  // State Management
  private setLocalError(error: string): void {
    this._hasLocalError.set(true);
    this._localErrorMessage.set(error);
  }

  private clearLocalError(): void {
    this._hasLocalError.set(false);
    this._localErrorMessage.set(null);
  }

  private applyInitialState(value: TableStateEvent): void {
    if (value) {
      this.searchText = value.searchText ?? '';
      this.paginationEvent = value.paginationEvent;
      if (value.paginationEvent?.pageSize != null) {
        this.pageSize.set(value.paginationEvent.pageSize);
      }
      if (value.paginationEvent?.pageNumber != null) {
        this.pageNumber.set(value.paginationEvent.pageNumber);
      }
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

  // Event Handlers
  onClearFiltersClicked(): void {
    this.clearFilters.emit();
  }
  onSearchTextChanged(event: string | any): void {
    this.searchText = event;
    const shouldReset = this.resetPageOnQueryChange();
    const nextPage = shouldReset ? 1 : this.pageNumber();
    this.paginationEvent = {
      pageNumber: nextPage,
      pageSize: this.paginationEvent?.pageSize ?? this.pageSize()
    };
    if (shouldReset) this.pageNumber.set(1);

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
    if (event.pageNumber != null) {
      this.pageNumber.set(event.pageNumber);
    }
    if (event.pageSize != null && event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
    }
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
    const shouldReset = this.resetPageOnQueryChange();
    const nextPage = shouldReset ? 1 : this.pageNumber();
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: {
        pageNumber: nextPage,
        pageSize: this.paginationEvent?.pageSize ?? this.pageSize()
      },
      tableSortEvent: event,
    };
    if (shouldReset) this.pageNumber.set(1);

    this.sortChange.emit(event);
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onClearSearch(): void {
    this.searchText = '';
    const shouldReset = this.resetPageOnQueryChange();
    const nextPage = shouldReset ? 1 : this.pageNumber();
    this.paginationEvent = {
      pageNumber: nextPage,
      pageSize: this.pageSize()
    };
    if (shouldReset) this.pageNumber.set(1);

    const tableStateEvent: TableStateEvent = {
      searchText: '',
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
    };

    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onRetryLoad(): void {
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
    };
    this.emitTableStateChanged(tableStateEvent);
    this.onValueChange(tableStateEvent);
  }

  onFiltersChanged(): void {
    const tableStateEvent: TableStateEvent = {
      searchText: this.searchText,
      paginationEvent: this.paginationEvent,
      tableSortEvent: this.tableSortEvent,
    };
    this.emitTableStateChanged(tableStateEvent);
  }

  // Advanced filters overlay: right side panel on desktop, fullscreen on small screens
  toggleFilters(tpl?: TemplateRef<any>): void {
    tpl = tpl ?? this.filtersTemplate() ?? undefined as any;
    if (!tpl) return;
    const data = { title: 'Advanced filters', template: tpl };
    const openPromise = this.isMobile()
      ? this.overlayStore.openFullScreen(MobileFiltersOverlay, {
        data,
        backdropOptions: { showBackdrop: true, blur: true }
      })
      : this.overlayStore.openSidePanelRight(MobileFiltersOverlay, {
        widthInPx: 380,
        disableClose: false,
        data,
        backdropOptions: { showBackdrop: true, blur: true }
      });
    openPromise.then(res => {
      if (res && res.action === 'apply') {
        this.applyFilters.emit();
      }
    });
  }

  // Row Selection Methods
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
    this.initializeItemControls();
    this.updateItemControls();
    this.updateSelectAllControl();
    this.rowSelectionChange.emit(this.selectedIds());
    this.cdr.detectChanges();
  }

  private initializeItemControls(): void {
    // Clean up old subscriptions and controls to avoid leaks when data changes
    this.clearItemControlSubscriptions();
    this.itemControls.clear();
    this.data().forEach((item) => {
      const control = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      const sub = control.valueChanges.subscribe((checked) => {
        if (checked !== this.isRowSelected(item)) {
          this.onRowSelectionChange(checked, item);
        }
      });
      this.itemControlSubscriptions.push(sub);
      this.itemControls.set(item, control);
    });
  }

  private updateItemControls(): void {
    this.data().forEach((item) => {
      const control = this.itemControls.get(item);
      if (control) {
        control.setValue(this.isRowSelected(item), { emitEvent: false });
      }
    });
  }

  private updateSelectAllControl(): void {
    const isAllSelected = this.isAllSelected();
    this.selectAllControl.setValue(isAllSelected, { emitEvent: false });
  }

  isSelectAllIndeterminate(): boolean {
    const items = this.data();
    if (!items || items.length === 0) return false;
    const pageIds = items.map((item: any) => this.getItemId(item));
    const selectedOnPage = pageIds.filter(id => this.selectedIds().includes(id)).length;
    return selectedOnPage > 0 && selectedOnPage < pageIds.length;
  }

  isRowSelected(item: any): boolean {
    const id = this.getItemId(item);
    return this.selectedIds().includes(id);
  }

  getItemId(item: any): any {
    const key = this.rowSelectionKey();
    return key.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  isAllSelected(): boolean {
    if (this.data().length === 0) return false;
    return this.data().every((item: any) => this.isRowSelected(item));
  }

  getItemControl(item: T): FormControl<boolean> {
    let control = this.itemControls.get(item);
    if (!control) {
      control = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      const sub = control.valueChanges.subscribe((checked) => {
        if (checked !== this.isRowSelected(item)) {
          this.onRowSelectionChange(checked, item);
        }
      });
      this.itemControlSubscriptions.push(sub);
      this.itemControls.set(item, control);
    }
    return control;
  }

  // Row Actions
  onRowClicked(item: T): void {
    this.rowClick.emit(item);
  }

  onRowExpandedClicked(i: number): void {
    this.expandedRowIndex.set(this.expandedRowIndex() === i ? null : i);
  }

  onActionPerformed(event: TableActionEvent): void {
    this.action.emit(event);
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

  onCellActionPerformed(event: TableActionEvent): void {
    this.action.emit(event);
  }

  onRowActionPerformed(event: TableActionEvent): void {
    this.action.emit(event);
  }

  onFooterActionPerformed(event: TableActionEvent): void {
    this.footerAction.emit(event);
  }

  // Data Processing
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

  // Header Processing
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

  getHeaderRowSpan(): number {
    return this.getMaxDepth();
  }

  // Helper Methods for Template
  getTotalColspan(): number {
    return this.allLeafColumns().length + (this.enableRowSelection() ? 1 : 0) + (this.expandableComponent() ? 1 : 0);
  }

  // Styling & Layout
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
      classes += ' sticky right-0 z-[110] bg-gray-100 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l border-gray-300 w-32 min-w-[128px] max-w-[128px]';
    } else {
      classes += ' ' + this.getColumnWidthClass(cell.node);
    }

    if (this.isColumnGroup(cell.node) && cell.colspan > 1) {
      classes += ' border-r border-gray-300';
    }

    return classes;
  }

  private getAlignmentClass(node: ColumnNode): string {
    const alignment = node.alignment;
    switch (alignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  }

  getFlexJustifyClass(cell: HeaderCell): string {
    const alignment = cell.node.alignment;
    switch (alignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  }

  getFlexJustify(column: ColumnDef): string {
    switch (column.alignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  }

  getColumnWidthClass(node: ColumnNode): string {
    if ('children' in node) return '';

    const column = node as ColumnDef;
    switch (column.type) {
      case 'checkbox': return 'w-12 min-w-[48px] max-w-[48px]';
      case 'actions': return 'w-32 min-w-[128px] max-w-[128px]';
      default: return 'w-40 min-w-[120px] max-w-[200px]';
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

  hasActionColumn(): boolean {
    return this.allLeafColumns().some(col => col.type === 'actions');
  }

  // Mobile Card Helpers
  getColumnTitle(column: ColumnDef): string {
    return column.title;
  }

  // Template Getters
  getState(): 'initializing' | 'loading' | 'success' | 'error' | 'empty' {
    return this.currentState();
  }

  getErrorMessage(): string | null {
    return this.errorMessage() || this._localErrorMessage();
  }

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

  // Accessibility helpers
  getAriaSort(sortKey?: string): 'ascending' | 'descending' | 'none' {
    if (!sortKey || !this.tableSortEvent || !this.tableSortEvent.key) return 'none';
    if (this.tableSortEvent.key === sortKey) {
      const dir = (this.tableSortEvent.direction || '').toString();
      if (dir === 'asc') return 'ascending';
      if (dir === 'desc') return 'descending';
    }
    return 'none';
  }

  private clearItemControlSubscriptions(): void {
    this.itemControlSubscriptions.forEach(sub => sub.unsubscribe());
    this.itemControlSubscriptions = [];
  }
}


