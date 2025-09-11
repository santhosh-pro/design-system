import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { NgxMaskDirective } from '../../input-mask/ngx-mask.directive';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-text-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent,
    NgxMaskDirective,
  ],
  styles: `
  .hide-time-picker::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }
  .hide-time-picker::-webkit-inner-spin-button {
    display: none;
    -webkit-appearance: none;
  }
  .hide-time-picker::-moz-focus-inner {
    border: 0;
  }
  `,
  templateUrl: './text-field.html',
})
export class TextField extends BaseControlValueAccessor<string | null> {
  // Inputs
  type = input<'text' | 'email' | 'textarea' | 'tel' | 'url' | 'time'>('text');
  iconSrc = input<string | null>(null);
  actionIcon = input<string | null>(null);
  label = input<string | null>(null);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  mask = input<string | null>(null);

  // Extra inputs for specific types
  pattern = input<string | null>(null); // tel, url
  minlength = input<number | null>(null); // tel
  maxlength = input<number | null>(null); // tel
  min = input<string | null>(null); // time
  max = input<string | null>(null); // time
  step = input<number | null>(null); // time

  // Outputs
  actionClick = output<void>();

  // Signals
  isFocused = signal(false);

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