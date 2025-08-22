import {
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule, ValidatorFn } from "@angular/forms";
import { NgClass } from "@angular/common";
import { Subscription } from "rxjs";
import { isValidDate } from "rxjs/internal/util/isDate";
import { DateRangeEvent } from "./date-range-picker-overlay/date-range-picker/date-range-picker.component";
import { DateRangePickerOverlayComponent } from "./date-range-picker-overlay/date-range-picker-overlay.component";
import { BaseControlValueAccessorV3 } from "../../core/base-control-value-accessor-v3";
import { BaseInputComponent } from "../../core/base-input/base-input.component";
import { FormValidationUtils } from "../../core/form-validation-utils";
import { HumanizeFormMessagesPipe } from "../../core/humanize-form-messages.pipe";
import { onlyFutureDateValidator } from "../../core/validators/only-future-date-validator";
import { onlyPastDateValidator } from "../../core/validators/only-past-date-validator";
import { AppSvgIconComponent } from "../app-svg-icon/app-svg-icon.component";
import { OverlayService } from "../overlay/overlay.service";

export enum InputDateFormat {
  mmddyyyy,
  ddmmyyyy,
}

@Component({
  selector: "app-date-range-input",
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    ReactiveFormsModule,
    NgClass,
    BaseInputComponent,
    AppSvgIconComponent,
    FormsModule,
  ],
  templateUrl: "./date-range-input.component.html",
})
export class DateRangeInputComponent
  extends BaseControlValueAccessorV3<DateRangeEvent | null>
  implements OnDestroy
{
  @ViewChild("trigger", { static: false }) trigger?: ElementRef;

  label = input<string | null>();
  iconSrc = input<string | null>();
  showDatePickerIcon = input<boolean>(true);
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);

  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  allowToday = input<boolean>(false);
  minDaysRange = input<number | null>(null);
  maxDaysRange = input<number | null>(null);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.ddmmyyyy);

  overlayService = inject(OverlayService);

  isFocused = signal(false);
  textInputValue = signal<string>("");

  private subscription?: Subscription;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onValueReady(value: any): void {
    this.updateValidations();
    if (value == null) {
      this.selValue(null);
      return;
    }

    if (
      value?.startDate instanceof Date &&
      value?.endDate instanceof Date &&
      isValidDate(value.startDate) &&
      isValidDate(value.endDate)
    ) {
      this.selValue({ startDate: value.startDate, endDate: value.endDate });
    } else {
      this.selValue(null); // Reset if invalid range
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

  selValue(value: DateRangeEvent | null) {
    setTimeout(() => {
      this.textInputValue.set("");
      this.onValueChange(value); // Programmatic change, only triggers valueChanged
    }, 100);
  }

  get placeHolder(): string {
    switch (this.inputDateFormat()) {
      case InputDateFormat.mmddyyyy:
        return "mm/dd/yyyy";
      case InputDateFormat.ddmmyyyy:
        return "dd/mm/yyyy";
    }
  }

  getClass() {
    let cls = "";
    if (this.iconSrc()) {
      cls += "pl-10";
    } else {
      cls += "pl-3";
    }

    if (this.fullWidth()) {
      cls += " w-full";
    }

    return cls;
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
    this.onTouched();
  }

  onDatePickerIconClicked() {
    const dialogData = {
      data: {
        selectedRange: this.controlValue || null,
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        allowOnlyPast: this.allowOnlyPast(),
        allowOnlyFuture: this.allowOnlyFuture(),
        allowToday: this.allowToday(),
        minDaysRange: this.minDaysRange(),
        maxDaysRange: this.maxDaysRange(),
      },
      positionPreference: "bottom",
    };

    let dialogRef;
    if (!this.trigger?.nativeElement) {
      console.warn(
        "Trigger element is not available. Opening overlay without positioning.",
      );
      dialogRef = this.overlayService.openModal(
        DateRangePickerOverlayComponent,
        dialogData,
      );
    } else {
      dialogRef = this.overlayService.openNearElement(
        DateRangePickerOverlayComponent,
        this.trigger.nativeElement,
        {
          data: dialogData.data,
          disableClose: true,
          positionPreference: "bottomLeft",
        },
      );
    }

    this.subscription?.unsubscribe();
    this.subscription = dialogRef.closed.subscribe(
      (range: DateRangeEvent | undefined) => {
        if (range) {
          if (
            range.startDate instanceof Date &&
            range.endDate instanceof Date &&
            isValidDate(range.startDate) &&
            isValidDate(range.endDate)
          ) {
            this.textInputValue.set("");
            this.onUserValueChange(range); // User-initiated change, triggers userChanged
          } else if (
            range.startDate instanceof Date &&
            isValidDate(range.startDate) &&
            !range.endDate
          ) {
            // Prompt to select end date if only start date is set
            console.warn("Please select an end date to complete the range.");
            this.onUserValueChange({
              startDate: range.startDate,
              endDate: new Date(range.startDate),
            }); // Temporary end date, user-initiated
          }
        } else {
          this.onUserValueChange(null); // User-initiated reset
        }
      },
    );
  }

  clearRange() {
    this.textInputValue.set("");
    this.onUserValueChange(null); // User-initiated reset
  }

  formatDateRange(range: DateRangeEvent): string {
    const formatDate = (date: Date) => {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return this.inputDateFormat() === InputDateFormat.mmddyyyy
        ? `${mm}/${dd}/${yyyy}`
        : `${dd}/${mm}/${yyyy}`;
    };
    return range.endDate
      ? `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`
      : formatDate(range.startDate);
  }
}