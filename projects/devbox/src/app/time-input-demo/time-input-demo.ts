import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Accordion, AccordionSection, TimePickerComponent, TimePickerValue } from "projects/ui-lib/src/public-api";

@Component({
  selector: 'app-time-input-demo',
  imports: [ReactiveFormsModule, TimePickerComponent, Accordion],
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






  // accordion demo
   sections = signal<AccordionSection[]>([
    { id: 'faq1', title: 'Getting Started', content: 'How to get started' },
    { id: 'faq2', title: 'Advanced Features', content: 'Advanced features', disabled: false },
    { id: 'faq3', title: 'Settings', content: 'Settings content', disabled: true }
  ]);

  activeSectionId = signal('faq1');
  scrollToContent = signal(true);
  allowMultiple = signal(false);

  onSectionToggle(sectionId: string): void {
    this.activeSectionId.set(sectionId);
    console.log('Section toggled:', sectionId);
  }

  onSectionAdded(section: AccordionSection): void {
    const currentSections = this.sections().slice();
    currentSections.push(section);
    this.sections.set(currentSections);
  }

  onSectionRemoved(sectionId: string): void {
    const currentSections = this.sections().slice();
    const index = currentSections.findIndex(section => section.id === sectionId);
    if (index !== -1) {
      currentSections.splice(index, 1);
      this.sections.set(currentSections);
    }
  }

  addNewSection(): void {
    const newSection: AccordionSection = {
      id: `faq${this.sections().length + 1}`,
      title: `Section ${this.sections().length + 1}`,
      content: `Content for Section ${this.sections().length + 1}`
    };
    this.onSectionAdded(newSection);
  }

  removeSection(sectionId: string): void {
    this.onSectionRemoved(sectionId);
  }

  toggleScroll(): void {
    this.scrollToContent.set(!this.scrollToContent());
  }

  toggleMultiple(): void {
    this.allowMultiple.set(!this.allowMultiple());
  }
}
