import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectChipField } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-multi-select-field-demo',
  imports: [MultiSelectChipField, ReactiveFormsModule],
  templateUrl: './multi-select-field-demo.html',
})
export class MultiSelectFieldDemo {
// Form group for the reactive form
  form: FormGroup;

  // Sample items for the multi-selection field
  items: any[] = [
    { id: '1', name: 'Apple', iconUrl: 'assets/icons/apple.svg' },
    { id: '2', name: 'Banana', iconUrl: 'assets/icons/banana.svg' },
    { id: '3', name: 'Orange', iconUrl: 'assets/icons/orange.svg' },
    { id: '4', name: 'Mango', iconUrl: 'assets/icons/mango.svg' },
    { id: '5', name: 'Grapes', iconUrl: 'assets/icons/grapes.svg' },
  ];

  constructor(private fb: FormBuilder) {
    // Initialize the form with a FormControl for selected items
    this.form = this.fb.group({
      selectedItems: [[], Validators.required], // Initialize with empty array and required validator
    });
  }

  // Handle value change event from MultiSelectionFieldComponent
  onValueChange(values: string[]) {
    console.log('Selected item IDs:', values);
    // Update the form control value if needed
    this.form.get('selectedItems')?.setValue(values);
  }

  // Handle custom action click
  onCustomActionClicked() {
    console.log('Custom action clicked!');
    // Example: Add a new item dynamically
    const newItem: any = {
      id: `${this.items.length + 1}`,
      name: `New Fruit ${this.items.length + 1}`,
      iconUrl: 'assets/icons/default.svg',
    };
    this.items = [...this.items, newItem];
  }

  // Submit form handler
  onSubmit() {
    if (this.form.valid) {
      console.log('Form submitted with values:', this.form.value);
    } else {
      console.log('Form is invalid');
      this.form.markAllAsTouched();
    }
  }
}
