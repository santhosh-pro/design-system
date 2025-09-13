import { AbstractControl, ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { AfterContentInit, Component, computed, inject, input, output, signal } from '@angular/core';

@Component({
  template: '',
})
export abstract class BaseControlValueAccessor<T> implements ControlValueAccessor, AfterContentInit {
  // Inputs
  errorMessages = input<{ [key: string]: string }>({});

  // Outputs
  valueChange = output<T>();

  // Signals (keep for disabled/touched, but not for formControl)
  isDisabled = signal(false);
  isTouched = signal(false);
  private errors = signal<{ [key: string]: any } | null>(null);


  // Plain property like old code (not a signal)
  formControl = new FormControl<T | null>(null);

  // Computed (reads from formControl.value/touched/errors directly)
  hasErrors = computed(() => this.isTouched() && !!this.errors());


  // Injected NgControl
  private ngControl = inject(NgControl, { optional: true, self: true });

  // Flag to prevent recursive calls
  private isWritingValue = false;

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

    // keep signals updated
    this.formControl.statusChanges.subscribe(() => {
      this.isTouched.set(this.formControl.touched);
      this.errors.set(this.formControl.errors);
    });

    // initial sync
    this.isTouched.set(this.formControl.touched);
    this.errors.set(this.formControl.errors);
  }
  }

  // ControlValueAccessor methods
  writeValue(value: T | null): void {
    if (this.isWritingValue) return;
    this.isWritingValue = true;
    try {
      if (value !== this.formControl.value) {
        this.formControl.setValue(value, { emitEvent: false });
      }
      // Defer like old code to allow validation/touched sync
      setTimeout(() => this.onValueReady(value));
    } finally {
      this.isWritingValue = false;
    }
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
      this.formControl.markAsTouched({ emitEvent: true });  // Propagate to parent
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
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};
}