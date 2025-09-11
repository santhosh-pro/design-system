import {Component, ElementRef, inject, input, OnDestroy, signal, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule, ValidatorFn} from "@angular/forms";
import {NgClass} from "@angular/common";
import {Subscription} from "rxjs";
import {isValidDate} from "rxjs/internal/util/isDate";
import {Weekday} from './date-picker-overlay/date-picker/date-picker';
import {DatePickerOverlayComponent} from './date-picker-overlay/date-picker-overlay';
import {DatePickerComponent} from './date-picker-overlay/date-picker/date-picker';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { FormValidationUtils } from '../../../../core/form-validation-utils';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { onlyFutureDateValidator } from '../../../../core/validators/only-future-date-validator';
import { onlyPastDateValidator } from '../../../../core/validators/only-past-date-validator';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';
import { OverlayService } from '../../../overlay/overlay';
import { InputDateFormat } from '../date-format';
import { NgxMaskDirective } from '../../../../core/input-mask/ngx-mask.directive';


type ViewType = 'picker' | 'calendar';

@Component({
  selector: 'ui-date-input',
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgClass,
    BaseInputComponent,
    AppSvgIconComponent,
    FormsModule,
    DatePickerComponent
  ],
  templateUrl: './date-input.html',
  styleUrl: './date-input.scss'
})
export class DateInputComponent extends BaseControlValueAccessor<Date | null> implements OnDestroy {
  @ViewChild('trigger', {static: false}) trigger?: ElementRef; // Changed to optional and static: false

  label = input<string | null>();
  iconSrc = input<string | null>();
  showDatePickerIcon = input<boolean>(true);
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  viewType = input<ViewType>('picker');

  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  disabledDays = input<Weekday[]>([]);
  disabledDates = input<Date[]>([]);
  value = input<Date | null>(null);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.mmddyyyy);

  overlayService = inject(OverlayService);

  isFocused = signal(false);
  textInputValue = signal<string | null>(null);
  private subscription?: Subscription;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onValueReady(value: any): void {
    this.updateValidations();
    if (value == null) {
      return;
    }

    if (value instanceof Date) {
      if (isValidDate(value)) {
        this.selValue(value);
      } else {
        this.selValue(null);
      }
      return;
    }

    const date = new Date(value);

    if (this.isValidDate(date)) {
      this.selValue(date);
      return;
    } else {
      this.selValue(null);
    }
  }

  updateValidations() {
    let formUtils = new FormValidationUtils();
    const validatorsToAdd: ValidatorFn[] = [];

    if (this.allowOnlyPast()) {
      validatorsToAdd.push(onlyPastDateValidator());
    }

    if (this.allowOnlyFuture()) {
      validatorsToAdd.push(onlyFutureDateValidator());
    }

    formUtils.updateValidatorsIfNeeded(this.formControl, validatorsToAdd);
  }

  selValue(value: any) {
    setTimeout(() => {
      if (value) {
        this.textInputValue.set(this.formatDate(value));
        this.onValueChange(value);
      } else {
        this.onValueChange(null);
      }
    }, 100);
  }

  isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
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
      cls = cls + 'pr-3 pl-10';
    } else {
      cls = cls + 'px-3';
    }

    if (this.fullWidth()) {
      cls = cls + ' ' + 'w-full';
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

  onInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    const inputValue = target.value.trim();
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    const parsedDate = this.parseDate(inputValue);

    if (parsedDate) {
      this.onValueChange(parsedDate);
    } else if (numericValue.length === 8) {
      this.textInputValue.set(null);
      this.onValueChange(null);
    }
  }

async onDatePickerIconClicked() {
  if (!this.trigger?.nativeElement || this.viewType() !== 'picker') {
    return; // Guard clause to prevent execution if trigger is undefined or not in picker mode
  }

  const result: Date | undefined = await this.overlayService.openNearElement(DatePickerOverlayComponent, this.trigger.nativeElement, {
    data: {
      selectedDate: this.value,
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      allowOnlyPast: this.allowOnlyPast(),
      allowOnlyFuture: this.allowOnlyFuture(),
      disabledDays: this.disabledDays(),
      disabledDates: this.disabledDates()
    }
  });

  if (result) {
    const formattedDate = this.formatDate(result);
    this.textInputValue.set(formattedDate);
    this.onValueChange(result);
  }
}

  onDateSelected(date: Date) {
    const formattedDate = this.formatDate(date);
    this.textInputValue.set(formattedDate);
    this.onValueChange(date);
  }

  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [part1, part2, part3] = parts.map(Number);
    const [mm, dd, yyyy] = this.inputDateFormat() === InputDateFormat.mmddyyyy ? [part1, part2, part3] : [part2, part1, part3];

    if (!mm || !dd || !yyyy || mm > 12 || dd > 31 || yyyy < 1000 || yyyy > 9999) return null;

    const parsedDate = new Date(yyyy, mm - 1, dd);
    if (parsedDate.getMonth() + 1 !== mm || parsedDate.getDate() !== dd || parsedDate.getFullYear() !== yyyy) {
      return null;
    }

    return parsedDate;
  }

  private formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return this.inputDateFormat() === InputDateFormat.mmddyyyy ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
  }
}