import { CommonModule } from '@angular/common';
import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';

@Component({
  selector: 'ui-search-field',
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    CommonModule,
    BaseInputComponent,
  ],
  templateUrl: './search-field.html',
   styles: `
    .disabled-placeholder::placeholder {
      color: #a0aec0;
    }
  `
})
export class SearchField extends BaseControlValueAccessor<string | null> implements OnInit, OnDestroy {
  // Inputs
  label = input<string | null>(null);
  placeholder = input<string>('Search...');
  showErrorSpace = input<boolean>(false);
  debounceTimeMs = input<number>(500);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');

  // Signals
  isFocused = signal(false);
  inputValue = signal<string | null>(null);
  
  // Private properties for debouncing
  private timeoutId: number | null = null;
  private lastEmittedValue: string | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.formControl.value) {
      this.inputValue.set(this.formControl.value);
      this.lastEmittedValue = this.formControl.value;
    }
  }

  protected override onValueReady(value: string | null): void {
    this.inputValue.set(value);
    this.lastEmittedValue = value;
  }

  protected onInput(value: string | null): void {
    // Update form control immediately
    this.formControl.setValue(value, { emitEvent: true });
    
    // Update input value signal
    this.inputValue.set(value);
    
    // Handle debounced search emission
    this.handleDebouncedSearch(value);
  }

  private handleDebouncedSearch(value: string | null): void {
    // Clear existing timeout
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Only emit if the value has actually changed from the last emitted value
    if (value === this.lastEmittedValue) {
      return;
    }

    // Set new timeout for debounced emission
    this.timeoutId = window.setTimeout(() => {
      // Double-check the value hasn't changed during the timeout
      if (this.inputValue() === value && value !== this.lastEmittedValue) {
        this.valueChange.emit(value);
        this.lastEmittedValue = value;
      }
      this.timeoutId = null;
    }, this.debounceTimeMs());
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
    
    // Optionally emit immediately on blur to ensure the latest value is captured
    if (this.inputValue() !== this.lastEmittedValue) {
      if (this.timeoutId !== null) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.valueChange.emit(this.inputValue());
      this.lastEmittedValue = this.inputValue();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}