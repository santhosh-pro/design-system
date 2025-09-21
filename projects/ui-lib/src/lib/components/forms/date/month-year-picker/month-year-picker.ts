import { Component, ElementRef, inject, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { AppSvgIcon } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';
import { BaseInput } from '../../../../core/base-input/base-input';
import { Subscription } from 'rxjs';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { InputDateFormat } from '../date-format';
import { DateUtils } from '../date-utils';
import { OverlayStore } from '../../../../components/overlay/overlay';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { MonthYearOverlay } from './month-year-overlay/month-year-overlay';
import { FormatMonthYearPipe } from './format-month-year-pipe';

@Component({
  selector: 'ui-month-year-picker',
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    FormatMonthYearPipe,
    ReactiveFormsModule,
    BaseInput,
    AppSvgIcon
  ],
  templateUrl: './month-year-picker.html',
})
export class MonthYearPicker extends BaseControlValueAccessor<Date | null> implements OnDestroy {
  @ViewChild('trigger', { static: false }) trigger?: ElementRef;

  label = input<string | null>();
  iconSrc = input<string | null>();
  showPickerIcon = input<boolean>(true);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  showErrorSpace = input<boolean>(true);
  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.mmddyyyy);

  overlayService = inject(OverlayStore);
  isFocused = signal(false);
  textInputValue = signal<Date | null>(null);
  private subscription?: Subscription;

  get placeHolder(): string {
    return this.inputDateFormat() === InputDateFormat.mmddyyyy ? 'mm/yyyy' : 'mm/yyyy';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Override writeValue to handle incoming values from parent form WITHOUT triggering onValueChange
  override writeValue(value: Date | null): void {
    this.updateValidations(); // Safe to call here for dynamic validation updates

    if (value == null) {
      this.textInputValue.set(null);
      super.writeValue(null); // Let base handle any internal state
      return;
    }

    let validDate: Date | null = null;
    if (value instanceof Date && DateUtils.isValidDate(value)) {
      validDate = value;
    } else {
      const date = new Date(value);
      if (DateUtils.isValidDate(date)) {
        validDate = date;
      }
    }

    this.textInputValue.set(validDate);
    super.writeValue(validDate); // Let base handle any internal state
  }

  // Keep onValueReady as fallback, but make it non-propagating (no selValue call)
  protected override onValueReady(value: any): void {
    // Just update validations; writeValue handles the rest during binding
    this.updateValidations();
  }

  updateValidations() {
    const formUtils = new FormValidationUtils();
    const validatorsToAdd: ValidatorFn[] = [];

    if (this.allowOnlyPast()) {
      validatorsToAdd.push(onlyPastDateValidator());
    }

    if (this.allowOnlyFuture()) {
      validatorsToAdd.push(onlyFutureDateValidator());
    }

    formUtils.updateValidatorsIfNeeded(this.formControl, validatorsToAdd);
  }

  // Private method for INTERNAL/USER selections only (triggers propagation to parent)
  private selectInternalValue(value: Date | null): void {
    // Synchronous update - safe during user interaction (post-init)
    this.textInputValue.set(value);
    this.onValueChange(value); // Propagates to parent form
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
    this.markTouched();
  }

  onInputClicked() {
    if (this.formControl.disabled) return;
    this.onPickerIconClicked();
  }

  async onPickerIconClicked() {
    if (!this.trigger?.nativeElement || this.formControl.disabled) return;

    const result: Date | undefined = await this.overlayService.openNearElement(MonthYearOverlay, this.trigger.nativeElement, {
      positionPreference: 'bottomLeft',
      backdropOptions: { showBackdrop: false, }, 
      data: {
        selectedDate: this.formControl.value,
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        allowOnlyPast: this.allowOnlyPast(),
        allowOnlyFuture: this.allowOnlyFuture()
      }
    });

    if (result && DateUtils.isValidDate(result)) {
      this.selectInternalValue(result); // Use internal method for user selection
    }
  }
}