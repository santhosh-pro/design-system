import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';
import { MultiDateSelection } from './multi-date-selection/multi-date-selection';
import { Weekday } from '../../date-format';

@Component({
  selector: 'ui-multi-date-overlay',
  standalone: true,
  imports: [MultiDateSelection, FormsModule],
  templateUrl: './multi-date-overlay.html',
})
export class MultiDateOverlay {
  dialogRef = inject(DialogRef);
  data: {
    selectedDates: Date[];
    minDate: Date | null;
    maxDate: Date | null;
    allowOnlyPast: boolean;
    allowOnlyFuture: boolean;
    disabledDays: Weekday[];
    disabledDates: Date[];
  } = inject(DIALOG_DATA);

  onDateSelected(dates: Date[]) {
    this.dialogRef.close(dates);
  }
}