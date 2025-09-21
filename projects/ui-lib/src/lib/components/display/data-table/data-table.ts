import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, TemplateRef, input, output, signal, model } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MobileDataTable } from './mobile-data-table/mobile-data-table';
import { PaginationEvent } from '../pagination/pagination';
import { TableSortEvent } from './sortable-table';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
import { ColumnNode, DesktopDataTable, TableActionEvent, TableStateEvent } from './desktop-data-table/desktop-data-table';

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [CommonModule, DesktopDataTable, MobileDataTable],
  templateUrl: './data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTable<T> extends BaseControlValueAccessor<TableStateEvent> {
  // Mirror DataTable API
  columnGroups = input.required<ColumnNode[]>();
  data = input<T[]>([]);
  totalCount = input<number>(0);

  isLoading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);

  pageSize = model<number>(50);
  enableSearch = input<boolean>(true);
  enablePagination = input<boolean>(true);
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
  resetPageOnQueryChange = input<boolean>(true);

  // Projected filters support
  filtersTemplate = input<TemplateRef<any> | null>(null);

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

  isMobile = signal(false);
  // Expose pageNumber for parent; propagate to underlying table components
  pageNumber = model<number>(1);
  private cvaValue = signal<TableStateEvent | null>(null);
  private mediaQueryList?: MediaQueryList;
  private updateMobile?: () => void;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    super();
    if (isPlatformBrowser(platformId)) {
      this.mediaQueryList = window.matchMedia('(max-width: 1024px)'); // tablet and below
      this.updateMobile = () => this.isMobile.set(this.mediaQueryList!.matches);
      this.updateMobile();
      this.mediaQueryList.addEventListener('change', this.updateMobile);
    }
  }

  protected onValueReady(value: TableStateEvent): void {
    // Called when form control provides initial value
    this.cvaValue.set(value);
    this.stateChange.emit(value);
  }
}
