import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-table-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './table-empty-state.html',
  styleUrl: './table-empty-state.css'
})
export class TableEmptyState {
colspan = input.required<number>();
  searchText = input<string>('');
  enableSearch = input<boolean>(true);
  clearSearch = output<void>();
}
