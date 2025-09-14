import { Component, inject } from '@angular/core';
import { MonthYearSelection } from './month-year-selection/month-year-selection';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'ui-month-year-overlay',
  imports: [MonthYearSelection],
  templateUrl: './month-year-overlay.html',
})
export class MonthYearOverlay {
  dialogRef = inject(DialogRef);
  data: {
    selectedDate: Date | null;
    minDate: Date | null;
    maxDate: Date | null;
    allowOnlyPast: boolean;
    allowOnlyFuture: boolean;
  } = inject(DIALOG_DATA);

  onMonthYearSelected($event: Date) {
    this.dialogRef.close($event);
  }
}