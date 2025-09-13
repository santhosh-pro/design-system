import {
  Component,
  input,
  signal,
  AfterContentInit,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-checkbox-field',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './checkbox-field.html',
})
export class CheckboxField
  extends BaseControlValueAccessor<boolean | null>
  implements OnInit, AfterContentInit
{
  // Inputs
  label = input<string | null>(null, { alias: 'title' });
  value = input<boolean>(false, { alias: 'checked' });
  indeterminate = input<boolean>(false);

  // Signals
  checkboxId = signal<string>('');

  @ViewChild('checkboxInput', { static: true })
  private checkboxInput!: ElementRef<HTMLInputElement>;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.checkboxId.set(this.generateUniqueId());

    // Initialize form control value only if not already set
    if (this.formControl.value === null || this.formControl.value === undefined) {
      this.formControl.setValue(this.value(), { emitEvent: false });
    }
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.updateIndeterminate();
    this.cdr.markForCheck(); // ensure UI updates
  }

  protected onCheckboxChange(event: Event): void {
    if (this.isDisabled()) return;

    this.markTouched();
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

      this.formControl.setValue(newValue, { emitEvent: true });
      this.onValueChange(newValue);
    
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isDisabled()) {
      const currentValue = this.formControl.value ?? false;
      const newValue = !currentValue;
      this.formControl.setValue(newValue, { emitEvent: true });
      this.onValueChange(newValue);
      this.cdr.markForCheck();
    }
  }

  private updateIndeterminate(): void {
    const checkbox = this.checkboxInput?.nativeElement;
    if (!checkbox) return;

    checkbox.indeterminate = this.indeterminate();

    if (this.indeterminate()) {
      this.formControl.setValue(null, { emitEvent: false });
    } else if (this.formControl.value === null) {
      this.formControl.setValue(this.value(), { emitEvent: false });
    }
  }

  protected override onValueReady(value: boolean | null): void {
    const finalValue = this.indeterminate() ? null : (value ?? this.value());
    if (this.formControl.value !== finalValue) {
      this.formControl.setValue(finalValue, { emitEvent: false });
    }

    this.updateIndeterminate();
    this.cdr.markForCheck();
  }

  private generateUniqueId(): string {
    return `checkbox-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}
