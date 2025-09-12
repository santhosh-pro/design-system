import { Component, inject } from '@angular/core';
import { DateSelection } from './date-selection/date-selection';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Weekday } from '../../date-format';

@Component({
  selector: 'ui-date-overlay',
  imports: [DateSelection],
  templateUrl: './date-overlay.html',
})
export class DateOverlay {
dialogRef = inject(DialogRef);
  data: {
    selectedDate: Date | null;
    minDate: Date | null;
    maxDate: Date | null;
    allowOnlyPast: boolean;
    allowOnlyFuture: boolean;
    disabledDays: Weekday[];
    disabledDates: Date[];
  } = inject(DIALOG_DATA);

  onDateSelected($event: Date) {
    this.dialogRef.close($event);
  }
}
