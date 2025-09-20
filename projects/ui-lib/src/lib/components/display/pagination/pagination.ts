import {ChangeDetectionStrategy, Component, Input, ElementRef, inject, signal, input, output, model} from '@angular/core';
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
export class Pagination {
  totalItems = input<number>(0);
  pageSizeOptions = input<number[]>([5,10, 25, 50, 100]);
  // Two-way bindable page size using models API
  // Usage: <ui-pagination [(pageSize)]="size"></ui-pagination>
  pageSize = model<number>(25);
  isSimple = input<boolean>(false);

  pageChange = output<PaginationEvent>();
  // Two-way bindable page number using signal models API
  // Usage from parent: <ui-pagination [(pageNumber)]="page"></ui-pagination>
  pageNumber = model<number>(1);

  // UI state for custom dropdown
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  isMenuOpen = signal(false);

  get totalPages(): number {
    const size = this.pageSize() || 1;
    return Math.max(1, Math.ceil(this.totalItems() / size));
  }

  get startItem(): number {
    const size = this.pageSize();
    return this.totalItems() === 0 ? 0 : (this.pageNumber() - 1) * size + 1;
  }

  get endItem(): number {
    const size = this.pageSize();
    return Math.min(this.pageNumber() * size, this.totalItems());
  }

  changePageSize(newSize: number): void {
    // Reflect change via model (for consumers using [(pageSize)])
    this.pageSize.set(newSize);
    this.pageNumber.set(1); // Reset to first page when page size changes
    this.emitPageChange();
    this.closeMenu();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber.set(page);
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
    if (this.pageNumber() < this.totalPages) {
      this.goToPage(this.pageNumber() + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.pageNumber() > 1) {
      this.goToPage(this.pageNumber() - 1);
    }
  }

  emitPageChange(): void {
    this.pageChange.emit({ pageNumber: this.pageNumber(), pageSize: this.pageSize() });
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
