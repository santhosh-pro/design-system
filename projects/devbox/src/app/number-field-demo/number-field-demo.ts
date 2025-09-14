import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaField, TextField, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField, DateField, DatePicker, InputDateFormat, Weekday, Button, MultiSelectDropdownField, DateRangePicker, MultiDatePicker, MultiSelectDataTableField, ColumnDef, SelectDropdownField, MonthYearPicker, Tab, CheckboxGroupField, RadioGroupField } from 'projects/ui-lib/src/public-api';

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ArrayValidators {
  static required(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormArray) {
        return control.length === 0 ? { required: true } : null;
      }
      if (Array.isArray(control.value)) {
        return control.value.length === 0 ? { required: true } : null;
      }
      return null;
    };
  }
}

@Component({
  selector: 'app-number-field-demo',
  imports: [ReactiveFormsModule, DateRangePicker, SelectDropdownField, DateField,MonthYearPicker,CheckboxGroupField,Tab, RadioGroupField,
    TextField, TextareaField, MultiSelectDropdownField, CommonModule, SearchField, OtpField, PasswordField, NumberField, TextPrefixSelectField, NumberPrefixSelectField, DateField, DatePicker, DatePipe, Button, MultiSelectDropdownField, MultiDatePicker, MultiSelectDataTableField, SelectDropdownField],
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
    { value: '+1', label: 'US (+1)', isRange: false },
    { value: '+44', label: 'UK (+44)', isRange: false },
    { value: '+91', label: 'IN (+91)', isRange: true },
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


  form!: FormGroup;
  formBuilder = inject(FormBuilder);

  ngOnInit(): void {

    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required,Validators.email]],
      phoneNumber: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(5)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    } else {
      console.log('Form is invalid');
    }
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







  //data table 

    userColumns = signal<ColumnDef[]>([
    {
      key: 'name',
      title: 'Name',
      type: 'text',
      alignment: 'left',
      sortKey: 'name',
      visible: true
    },
    {
      key: 'email',
      title: 'Email',
      type: 'text',
      alignment: 'left',
      sortKey: 'email',
      visible: true,
    },
    {
      key: 'department',
      title: 'Department',
      type: 'text',
      alignment: 'left',
      sortKey: 'department',
      visible: true,
    },
    {
      key: 'role',
      title: 'Role',
      type: 'text',
      alignment: 'left',
      sortKey: 'role',
      visible: true,
    },
    {
      key: 'status',
      title: 'Status',
      type: 'text',
      alignment: 'center',
      sortKey: 'status',
      visible: true,
    },
  ]);

  users = signal<any[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', role: 'Senior Developer', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', role: 'Marketing Manager', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Engineering', role: 'DevOps Engineer', status: 'active' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', department: 'Design', role: 'UX Designer', status: 'inactive' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@company.com', department: 'Sales', role: 'Sales Representative', status: 'active' },
    { id: 6, name: 'Diana Davis', email: 'diana.davis@company.com', department: 'HR', role: 'HR Specialist', status: 'active' },
    { id: 7, name: 'Edward Miller', email: 'edward.miller@company.com', department: 'Engineering', role: 'Frontend Developer', status: 'active' },
    { id: 8, name: 'Fiona Garcia', email: 'fiona.garcia@company.com', department: 'Marketing', role: 'Content Writer', status: 'inactive' },
  ]);








  // Tabs
  tabs = signal([
    { id: 'tab1', title: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', title: 'Tab 2', content: 'Content 2', disabled: false },
    { id: 'tab3', title: 'Tab 3', content: 'Content 3', disabled: true }
  ]);

  activeTabId = signal('tab1');

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
    console.log('Active tab changed to:', tabId);
  }
}
