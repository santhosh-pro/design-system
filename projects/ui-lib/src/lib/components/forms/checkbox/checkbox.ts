import { Component, input, signal, AfterContentInit, OnInit, ChangeDetectorRef } from '@angular/core';
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
  label = input<string | null>(null, { alias: 'title' });
  value = input<boolean>(false);
  indeterminate = input<boolean>(false);

  // Signals
  checkboxId = signal<string>('');

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.checkboxId.set(this.generateUniqueId());
    this.formControl.setValue(this.value(), { emitEvent: false });
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    // Sync indeterminate state
    this.updateIndeterminate();
  }

  protected onCheckboxChange(event: Event): void {
    if (this.isDisabled()) return;

    this.markTouched();
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.checked;

    // Update FormControl and emit value
    this.formControl.setValue(value, { emitEvent: false });
    this.onValueChange(value);
    this.cdr.detectChanges();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const currentValue = this.formControl.value ?? false;
      const newValue = !currentValue;
      this.formControl.setValue(newValue, { emitEvent: false });
      this.onValueChange(newValue);
      this.cdr.detectChanges();
    }
  }

  private updateIndeterminate(): void {
    if (this.indeterminate()) {
      this.formControl.setValue(null, { emitEvent: false }); // Indeterminate state
    }
  }

  protected override onValueReady(value: boolean | null): void {
    this.formControl.setValue(value ?? this.value(), { emitEvent: false });
    this.updateIndeterminate();
    this.cdr.detectChanges();
  }

  private generateUniqueId(): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `checkbox-${randomNumber}`;
  }
}