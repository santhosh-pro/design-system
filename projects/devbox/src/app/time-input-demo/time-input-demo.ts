import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimePickerComponent, TimePickerValue } from "projects/ui-lib/src/public-api";

@Component({
  selector: 'app-time-input-demo',
  imports: [ReactiveFormsModule, TimePickerComponent],
  templateUrl: './time-input-demo.html',
  styleUrl: './time-input-demo.css'
})
export class TimeInputDemo {
form: FormGroup;
  selectedTime: TimePickerValue | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      time: [null, Validators.required], // TimePickerValue binding
    });
  }

  ngOnInit(): void {
    // Set an initial value for the time picker (optional)
    this.form.patchValue({
      time: { hours: 14, minutes: 30 }, // 2:30 PM in 24-hour format
    });

    // Subscribe to form value changes to update selectedTime
    this.form.get('time')?.valueChanges.subscribe((value: TimePickerValue | null) => {
      this.selectedTime = value;
    });
  }

  onTimeChange(value: TimePickerValue): void {
    this.selectedTime = value;
    console.log('Time changed:', value); // For debugging
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted with time:', this.form.value.time);
    } else {
      console.log('Form is invalid');
      this.form.markAllAsTouched(); // Trigger validation display
    }
  }

  getFormattedTime(): string {
    if (!this.selectedTime) return 'No time selected';
    const { hours, minutes } = this.selectedTime;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${formattedMinutes} ${period}`;
  }
}
