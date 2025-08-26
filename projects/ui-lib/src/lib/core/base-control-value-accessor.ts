import { AbstractControl, ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { AfterContentInit, Component, computed, inject, input, output, signal } from '@angular/core';

@Component({
  template: '',
})
export abstract class BaseControlValueAccessor<T> implements ControlValueAccessor, AfterContentInit {
  // Inputs
  errorMessages = input<{ [key: string]: string }>({});

  // Outputs
  valueChange = output<T>(); // Renamed from valueChanged to align with [property]Change

  // Signals
  isDisabled = signal(false); // Renamed from disabled to follow boolean naming
  isTouched = signal(false); // Renamed from touched to follow boolean naming
  formControl = new FormControl<T | null>(null);

  // Computed
  hasErrors = computed(() => this.formControl.touched && !!this.formControl.errors);

  // Injected NgControl
  private ngControl = inject(NgControl, { optional: true, self: true });


  // Abstract method for subclasses to implement
  protected abstract onValueReady(value: T | null): void;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit(): void {
    if (this.ngControl?.control) {
      this.formControl = this.ngControl.control as FormControl<T | null>;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: T | null): void {
    if (value !== this.formControl.value) {
      this.formControl.setValue(value, { emitEvent: false });
    }
    this.onValueReady(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.formControl[isDisabled ? 'disable' : 'enable']({ emitEvent: false });
  }

  // Public methods
  markTouched(): void {
    if (!this.isTouched()) {
      this.onTouched();
      this.isTouched.set(true);
    }
  }

  hasRequiredValidator(): boolean {
    if (this.formControl?.validator) {
      const validator = this.formControl.validator({} as AbstractControl);
      return !!(validator && validator['required']);
    }
    return false;
  }

  // Protected methods
  protected onValueChange(value: T | null): void {
    if (value !== null) {
      this.valueChange.emit(value);
      this.onChange(value);
    }
  }

  // ControlValueAccessor callbacks
  private onChange: (value: T | null) => void = () => { };
  private onTouched: () => void = () => { };
}