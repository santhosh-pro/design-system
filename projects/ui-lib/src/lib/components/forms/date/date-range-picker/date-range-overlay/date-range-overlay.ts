import { Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormsModule } from "@angular/forms";
import { DateRangeEvent, DateRangeSelection } from "./date-range-selection/date-range-selection";

@Component({
  selector: "ui-date-range-overlay",
  standalone: true,
  imports: [DateRangeSelection, FormsModule],
  templateUrl: "./date-range-overlay.html",
})
export class DateRangeOverlay {
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