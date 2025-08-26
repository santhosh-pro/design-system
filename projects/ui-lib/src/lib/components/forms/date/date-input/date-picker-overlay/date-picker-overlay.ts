import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import {DatePickerComponent, Weekday} from './date-picker/date-picker';

@Component({
  selector: 'ui-date-picker-overlay',
  standalone: true,
  imports: [
    DatePickerComponent
  ],
  templateUrl: './date-picker-overlay.html',
  styleUrl: './date-picker-overlay.scss'
})
export class DatePickerOverlayComponent {

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
