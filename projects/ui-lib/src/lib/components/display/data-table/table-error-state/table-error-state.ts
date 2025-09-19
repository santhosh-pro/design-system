import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-table-error-state',
  standalone: true,
  imports: [],
  templateUrl: './table-error-state.html',
  styleUrl: './table-error-state.css'
})
export class TableErrorState {
colspan = input.required<number>();
  errorMessage = input<string>('Something went wrong while loading your data.');
  retryLoad = output<void>();
}
