import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChildren, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, TemplateRef, Type, ViewChild, ChangeDetectorRef, input, output, signal, computed, effect, model } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Pagination, PaginationEvent } from '../../../display/pagination/pagination';
import { TableCellRenderer } from '../table-cell-renderer/table-cell-renderer';
import { DynamicRenderer } from '../dynamic-renderer';
import { ContextMenuButtonAction } from '../../../overlay/context-menu-button/context-menu-button';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { TableSortEvent } from '../sortable-table';
import { SearchField } from '../../../forms/text/search-field/search-field';
import { OverlayStore } from '../../../overlay/overlay';
import { MobileFiltersOverlay } from './filters-overlay/filters-overlay';
import { ColumnDef, ColumnNode, ContextMenuActionConfig, TableActionEvent, TableStateEvent } from '../desktop-data-table/desktop-data-table';

@Component({
  selector: 'ui-mobile-data-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Pagination, TableCellRenderer, DynamicRenderer, SearchField],
  templateUrl: './mobile-data-table.html'
})
export class MobileDataTable<T> extends BaseControlValueAccessor<TableStateEvent> implements OnInit, AfterViewInit, OnDestroy {
  // Inputs align with desktop DataTable for API parity
  columnGroups = input.required<ColumnNode[]>();
  data = input<T[]>([]);
  totalCount = input<number>(0);

