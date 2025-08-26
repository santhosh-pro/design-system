import {
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
  computed,
  ChangeDetectorRef,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule, ValidatorFn } from "@angular/forms";
import { NgClass } from "@angular/common";
import { Subscription } from "rxjs";
import { isValidDate } from "rxjs/internal/util/isDate";
import { DateRangePickerOverlayComponent } from "./date-range-picker-overlay/date-range-picker-overlay";
import { BaseControlValueAccessor } from "../../../../core/base-control-value-accessor";
import { BaseInputComponent } from "../../../../core/base-input/base-input";
import { FormValidationUtils } from "../../../../core/form-validation-utils";
import { HumanizeFormMessagesPipe } from "../../../misc/humanize-form-messages";
import { onlyFutureDateValidator } from "../../../../core/validators/only-future-date-validator";
import { onlyPastDateValidator } from "../../../../core/validators/only-past-date-validator";
import { AppSvgIconComponent } from "../../../misc/app-svg-icon/app-svg-icon";
import { OverlayService } from "../../../overlay/overlay";
import { DateRangeEvent } from "./date-range-picker-overlay/date-range-picker/date-range-picker";
import { InputDateFormat } from "../date-format";


@Component({
  selector: "ui-date-range-input",
  standalone: true,
  imports: [
    HumanizeFormMessagesPipe,
    ReactiveFormsModule,
    NgClass,
    BaseInputComponent,
    AppSvgIconComponent,
    FormsModule,
  ],
  templateUrl: "./date-range-input.html",
})
export class DateRangeInputComponent
  extends BaseControlValueAccessor<DateRangeEvent | null>
  implements OnInit, OnDestroy
{
  @ViewChild("trigger", { static: false }) trigger?: ElementRef;

  label = input<string | null>(null);
  iconSrc = input<string | null>(null);
  showDatePickerIcon = input<boolean>(true);
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  allowToday = input<boolean>(false);
  minDaysRange = input<number | null>(null);
  maxDaysRange = input<number | null>(null);
  inputDateFormat = input<InputDateFormat>(InputDateFormat.ddmmyyyy);

  overlayService = inject(OverlayService);
  private cdr = inject(ChangeDetectorRef);

  isFocused = signal(false);
  
  // Store the actual value in a signal
  private _currentValue = signal<DateRangeEvent | null>(null);
  
  // Use computed for the text display - this prevents NG0100
  textInputValue = computed(() => {
    const value = this._currentValue();
    return value ? this.formatDateRange(value) : "";
  });

  private subscription?: Subscription;
  private isInternalUpdate = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.updateValidations();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onValueReady(value: any): void {
    if (this.isInternalUpdate) {
      return;
    }

    console.log('onValueReady called with:', value); // Debug log

    if (!value) {
      this.updateInternalValue(null);
      return;
    }

    if (
      value?.startDate instanceof Date &&
      value?.endDate instanceof Date &&
      isValidDate(value.startDate) &&
      isValidDate(value.endDate)
    ) {
      this.updateInternalValue({
        startDate: value.startDate,
        endDate: value.endDate
      });
    } else {
      this.updateInternalValue(null);
    }
  }

  // Centralized method to update both internal state and form control
  private updateInternalValue(value: DateRangeEvent | null): void {
    this.isInternalUpdate = true;
    
    // Update the internal signal first
    this._currentValue.set(value);
    
    // Then update the form control without emitting events to prevent loops
    this.formControl.setValue(value, { emitEvent: false });
    
    // Force change detection for zoneless Angular
    this.cdr.detectChanges();
    
    this.isInternalUpdate = false;
  }

  // Override writeValue for external changes (like from parent form)
  override writeValue(value: DateRangeEvent | null): void {
    if (this.isInternalUpdate) {
      return;
    }
    
    console.log('writeValue called with:', value); // Debug log
    
    if (value && value.startDate && value.endDate) {
      if (isValidDate(value.startDate) && isValidDate(value.endDate)) {
        this.updateInternalValue(value);
      } else {
        this.updateInternalValue(null);
      }
    } else {
      this.updateInternalValue(null);
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
    this.markTouched();
  }

  onDatePickerIconClicked() {
    const currentValue = this._currentValue() || this.formControl.value;
    
    const dialogData = {
      data: {
        selectedRange: currentValue,
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
        "Trigger element is not available. Opening overlay without positioning."
      );
      dialogRef = this.overlayService.openModal(
        DateRangePickerOverlayComponent,
        dialogData
      );
    } else {
      dialogRef = this.overlayService.openNearElement(
        DateRangePickerOverlayComponent,
        this.trigger.nativeElement,
        {
          data: dialogData.data,
          disableClose: false,
          positionPreference: "bottomLeft",
        }
      );
    }

    this.subscription?.unsubscribe();
    this.subscription = dialogRef.closed.subscribe(
      (range: DateRangeEvent | undefined) => {
        console.log('Dialog closed with range:', range); // Debug log
        
        if (range?.startDate && range?.endDate) {
          if (isValidDate(range.startDate) && isValidDate(range.endDate)) {
            console.log('Setting valid range:', range); // Debug log
            // Force update both signals and form control
            this.updateValueFromPicker(range);
          } else {
            console.error("Invalid date range selected:", range);
            this.updateValueFromPicker(null);
          }
        } else if (range === null || range === undefined) {
          // Handle explicit null/undefined (user cleared selection)
          console.log('Clearing range'); // Debug log
          this.updateValueFromPicker(null);
        }
      }
    );
  }

  // Dedicated method for picker updates to ensure proper state sync
  private updateValueFromPicker(range: DateRangeEvent | null): void {
    // Update internal signal first
    this._currentValue.set(range);
    
    // Update form control with events enabled for user interactions
    this.formControl.setValue(range, { emitEvent: true });
    
    // Call the parent value change handler
    this.onValueChange(range);
    
    // Force change detection in zoneless Angular
    this.cdr.detectChanges();
    
    console.log('Updated value:', range, 'Display text:', this.textInputValue()); // Debug log
  }

  clearRange() {
    this.updateValueFromPicker(null);
  }

  formatDateRange(range: DateRangeEvent | null): string {
    if (!range || !range.startDate || !range.endDate) {
      return "";
    }

    const formatDate = (date: Date) => {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return this.inputDateFormat() === InputDateFormat.mmddyyyy
        ? `${mm}/${dd}/${yyyy}`
        : `${dd}/${mm}/${yyyy}`;
    };
    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
  }
}