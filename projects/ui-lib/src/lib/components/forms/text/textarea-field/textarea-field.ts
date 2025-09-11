import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-textarea-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent,
  ],
  templateUrl: './textarea-field.html',
})
export class TextareaField extends BaseControlValueAccessor<string | null> {
  // Inputs
  iconSrc = input<string | null>(null);
  actionIcon = input<string | null>(null);
  label = input<string | null>(null);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  minlength = input<number | null>(null);
  maxlength = input<number | null>(null);
  lines = input<string | null>('4'); // New input for textarea rows

  // Outputs
  actionClick = output<void>();

  // Signals
  isFocused = signal(false);

  currentLine = computed(() => {
    const lines = parseInt(this.lines() || '4', 10);
    return isNaN(lines) || lines < 1 ? 4 : lines;
  });

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
}