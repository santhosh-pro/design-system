import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-number-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent,
  ],
  templateUrl: './number-field.html',
  styles: `
    input::-webkit-inner-spin-button,
    input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `,
})
export class NumberField extends BaseControlValueAccessor<number | null> {
  // Inputs
  iconSrc = input<string | null>(null);
  actionIcon = input<string | null>(null);
  label = input<string | null>(null);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number | null>(null);

  // Outputs
  actionClick = output<void>();

  // Signals
  isFocused = signal(false);

  // Required by BaseControlValueAccessor
  protected override onValueReady(value: number | null): void {
    this.onValueChange(value);
  }

  onInput(value: string): void {
    const numValue = value ? Number(value) : null;
    if (numValue !== null && !isNaN(numValue)) {
      this.formControl.setValue(numValue, { emitEvent: true });
      this.onValueChange(numValue);
    } else {
      this.formControl.setValue(null, { emitEvent: true });
      this.onValueChange(null);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    // Prevent 'e', '+', '-', and other non-numeric characters
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
  }
}