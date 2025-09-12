import { Component, ElementRef, inject, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { isValidDate } from 'rxjs/internal/util/isDate';
import { MultiDateOverlay } from './multi-date-overlay/multi-date-overlay';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInput } from '../../../../core/base-input/base-input';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';
import { OverlayStore } from '../../../overlay/overlay';
import { InputDateFormat, Weekday } from '../date-format';
import { NgxMaskDirective } from '../../../../core/input-mask/ngx-mask.directive';


@Component({
  selector: 'ui-multi-date-picker',
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgClass,
    BaseInput,
    AppSvgIcon,
    FormsModule,
],
  templateUrl: './multi-date-picker.html',
})
export class MultiDatePicker extends BaseControlValueAccessor<Date[]> implements OnDestroy {
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
  textInputValue = signal<string>('');

  private subscription?: Subscription;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onValueReady(value: any): void {
    this.updateValidations();
    if (value == null) {
      this.selValue([]);
      return;
    }

    if (Array.isArray(value)) {
      const validDates = value.filter(date => date instanceof Date && isValidDate(date));
      this.selValue(validDates);
    } else {
      this.selValue([]);
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

  selValue(value: Date[]) {
    setTimeout(() => {
      this.textInputValue.set('');
      this.onValueChange(value);
    }, 100);
  }

  get placeHolder(): string {
    switch (this.inputDateFormat()) {
      case InputDateFormat.mmddyyyy:
        return 'mm/dd/yyyy';
      case InputDateFormat.ddmmyyyy:
        return 'dd/mm/yyyy';
    }
  }

  getClass() {
    let cls = '';
    if (this.iconSrc()) {
      cls += 'pl-10';
    } else {
      cls += 'pl-3';
    }

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

async onDatePickerIconClicked() {
  const dialogData = {
    data: {
      selectedDates: this.formControl || [],
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      allowOnlyPast: this.allowOnlyPast(),
      allowOnlyFuture: this.allowOnlyFuture(),
      disabledDays: this.disabledDays(),
      disabledDates: this.disabledDates()
    },
    positionPreference: 'bottom',
  };

  let result: Date[] | undefined;
  if (!this.trigger?.nativeElement) {
    console.warn('Trigger element is not available. Opening overlay without positioning.');
    result = await this.overlayService.openModal(MultiDateOverlay, dialogData);
  } else {
    result = await this.overlayService.openNearElement(MultiDateOverlay, this.trigger.nativeElement, {
      data: dialogData.data,
      disableClose: true,
      positionPreference: 'bottomLeft'
    });
  }

  if (result && Array.isArray(result) && result.length > 0 && result.every(date => date instanceof Date && isValidDate(date))) {
    this.textInputValue.set('');
    this.onValueChange(result);
  }
  // If result is undefined or empty, do nothing to preserve existing value
}

  removeDate(index: number) {
    const currentDates = this.formControl.value || [];
    const updatedDates = [...currentDates.slice(0, index), ...currentDates.slice(index + 1)];
    this.textInputValue.set('');
    this.onValueChange(updatedDates);
  }

  formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return this.inputDateFormat() === InputDateFormat.mmddyyyy ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
  }
}