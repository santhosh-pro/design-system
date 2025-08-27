import { Component, input, signal, AfterContentInit, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './checkbox.html',
})
export class CheckboxComponent extends BaseControlValueAccessor<boolean> implements OnInit, AfterContentInit {
  // Inputs
  label = input<string | null>(null, { alias: 'title' }); // Renamed to 'label', kept 'title' as alias

  // Signals
  checkboxId = signal<string>(''); // Descriptive signal name for checkbox ID

  ngOnInit(): void {
    this.checkboxId.set(this.generateUniqueId());
  }

  // Handle checkbox change event
  protected onCheckboxChange(event: Event, enterKeyPressed: boolean = false): void {
    if (this.isDisabled()) return;

    this.markTouched();
    const checkbox = event.target as HTMLInputElement;
    let value = checkbox.checked;

    if (enterKeyPressed) {
      value = !value;
      checkbox.checked = value;
    }

    this.onValueChange(value); // Calls base class method, which emits valueChange and updates formControl
  }

  // Handle keydown event
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onCheckboxChange(event, true);
    }
  }

  // Generate unique ID for checkbox
  private generateUniqueId(): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `checkbox-${randomNumber}`;
  }

  protected override onValueReady(value: boolean | null): void {
    // Optional: Add logic if needed when the initial value is set
  }
}