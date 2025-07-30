import {AfterViewInit, Component, input, output, signal} from '@angular/core';
import {ShimmerComponent} from "../../shimmer/shimmer.component";
import {NgClass} from "@angular/common";
import {PaginationComponent, PaginationEvent} from "../../pagination/pagination.component";
import { NoDataTableComponent } from '../no-data-table/no-data-table.component';
import { State } from '../../../core/base-state';

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [
    NoDataTableComponent,
    ShimmerComponent,
    NgClass,
    PaginationComponent
  ],
  templateUrl: './base-table.component.html',
  styleUrl: './base-table.component.scss'
})
export class BaseTableComponent<T> implements AfterViewInit {

  pageSize = input(10);
  state = input<State<any>>();
  isHorizontallyScrollable = input(false);
  itemsPerPage = input(10);

  pageChange = output<PaginationEvent>();

  ngAfterViewInit(): void {
    this.pageChange.emit({pageNumber: 1, pageSize: this.pageSize()});
  }

  onPageChange(event: PaginationEvent) {
    this.pageChange.emit(event);
  }

}

export interface PagingEvent {
  pageNumber: number;
  pageSize: number;
}
