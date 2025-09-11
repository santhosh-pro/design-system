import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HumanizeFormMessagesPipe } from '../../misc/humanize-form-messages';
import { AppSvgIconComponent } from '../../misc/app-svg-icon/app-svg-icon';
import { BaseInputComponent } from '../../../core/base-input/base-input';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ui-text-prefix-select-field',
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent
],
  templateUrl: './text-prefix-select-field.html',
})
export class TextPrefixSelectField extends BaseControlValueAccessor<string | null> implements OnInit {
// Inputs
  type = input<'text' | 'email' | 'tel' | 'url'>('text');
  iconSrc = input<string | null>(null);
  label = input<string | null>(null);
  width = input<'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  hasPrefixSelect = input<boolean>(false);
  prefixOptions = input<SelectOption[]>([]);
  defaultPrefixValue = input<string | null>(null);

  // Outputs
  prefixChange = output<string>();

  // Signals
  isFocused = signal(false);
  prefixControl = new FormControl<string>('');


  ngOnInit(): void {
    this.prefixControl.setValue(this.defaultPrefixValue() ?? '', { emitEvent: false });
  }

  protected onValueReady(value: string | null): void {
    this.onValueChange(value);
  }

  protected onPrefixChange(value: string): void {
    this.prefixChange.emit(value);
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
  }

}
