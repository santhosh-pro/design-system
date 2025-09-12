import { Component, input, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInput } from '../../../../core/base-input/base-input';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';
import { NgxMaskDirective } from '../../../../core/input-mask/ngx-mask.directive';
import { InputDateFormat, Weekday } from '../date-format';
import { DateUtils } from '../date-utils';

@Component({
  selector: 'ui-date-field',
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgClass,
    BaseInput,
    AppSvgIcon,
    FormsModule
  ],
  templateUrl: './date-field.html',
})
export class DateField extends BaseControlValueAccessor<Date | null> implements OnDestroy {
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  label = input<string | null>();
  iconSrc = input<string | null>();
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  disabledDays = input<Weekday[]>([]);
  disabledDates = input<Date[]>([]);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.mmddyyyy);

  isFocused = signal(false);
  textInputValue = signal<string | null>(null);
  private subscription?: Subscription;

  get placeHolder(): string {
    return '00/00/0000';
  }

  get displayPlaceholder(): string {
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

  onTextInputChange(value: string | null) {
    this.textInputValue.set(value);
  }

  onInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    const inputValue = target.value.trim();

    if (inputValue.length === 10) {
      const parsedDate = DateUtils.parseDate(inputValue, this.inputDateFormat());
      if (parsedDate && this.isDateValid(parsedDate)) {
        this.textInputValue.set(inputValue);
        this.onValueChange(parsedDate);
      } else {
        this.textInputValue.set(null);
        this.onValueChange(null);
      }
    }
  }

  private isDateValid(date: Date): boolean {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    if (this.allowOnlyFuture() && currentDate < today) {
      return false;
    }
    if (this.allowOnlyPast() && currentDate > today) {
      return false;
    }
    if (this.minDate() && currentDate < new Date(this.minDate()!.getFullYear(), this.minDate()!.getMonth(), this.minDate()!.getDate())) {
      return false;
    }
    if (this.maxDate() && currentDate > new Date(this.maxDate()!.getFullYear(), this.maxDate()!.getMonth(), this.maxDate()!.getDate())) {
      return false;
    }
    if (this.disabledDays()?.length) {
      const dayName = this.getWeekdayName(date.getDay());
      if (this.disabledDays().includes(dayName)) {
        return false;
      }
    }
    if (this.disabledDates()?.some(d => DateUtils.isSameDate(d, currentDate))) {
      return false;
    }
    return true;
  }

  private getWeekdayName(dayIndex: number): Weekday {
    const days: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }
}