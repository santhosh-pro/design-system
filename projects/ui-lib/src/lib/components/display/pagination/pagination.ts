import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ElementRef, inject, signal, input, output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [
    FormsModule,
    NgClass
  ],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class Pagination implements OnChanges {
  totalItems = input<number>(0);
  pageSizeOptions = input<number[]>([5,10, 25, 50, 100]);
  @Input() pageSize: number = 25; // Default page size
  isSimple = input<boolean>(false);

  pageChange = output<PaginationEvent>();
  // Optional two-way binding support: [(pageSize)]
  pageSizeChange = output<number>();

  currentPage: number = 1;
  // Internal state decoupled from @Input to avoid parent reset on change detection
  selectedPageSize: number = this.pageSize;

  // UI state for custom dropdown
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  isMenuOpen = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize'] && typeof this.pageSize === 'number') {
      this.selectedPageSize = this.pageSize;
    }
  }

  get totalPages(): number {
    const size = this.selectedPageSize || 1;
    return Math.max(1, Math.ceil(this.totalItems() / size));
  }

  get startItem(): number {
    const size = this.selectedPageSize;
    return this.totalItems() === 0 ? 0 : (this.currentPage - 1) * size + 1;
  }

  get endItem(): number {
    const size = this.selectedPageSize;
    return Math.min(this.currentPage * size, this.totalItems());
  }

  changePageSize(newSize: number): void {
    this.selectedPageSize = newSize;
    // Reflect change to input (for consumers using [(pageSize)])
    this.pageSizeChange.emit(newSize);
    this.currentPage = 1; // Reset to first page when page size changes
    this.emitPageChange();
    this.closeMenu();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.emitPageChange();
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  emitPageChange(): void {
    this.pageChange.emit({ pageNumber: this.currentPage, pageSize: this.selectedPageSize });
  }

  // Dropdown controls
  toggleMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (!this.hostRef.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }

  // no dynamic repositioning required; menu opens upward by default
}

export interface PaginationEvent {
  pageNumber: number;
  pageSize: number;
}