  isLoading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);

  pageSize = model<number>(50);
  enableSearch = input<boolean>(true);
  enablePagination = input<boolean>(true);
  // Mobile enhancement: when true, pagination bar renders even if `enablePagination` is false
  alwaysShowPagination = input<boolean>(true);
  // Filters enable/indicator
  enableFilters = input<boolean>(true);
  filtersApplied = input<boolean>(false);
  enableRowSelection = input<boolean>(false);
  enableClickableRows = input<boolean>(false);
  rowSelectionKey = input<string>('id');
  defaultSelectedKeys = input<any[]>([]);
  expandableComponent = input<any | null>(null);
  footerComponent = input<any | null>(null);
  initialValue = input<TableStateEvent>({ searchText: '' });
  showLoadingOnlyInitial = input<boolean>(true);
  filtersTemplate = input<TemplateRef<any> | null>(null);
  // Mobile: constrain height so only content scrolls
  mobileScrollMaxHeight = input<string>('80dvh');
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
  clearFilters = output<void>();
  applyFilters = output<void>();

  // Two-way page number for parent control
  pageNumber = model<number>(1);

  // Local state
  selectedIds = signal<any[]>([]);
  private previousDataLength = 0;
  private hasEverHadData = signal<boolean>(false);
  searchText = '';
  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
  private lastStateChangeTimestamp = 0;
  private readonly debounceTimeMs = 200;
  expandedRowIndex: number = -1;
  @ViewChild('root', { static: false }) rootEl!: ElementRef<HTMLElement>;

  // Internal scroll layout: no viewport-fixed metrics needed

  // Filters UI state (mobile-only)
  filtersExpanded = signal<boolean>(false);

  selectAllControl = new FormControl<boolean>(false, { nonNullable: true });
  itemControls = new Map<T, FormControl<boolean>>();

  constructor(private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object, private overlayStore: OverlayStore) {
    super();

    effect(() => {
      const dataLength = this.data().length;
      const isLoading = this.isLoading();
      if (dataLength > 0 && !isLoading && !this.hasEverHadData()) {
        this.hasEverHadData.set(true);
      }
      if (dataLength !== this.previousDataLength && !isLoading) {
        this.previousDataLength = dataLength;
      }
    });

    // Sync default selections
    effect(() => {
      if (this.enableRowSelection()) {
        const defaults = this.defaultSelectedKeys();
        if (defaults && defaults.length && this.selectedIds().length === 0) {
          this.selectedIds.set([...defaults]);
        }
        this.initializeItemControls();
        this.updateItemControls();
        this.updateSelectAllControl();
      }
    });
  }

  protected onValueReady(value: TableStateEvent): void {
    this.applyInitialState(value);
    this.stateChange.emit(value);
  }

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue) this.applyInitialState(initialValue);
    this.selectAllControl.valueChanges.subscribe((checked) => this.onSelectAllRows(!!checked));
  }

  ngAfterViewInit(): void {
    this.paginationEvent = { pageNumber: this.pageNumber(), pageSize: this.pageSize() };
    const state: TableStateEvent = { searchText: '', paginationEvent: this.paginationEvent, tableSortEvent: this.tableSortEvent };
    this.pageChange.emit(this.paginationEvent);
    this.emitTableStateChanged(state);
    this.onValueChange(state);
    setTimeout(() => this.cdr.detectChanges());

    // No viewport-fixed listeners required; scrolling is contained within the component
  }

  ngOnDestroy(): void {
    // Nothing to clean up for viewport-fixed listeners
  }

  // API parity helpers
  onSearchTextChanged(event: string | any): void {
    this.searchText = event;
    const shouldReset = this.resetPageOnQueryChange();
    const nextPage = shouldReset ? 1 : this.pageNumber();
    this.paginationEvent = { pageNumber: nextPage, pageSize: this.paginationEvent?.pageSize ?? this.pageSize() };
    if (shouldReset) this.pageNumber.set(1);
    const state: TableStateEvent = { searchText: this.searchText, paginationEvent: this.paginationEvent, tableSortEvent: this.tableSortEvent };
    this.emitTableStateChanged(state);
    this.onValueChange(state);
  }

  onPageChange(event: PaginationEvent): void {
    this.paginationEvent = event;
    if (event.pageNumber != null) {
      this.pageNumber.set(event.pageNumber);
    }
    if (event.pageSize != null && event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
    }
    const state: TableStateEvent = { searchText: this.searchText, paginationEvent: event, tableSortEvent: this.tableSortEvent };
    this.pageChange.emit(event);
    this.emitTableStateChanged(state);
    this.onValueChange(state);
  }

  onRetryLoad(): void {
    const state: TableStateEvent = { searchText: this.searchText, paginationEvent: this.paginationEvent, tableSortEvent: this.tableSortEvent };
    this.emitTableStateChanged(state);
    this.onValueChange(state);
  }

  onRowClicked(item: T): void { if (this.enableClickableRows()) this.rowClick.emit(item); }

  // Selection
  private getItemId(item: any): any {
    const key = this.rowSelectionKey();
    return key.split('.').reduce((acc, part) => acc && (acc as any)[part], item);
  }

  isRowSelected(item: any): boolean { return this.selectedIds().includes(this.getItemId(item)); }

  onRowSelectionChange(selected: boolean, item: T): void {
    const id = this.getItemId(item);
    const next = selected ? [...this.selectedIds(), id] : this.selectedIds().filter(x => x !== id);
    this.selectedIds.set(next);
    this.updateItemControls();
    this.updateSelectAllControl();
    this.rowSelectionChange.emit(this.selectedIds());
    this.cdr.detectChanges();
  }

  onSelectAllRows(selected: boolean): void {
    const pageIds = this.data().map(d => this.getItemId(d as any));
    const next = selected ? Array.from(new Set([...this.selectedIds(), ...pageIds])) : this.selectedIds().filter(id => !pageIds.includes(id));
    this.selectedIds.set(next);
    this.initializeItemControls();
    this.updateItemControls();
    this.updateSelectAllControl();
    this.rowSelectionChange.emit(this.selectedIds());
    this.cdr.detectChanges();
  }

  getItemControl(item: T): FormControl<boolean> {
    let c = this.itemControls.get(item);
    if (!c) {
      c = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      c.valueChanges.subscribe(v => { if (v !== this.isRowSelected(item)) this.onRowSelectionChange(!!v, item); });
      this.itemControls.set(item, c);
    }
    return c;
  }

  private initializeItemControls(): void {
    this.itemControls.clear();
    this.data().forEach(item => {
      const c = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      c.valueChanges.subscribe(v => { if (v !== this.isRowSelected(item)) this.onRowSelectionChange(!!v, item); });
      this.itemControls.set(item, c);
    });
  }
  private updateItemControls(): void { this.data().forEach(item => this.itemControls.get(item)?.setValue(this.isRowSelected(item), { emitEvent: false })); }
  private updateSelectAllControl(): void {
    const items = this.data();
    const allSelected = items.length > 0 && items.every(i => this.isRowSelected(i));
    this.selectAllControl.setValue(allSelected, { emitEvent: false });
  }
  isSelectAllIndeterminate(): boolean {
    const items = this.data();
    if (!items || items.length === 0) return false;
    const ids = items.map(i => this.getItemId(i as any));
    const selectedOnPage = ids.filter(id => this.selectedIds().includes(id)).length;
    return selectedOnPage > 0 && selectedOnPage < ids.length;
  }

  // Actions
  onActionPerformed(evt: TableActionEvent) { this.action.emit(evt); }
  onActionClicked(actionKey: string, item: any, mouseEvent: MouseEvent | null) {
    if (mouseEvent) mouseEvent.stopPropagation();
    this.action.emit({ actionKey, item });
  }

  // Columns (flatten leaves)
  allLeafColumns(): ColumnDef[] {
    const leaves: ColumnDef[] = [];
    const traverse = (node: ColumnNode) => {
      if ('children' in node) {
        node.children.forEach(traverse);
      } else {
        // Include column if visible OR explicitly marked as mobileOnly via customConfig.data.mobileOnly
        const col = node as ColumnDef as any;
        const isVisible = (col.visible ?? true) as boolean;
        const isMobileOnly = !!col?.customConfig?.data?.mobileOnly;
        if (isVisible || isMobileOnly) {
          leaves.push(node);
        }
      }
    };
    this.columnGroups().forEach(traverse);
    return leaves;
  }

  private displayColumns(): ColumnDef[] {
    return this.allLeafColumns().filter(c => c.type !== 'checkbox' && c.type !== 'actions');
  }

  getPrimaryColumn(): ColumnDef | null {
    const cols = this.displayColumns();
    if (cols.length === 0) return null;
    // Prefer a text column if present
    const text = cols.find(c => c.type === 'text');
    return text ?? cols[0];
  }

  getDetailColumns(): ColumnDef[] {
    const primary = this.getPrimaryColumn();
    const summary = this.getMobileSummaryColumn();
    return this.displayColumns().filter(c => c !== primary && c !== summary);
  }

  getActionColumn(): ColumnDef | null {
    return this.allLeafColumns().find(c => c.type === 'actions') ?? null;
  }

  private applyInitialState(value: TableStateEvent): void {
    if (value) {
      this.searchText = value.searchText ?? '';
      this.paginationEvent = value.paginationEvent;
      this.tableSortEvent = value.tableSortEvent;
    }
  }
  private emitTableStateChanged(state: TableStateEvent): void {
    const now = Date.now();
    if (now - this.lastStateChangeTimestamp < this.debounceTimeMs) return;
    this.lastStateChangeTimestamp = now;
    this.stateChange.emit(state);
  }

  getContextMenuActions(actions: ContextMenuActionConfig[] | ((item: any) => ContextMenuActionConfig[]) | null | undefined, item: any): ContextMenuButtonAction[] {
    let actionConfigs: ContextMenuActionConfig[] = [];
    if (typeof actions === 'function') actionConfigs = actions(item); else if (actions) actionConfigs = actions;
    return actionConfigs.map(a => ({ iconPath: a.iconPath, label: a.label, actionKey: a.actionKey }));
  }

  // Mobile-only helpers
  getMobileSummaryColumn(): ColumnDef | null {
    const cols = this.displayColumns();
    const primary = this.getPrimaryColumn();
    // Prefer a column explicitly marked as mobile summary
    const flagged = cols.find(c => (c as any)?.customConfig?.data?.mobileSummary === true);
    if (flagged && flagged !== primary) return flagged;
    // Otherwise pick the first text column that's not primary
    const fallback = cols.find(c => c.type === 'text' && c !== primary);
    return fallback ?? null;
  }

  getExpandableDetailColumns(): ColumnDef[] {
    // All display columns except the primary. We allow the summary column to appear in expanded details as well to show "all fields".
    const primary = this.getPrimaryColumn();
    return this.displayColumns().filter(c => c !== primary);
  }

  hasDetailsToExpand(): boolean {
    return this.getExpandableDetailColumns().length > 0 || !!this.expandableComponent();
  }

  // No fixed header/pagination calculations needed

  toggleFilters(): void {
    const tpl = this.filtersTemplate();
    if (!tpl) return;
    const data = { title: 'Advanced filters', template: tpl };
    const openPromise = (isPlatformBrowser(this.platformId) && window.matchMedia('(max-width: 768px)').matches)
      ? this.overlayStore.openFullScreen(MobileFiltersOverlay, { data, backdropOptions: { showBackdrop: true, blur: true } })
      : this.overlayStore.openSidePanelRight(MobileFiltersOverlay, { widthInPx: 380, disableClose: false, data, backdropOptions: { showBackdrop: true, blur: true } });
    openPromise.then(res => {
      if (res && res.action === 'apply') {
        this.applyFilters.emit();
      }
    });
  }

  onClearFiltersClicked(): void {
    this.clearFilters.emit();
  }
}
