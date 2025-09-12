import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaField, TextField, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField, DateFieldComponent, DatePicker, InputDateFormat, Weekday } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-number-field-demo',
  imports: [ReactiveFormsModule, 
    TextField, TextareaField, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField, DateFieldComponent, DatePicker, DatePipe],
  templateUrl: './number-field-demo.html',
  styleUrl: './number-field-demo.css'
})
export class NumberFieldDemo {



  onSearch(value: string | null): void {
    console.log('Search value:', value);
  }

  onOtpComplete(otp: any) {
  console.log('OTP entered completely:', otp);
  // trigger API call or submit
}
prefixNumOptions = [
    { value: '+1', label: 'US (+1)' , isRange: false},
    { value: '+44', label: 'UK (+44)', isRange: false},
    { value: '+91', label: 'IN (+91)', isRange: true},
  ];

prefixOptions = [
    { value: '+1', label: 'US (+1)' },
    { value: '+44', label: 'UK (+44)' },
    { value: '+91', label: 'IN (+91)' },
  ];
  defaultPrefix = '+91';
onPrefixChange(value: string): void {
    console.log('Selected prefix changed to:', value);
  }

  onValueChange(value: any | null): void {
    console.log('Number value changed to:', value);
  }





  // DatePickerFieldComponent: Picker-Only Input

  dateControl = new FormControl<string | null>('28/02/2025');

  minDate: Date | null = new Date(2025, 0, 1); // January 1, 2025
  maxDate: Date | null = new Date(2025, 11, 31); // December 31, 2025
  allowOnlyPast = false;
  allowOnlyFuture = true;
  disabledDays: Weekday[] = ['saturday', 'sunday'];
  disabledDates: Date[] = [new Date(2025, 0, 15)]; // January 15, 2025
  inputDateFormat = InputDateFormat.ddmmyyyy;

  // Selected dates for each component
  selectedManualDate: Date | null = null;
  selectedPickerDate: Date | null = null;

  onManualDateChange(date: Date | any) {
    this.selectedManualDate = date;
    console.log('Manual Date Selected:', date);
  }

  onPickerDateChange(date: Date | any) {
    this.selectedPickerDate = date;
    console.log('Picker Date Selected:', date);
  }
}
