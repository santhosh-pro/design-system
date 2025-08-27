import { Component, input, signal, AfterContentInit, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-radio-button',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './radio-button.html',
})
export class RadioButtonComponent<T> extends BaseControlValueAccessor<T> implements OnInit, AfterContentInit {
  label = input<string | null>(null); 
  options = input<T[]>([]); 
  displayProperty = input<string>('');

  // Signals
  radioGroupId = signal<string>(''); 

  ngOnInit(): void {
    this.radioGroupId.set(this.generateUniqueId());
  }

  // Handle radio button selection change
  protected onRadioChange(event: Event): void {
    if (this.isDisabled()) return;

    this.markTouched();
    const value = (event.target as HTMLInputElement).value as T;
    this.onValueChange(value); // Updates formControl and emits valueChange
  }

  // Handle keydown event for accessibility
  protected onKeydown(event: KeyboardEvent, option: T): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onValueChange(option); 
    }
  }

  private generateUniqueId(): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `radio-group-${randomNumber}`;
  }

  protected getDisplayText(option: T): string {
    return this.displayProperty() && typeof option === 'object'
      ? (option as any)[this.displayProperty()] || ''
      : String(option);
  }

  protected override onValueReady(value: T | null): void {
    // Optional: Add logic if needed when the initial value is set
  }
}