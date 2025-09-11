import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AppSvgIconComponent } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';

interface SelectOption {
  value: string;
  label: string;
  isRange: boolean;
}

interface NumberRangeValue {
  from: number | null;
  to: number | null;
}
@Component({
  selector: 'ui-number-prefix-select-field',
  imports: [
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent
],
  templateUrl: './number-prefix-select-field.html',
})
export class NumberPrefixSelectField extends BaseControlValueAccessor<number | NumberRangeValue | null> implements OnInit{
// Inputs (same as before)
  label = input<string | null>(null);
  width = input<'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  hasPrefixSelect = input<boolean>(false);
  prefixOptions = input<SelectOption[]>([]);
  defaultPrefixValue = input<string | null>(null);
  iconSrc = input<string | null>(null);

  // Outputs
  prefixChange = output<string>();
  override valueChange = output<number | NumberRangeValue | null>(); // Added output

  // Signals
  isFocused = signal(false);
  prefixControl = new FormControl<string | null>(null);
  fromControl = new FormControl<number | null>(null);
  toControl = new FormControl<number | null>(null);

  // Computed
  isRange = computed(() => {
    const prefixValue = this.prefixControl.value ?? this.defaultPrefixValue() ?? this.prefixOptions()[0]?.value ?? '';
    const selectedOption = this.prefixOptions().find(option => option.value === prefixValue);
    console.log('prefixValue:', prefixValue, 'selectedOption:', selectedOption); // Debug
    return selectedOption?.isRange ?? false;
  });

  ngOnInit(): void {
    const defaultValue = this.defaultPrefixValue() ?? this.prefixOptions()[0]?.value ?? '';
    this.prefixControl.setValue(defaultValue, { emitEvent: false });

    this.formControl.valueChanges.subscribe(value => {
      if (!this.isRange()) {
        this.onValueChange(value);
        this.valueChange.emit(value); // Emit value change
      }
    });

    this.fromControl.valueChanges.subscribe(() => this.updateRangeValue());
    this.toControl.valueChanges.subscribe(() => this.updateRangeValue());

    this.prefixControl.valueChanges.subscribe(() => {
      this.formControl.setValue(null, { emitEvent: false });
      this.fromControl.setValue(null, { emitEvent: false });
      this.toControl.setValue(null, { emitEvent: false });
      this.valueChange.emit(null); // Emit null on prefix change
    });
  }

  protected onValueReady(value: number | NumberRangeValue | null): void {
    if (this.isRange() && typeof value === 'object' && value !== null) {
      this.fromControl.setValue(value.from, { emitEvent: false });
      this.toControl.setValue(value.to, { emitEvent: false });
    } else if (!this.isRange() && typeof value === 'number') {
      this.formControl.setValue(value, { emitEvent: false });
    }
    this.valueChange.emit(value); // Emit initial value
  }

  protected updateRangeValue(): void {
    if (this.isRange()) {
      const rangeValue: NumberRangeValue = {
        from: this.fromControl.value,
        to: this.toControl.value
      };
      this.onValueChange(rangeValue);
      this.valueChange.emit(rangeValue); // Emit range value
    }
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
