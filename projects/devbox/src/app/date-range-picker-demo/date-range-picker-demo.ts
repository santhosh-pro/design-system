import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card';
import { DocIoList } from '../core/doc-io-list/doc-io-list';
import { CommonModule } from '@angular/common';
import { DateRangeEvent, DateRangeInputComponent, InputDateFormat } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-date-range-input-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateRangeInputComponent, DemoCard, DocIoList],
  templateUrl: './date-range-picker-demo.html',
})
export class DateRangePickerDemo {
  // Form controls for each variant
  basicControl = new FormControl<DateRangeEvent | null>(null);
  iconFullWidthControl = new FormControl<DateRangeEvent | null>({
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-08-15'),
  });
  pastOnlyControl = new FormControl<DateRangeEvent | null>(null);
  futureOnlyControl = new FormControl<DateRangeEvent | null>(null);
  boundedControl = new FormControl<DateRangeEvent | null>(null);

  // Demo files for code viewer
  basicFiles = signal<DemoFile[]>([
    {
      name: 'basic-demo.component.html',
      language: 'html',
      code: `<app-date-range-input
  [label]="'Select Date Range'"
  [formControl]="basicControl"
  (valueChange)="onValueChange($event)">
</app-date-range-input>`,
    },
    {
      name: 'basic-demo.component.ts',
      language: 'ts',
      code: `basicControl = new FormControl<DateRangeEvent | null>(null);
onValueChange(event: DateRangeEvent | null) {
  console.log('Value changed:', event);
}`,
    },
  ]);

  iconFullWidthFiles = signal<DemoFile[]>([
    {
      name: 'icon-full-width-demo.component.html',
      language: 'html',
      code: `<app-date-range-input
  [label]="'Trip Duration'"
  [iconSrc]="'calendar'"
  [fullWidth]="true"
  [inputDateFormat]="InputDateFormat.mmddyyyy"
  [formControl]="iconFullWidthControl"
  (valueChange)="onValueChange($event)">
</app-date-range-input>`,
    },
    {
      name: 'icon-full-width-demo.component.ts',
      language: 'ts',
      code: `import { InputDateFormat } from './date-range-input.component';
iconFullWidthControl = new FormControl<DateRangeEvent | null>({
  startDate: new Date('2025-08-01'),
  endDate: new Date('2025-08-15'),
});
onValueChange(event: DateRangeEvent | null) {
  console.log('Value changed:', event);
}`,
    },
  ]);

  pastOnlyFiles = signal<DemoFile[]>([
    {
      name: 'past-only-demo.component.html',
      language: 'html',
      code: `<app-date-range-input
  [label]="'Historical Data Range'"
  [showErrorSpace]="true"
  [allowOnlyPast]="true"
  [allowToday]="true"
  [formControl]="pastOnlyControl"
  (valueChange)="onValueChange($event)">
</app-date-range-input>`,
    },
    {
      name: 'past-only-demo.component.ts',
      language: 'ts',
      code: `pastOnlyControl = new FormControl<DateRangeEvent | null>(null);
onValueChange(event: DateRangeEvent | null) {
  console.log('Value changed:', event);
}`,
    },
  ]);

  futureOnlyFiles = signal<DemoFile[]>([
    {
      name: 'future-only-demo.component.html',
      language: 'html',
      code: `<app-date-range-input
  [label]="'Future Event Range'"
  [allowOnlyFuture]="true"
  [minDaysRange]="3"
  [maxDaysRange]="30"
  [formControl]="futureOnlyControl"
  (valueChange)="onValueChange($event)">
</app-date-range-input>`,
    },
    {
      name: 'future-only-demo.component.ts',
      language: 'ts',
      code: `futureOnlyControl = new FormControl<DateRangeEvent | null>(null);
onValueChange(event: DateRangeEvent | null) {
  console.log('Value changed:', event);
}`,
    },
  ]);

  boundedFiles = signal<DemoFile[]>([
    {
      name: 'bounded-demo.component.html',
      language: 'html',
      code: `<app-date-range-input
  [label]="'Bounded Date Range'"
  [showDatePickerIcon]="false"
  [minDate]="minDate"
  [maxDate]="maxDate"
  [formControl]="boundedControl"
  (valueChange)="onValueChange($event)">
</app-date-range-input>`,
    },
    {
      name: 'bounded-demo.component.ts',
      language: 'ts',
      code: `minDate = new Date('2025-01-01');
maxDate = new Date('2025-12-31');
boundedControl = new FormControl<DateRangeEvent | null>(null);
onValueChange(event: DateRangeEvent | null) {
  console.log('Value changed:', event);
}`,
    },
  ]);

  // Date boundaries for bounded variant
  minDate = new Date('2025-01-01');
  maxDate = new Date('2025-12-31');
  inputDateFormat = InputDateFormat.mmddyyyy;

  // Event handler
  onValueChange(event: DateRangeEvent | any) {
    console.log('Value changed:', event);
  }
}