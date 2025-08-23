import { AbstractControl, ControlValueAccessor, FormControl, NgControl } from "@angular/forms";
import { AfterContentInit, Component, EventEmitter, inject, input, Output, signal } from "@angular/core";

@Component({
  template: '',
})
export abstract class BaseControlValueAccessorV3<T> implements ControlValueAccessor, AfterContentInit {
  errorMessages = input<{ [key: string]: string }>({});

  @Output() valueChanged = new EventEmitter<T>();

  disabled = signal(false);
  touched = signal(false);
  public formControl = new FormControl();

  ngControl = inject(NgControl, { optional: true, self: true });

  actualValue: T | undefined;

  protected abstract onValueReady(value: T): void;

  get controlValue(): T | undefined {
    return this.formControl.value ?? this.actualValue;
  }

  constructor() {
    if (this.ngControl) {
      this.ngControl!.valueAccessor = this;
    }
  }

  ngAfterContentInit() {
    let formControl = this.ngControl?.control as FormControl;
    if (formControl) {
      this.formControl = this.ngControl?.control as FormControl;
    }
  }

  get hasErrors() {
    return this.formControl && this.formControl.touched && this.formControl.errors;
  }

  private onChange: any = () => {};

  onTouched: any = () => {};

  writeValue(value: T): void {
    if (value !== this.formControl.value) {
      this.formControl.setValue(value, { emitEvent: false });
    }
    this.actualValue = value;
    this.onValueReady(value); // Removed setTimeout for synchronous updates
  }

  onValueChange(value: T) {
    this.valueChanged.emit(value);
    this.actualValue = value;
    this.onChange(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  markAsTouched() {
    if (!this.touched()) {
      this.onTouched();
      this.touched.set(true);
    }
  }

  hasRequiredValidator(): boolean {
    if (this.formControl?.validator) {
      const validator = this.formControl.validator({} as AbstractControl);
      return !!(validator && validator['required']);
    }
    return false;
  }
}