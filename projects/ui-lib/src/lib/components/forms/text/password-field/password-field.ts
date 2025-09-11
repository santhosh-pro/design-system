import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-password-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent,
  ],
  templateUrl: './password-field.html',
})
export class PasswordField extends BaseControlValueAccessor<string | null> {
  // Inputs
  iconSrc = input<string | null>(null);
  label = input<string | null>('Password');
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('Enter password');
  showErrorSpace = input<boolean>(false);
  showEye = input<boolean>(true);

  // Outputs
  actionClick = output<void>();

  // Signals
  isFocused = signal(false);
  showPassword = signal(false);

  // Required by BaseControlValueAccessor
  protected override onValueReady(value: string | null): void {
    this.onValueChange(value);
  }

  onInput(value: string | null): void {
    this.formControl.setValue(value, { emitEvent: true });
    this.onValueChange(value);
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

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}