import { Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormsModule } from "@angular/forms";
import {
  DateRangeEvent,
  DateRangePickerComponent,
} from "./date-range-picker/date-range-picker.component";

@Component({
  selector: "app-date-range-picker-overlay",
  standalone: true,
  imports: [DateRangePickerComponent, FormsModule],
  templateUrl: "./date-range-picker-overlay.component.html",
  styleUrl: "./date-range-picker-overlay.component.css",
})
export class DateRangePickerOverlayComponent {
  dialogRef = inject(DialogRef);
  data: {
    selectedRange: DateRangeEvent | null;
    minDate: Date | null;
    maxDate: Date | null;
    allowOnlyPast: boolean;
    allowOnlyFuture: boolean;
    allowToday: boolean;
    minDaysRange: number | null; // Added minDaysRange
    maxDaysRange: number | null; // Added maxDaysRange
  } = inject(DIALOG_DATA);

  onDateRangeSelected(event: DateRangeEvent) {
    this.dialogRef.close(event);
  }
}
