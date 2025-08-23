import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateRangeEvent, DateRangeInputComponent } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-date-range-picker-demo',
  imports: [DateRangeInputComponent, ReactiveFormsModule],
  templateUrl: './date-range-picker-demo.html',
  styleUrl: './date-range-picker-demo.css'
})
export class DateRangePickerDemo {
  minDate = new Date(2025, 0, 1); // Jan 1, 2025
  maxDate = new Date(2025, 11, 31); // Dec 31, 2025
  form = new FormGroup({
    dateRange: new FormControl<DateRangeEvent | null>(null),
  });

  ngOnInit() {
    this.form.controls.dateRange.valueChanges.subscribe((value) => {
      console.log("User changed date range:", value);
    });
  }

  setProgrammaticRange() {
    this.form.controls.dateRange.setValue({
      startDate: new Date(2025, 5, 1), // June 1, 2025
      endDate: new Date(2025, 5, 7), // June 7, 2025
    });
  }
}
