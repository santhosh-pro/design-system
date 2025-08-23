import { Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormsModule } from "@angular/forms";
import { DateRangeEvent, DateRangePickerComponent } from "./date-range-picker/date-range-picker.component";

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
    minDaysRange: number | null;
    maxDaysRange: number | null;
  } = inject(DIALOG_DATA);

  onDateRangeSelected(event: DateRangeEvent) {
    if (event.startDate && event.endDate) {
      this.dialogRef.close(event);
    } else {
      console.warn("Incomplete date range. Please select both start and end dates.");
    }
  }
}