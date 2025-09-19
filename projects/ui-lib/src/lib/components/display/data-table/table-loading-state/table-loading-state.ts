import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-table-loading-state',
  standalone: true,
  imports: [],
  templateUrl: './table-loading-state.html',
  styleUrl: './table-loading-state.css'
})
export class TableLoadingState {
  colspan = input.required<number>();
  title = input<string>('Loading...');
  subtitle = input<string>('Fetching your records');
}
