import { Component } from '@angular/core';
import { TextareaField, TextField, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-number-field-demo',
  imports: [TextField, TextareaField, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField],
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
}
