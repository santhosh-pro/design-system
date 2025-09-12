import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { AppSvgIcon } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';
import { BaseInput } from '../../../../core/base-input/base-input';
import { Subscription } from 'rxjs';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { Weekday, InputDateFormat } from '../date-format';
import { DateUtils } from '../date-utils';
import { OverlayStore } from '../../../../components/overlay/overlay';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { DateOverlay } from './date-overlay/date-overlay';

@Component({
  selector: 'ui-date-picker',
  imports: [
    HumanizeFormMessagesPipe,
    ReactiveFormsModule,
    NgClass,
    BaseInput,
    AppSvgIcon
  ],
  templateUrl: './date-picker.html',
})
export class DatePicker extends BaseControlValueAccessor<Date | null> implements OnDestroy {
@ViewChild('trigger', { static: false }) trigger?: ElementRef;

  label = input<string | null>();
  iconSrc = input<string | null>();
  showDatePickerIcon = input<boolean>(true);
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  disabledDays = input<Weekday[]>([]);
  disabledDates = input<Date[]>([]);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.mmddyyyy);

  overlayService = inject(OverlayStore);
  isFocused = signal(false);
  textInputValue = signal<string | null>(null);
  private subscription?: Subscription;

  get placeHolder(): string {
    return this.inputDateFormat() === InputDateFormat.mmddyyyy ? 'mm/dd/yyyy' : 'dd/mm/yyyy';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onValueReady(value: any): void {
    this.updateValidations();
    if (value == null) {
      this.textInputValue.set(null);
      return;
    }

    if (value instanceof Date && DateUtils.isValidDate(value)) {
      this.selValue(value);
    } else {
      const date = new Date(value);
      if (DateUtils.isValidDate(date)) {
        this.selValue(date);
      } else {
        this.selValue(null);
      }
    }
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

  selValue(value: Date | null) {
    setTimeout(() => {
      if (value) {
        this.textInputValue.set(DateUtils.formatDate(value, this.inputDateFormat()));
        this.onValueChange(value);
      } else {
        this.textInputValue.set(null);
        this.onValueChange(null);
      }
    }, 100);
  }

  getClass() {
    let cls = this.iconSrc() ? 'pr-3 pl-10' : 'px-3';
    if (this.fullWidth()) {
      cls += ' w-full';
    }
    return cls;
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
    this.onDatePickerIconClicked();
  }

  async onDatePickerIconClicked() {
    if (!this.trigger?.nativeElement || this.formControl.disabled) return;

    const result: Date | undefined = await this.overlayService.openNearElement(DateOverlay, this.trigger.nativeElement, {
      positionPreference: 'bottomLeft',
      data: {
        selectedDate: this.formControl.value,
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        allowOnlyPast: this.allowOnlyPast(),
        allowOnlyFuture: this.allowOnlyFuture(),
        disabledDays: this.disabledDays(),
        disabledDates: this.disabledDates()
      }
    });

    if (result && DateUtils.isValidDate(result)) {
      this.selValue(result);
    }
  }
}
