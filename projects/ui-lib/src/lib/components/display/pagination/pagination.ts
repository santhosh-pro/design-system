import {Component, Input, input, output} from '@angular/core';
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
})
export class Pagination {
  totalItems = input<number>(0);
  pageSizeOptions = input<number[]>([5,10, 25, 50, 100]);
  @Input() pageSize: number = 25; // Default page size

  pageChange = output<PaginationEvent>();

  currentPage: number = 1;

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize);
  }

  get startItem(): number {
    return this.totalItems() === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems());
  }

  changePageSize(event: string): void {
    const newSize = +event;
    this.pageSize = newSize;
    this.currentPage = 1; // Reset to first page when page size changes
    this.emitPageChange();
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
    this.pageChange.emit({ pageNumber: this.currentPage, pageSize: this.pageSize });
  }
}

export interface PaginationEvent {
  pageNumber: number;
  pageSize: number;
}
