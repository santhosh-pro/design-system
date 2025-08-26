import { Component, ElementRef, inject, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { isValidDate } from 'rxjs/internal/util/isDate';
import { MultiDatePickerOverlayComponent } from './multi-date-picker-overlay/multi-date-picker-overlay';
import { Weekday } from './multi-date-picker-overlay/multi-date-picker/multi-date-picker';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { OverlayService } from '../../../overlay/overlay';
import { InputDateFormat } from '../date-format';
import { NgxMaskDirective } from '../../input-mask/ngx-mask.directive';


@Component({
  selector: 'ui-multi-date-input',
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgClass,
    BaseInputComponent,
    AppSvgIconComponent,
    FormsModule,
],
  templateUrl: './multi-date-input.html',
  styleUrl: './multi-date-input.css'
})
export class MultiDateInputComponent extends BaseControlValueAccessor<Date[]> implements OnDestroy {
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

  overlayService = inject(OverlayService);

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

  onDatePickerIconClicked() {
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

    let dialogRef;
    if (!this.trigger?.nativeElement) {
      console.warn('Trigger element is not available. Opening overlay without positioning.');
      dialogRef = this.overlayService.openModal(MultiDatePickerOverlayComponent, dialogData);
    } else {
      dialogRef = this.overlayService.openNearElement(MultiDatePickerOverlayComponent, this.trigger.nativeElement, {
        data: dialogData.data,
        disableClose: true,
        positionPreference: 'bottomLeft'
      });
    }

    this.subscription?.unsubscribe(); // Unsubscribe from previous subscription
    this.subscription = dialogRef.closed.subscribe((dates: Date[] | undefined) => {
      if (dates && Array.isArray(dates) && dates.length > 0 && dates.every(date => date instanceof Date && isValidDate(date))) {
        this.textInputValue.set('');
        this.onValueChange(dates);
      }
      // If dates is undefined or empty, do nothing to preserve existing value
    });
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