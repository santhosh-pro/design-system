import { AfterContentInit, AfterViewInit, Component, inject, input, output, signal, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../core/base-input/base-input';
import { NgxMaskDirective } from '../../../core/input-mask/ngx-mask.directive';
import { AppSvgIconComponent } from '../../misc/app-svg-icon/app-svg-icon';
import { HumanizeFormMessagesPipe } from '../../misc/humanize-form-messages';
import { CheckboxField } from '../../forms/select/checkbox-field/checkbox-field';

@Component({
  selector: 'ui-time-picker',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    BaseInputComponent,
    HumanizeFormMessagesPipe,
    NgxMaskDirective,
    CheckboxField,
    PortalModule,
    OverlayModule,
    AppSvgIconComponent,
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
})
export class TimePickerComponent extends BaseControlValueAccessor<TimePickerValue> implements AfterContentInit, AfterViewInit {
  overlay = inject(Overlay);
  cdr = inject(ChangeDetectorRef);

  // Inputs
  iconSrc = input<string | null>(null);
  fullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  showTimePickerIcon = input<boolean>(true);

  // Outputs
  valueChanged = output<TimePickerValue>();

  // Signals
  isOpen = signal(false);
  override errorMessages = input<{ [key: string]: string }>({ required: 'Time is required' });
  enableApplyActions = signal<boolean>(true);
  hours = signal<number>(12);
  minutes = signal<number>(0);
  period = signal<'AM' | 'PM'>('AM');
  is24HourFormat = signal<boolean>(false);
  isFocused = signal(false);
  isTimePickerIconReady = signal<boolean>(false);

  // Reference to time picker icon for overlay origin
  @ViewChild('timePickerIcon', { static: false }) timePickerIcon?: ElementRef;

  // Overlay scroll strategy
  scrollStrategy = this.overlay.scrollStrategies.reposition();

  // Track initial values for cancel
  private initialHours!: number;
  private initialMinutes!: number;
  private initialPeriod!: 'AM' | 'PM';
  private initialFormat!: boolean;

  override ngAfterContentInit(): void {
    this.onValueReady(this.formControl.value);
  }

  ngAfterViewInit(): void {
    if (this.timePickerIcon) {
      this.isTimePickerIconReady.set(true);
      this.cdr.detectChanges();
    }
  }

  protected override onValueReady(value: TimePickerValue | null): void {
    if (value) {
      let hours = Math.max(0, Math.min(23, value.hours));
      let minutes = Math.max(0, Math.min(59, value.minutes));

      this.minutes.set(minutes);

      if (this.is24HourFormat()) {
        this.hours.set(hours);
      } else {
        if (hours === 0) {
          this.hours.set(12);
          this.period.set('AM');
        } else if (hours === 12) {
          this.hours.set(12);
          this.period.set('PM');
        } else if (hours < 12) {
          this.hours.set(hours);
          this.period.set('AM');
        } else {
          this.hours.set(hours - 12);
          this.period.set('PM');
        }
      }
    } else {
      this.hours.set(12);
      this.minutes.set(0);
      this.period.set('AM');
      this.is24HourFormat.set(false);
    }
    this.initialHours = this.hours();
    this.initialMinutes = this.minutes();
    this.initialPeriod = this.period();
    this.initialFormat = this.is24HourFormat();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
    // Ensure the input reflects the current valid time
    const input = this.timePickerIcon?.nativeElement.previousElementSibling as HTMLInputElement;
    if (input) {
      input.value = `${this.getFormattedHours()}:${this.getFormattedMinutes()}`;
    }
  }

  getClass(): string {
    let cls = 'h-[46px] rounded-md';
    if (this.iconSrc()) {
      cls += ' pr-3 pl-10';
    } else {
      cls += ' px-3';
    }
    if (this.fullWidth()) {
      cls += ' w-full';
    }
    return cls;
  }

  onHourUpClicked(): void {
    this.hours.update((prev) => {
      if (this.is24HourFormat()) {
        return prev === 23 ? 0 : prev + 1;
      }
      return prev === 12 ? 1 : prev + 1;
    });
    this.valueUpdated();
  }

  onHourDownClicked(): void {
    this.hours.update((prev) => {
      if (this.is24HourFormat()) {
        return prev === 0 ? 23 : prev - 1;
      }
      return prev === 1 ? 12 : prev - 1;
    });
    this.valueUpdated();
  }

  onMinuteUpClicked(): void {
    this.minutes.update((prev) => (prev === 59 ? 0 : prev + 1));
    this.valueUpdated();
  }

  onMinuteDownClicked(): void {
    this.minutes.update((prev) => (prev === 0 ? 59 : prev - 1));
    this.valueUpdated();
  }

  togglePeriod(): void {
    if (!this.is24HourFormat()) {
      this.period.update((prev) => (prev === 'AM' ? 'PM' : 'AM'));
      this.valueUpdated();
    }
  }

  toggle24HourFormat(isChecked: boolean): void {
    this.is24HourFormat.set(isChecked);
    if (isChecked) {
      if (this.period() === 'PM' && this.hours() !== 12) {
        this.hours.set(this.hours() + 12);
      } else if (this.period() === 'AM' && this.hours() === 12) {
        this.hours.set(0);
      }
      this.period.set('AM');
    } else {
      if (this.hours() >= 12) {
        this.period.set('PM');
        this.hours.set(this.hours() === 12 ? 12 : this.hours() - 12);
      } else {
        this.period.set('AM');
        this.hours.set(this.hours() === 0 ? 12 : this.hours());
      }
    }
    this.valueUpdated();
  }

  validateHours(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const inputHours = parseInt(input.value, 10);

    if (this.is24HourFormat()) {
      if (!isNaN(inputHours) && inputHours >= 0 && inputHours <= 23) {
        this.hours.set(inputHours);
      }
    } else {
      if (!isNaN(inputHours) && inputHours >= 1 && inputHours <= 12) {
        this.hours.set(inputHours);
      }
    }
    input.value = this.getFormattedHours();
    this.valueUpdated();
  }

  validateMinutes(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const inputMinutes = parseInt(input.value, 10);

    if (!isNaN(inputMinutes) && inputMinutes >= 0 && inputMinutes <= 59) {
      this.minutes.set(inputMinutes);
    }
    input.value = this.getFormattedMinutes();
    this.valueUpdated();
  }

  getFormattedHours(): string {
    const hours = this.hours();
    return hours < 10 ? `0${hours}` : `${hours}`;
  }

  getFormattedMinutes(): string {
    const minutes = this.minutes();
    return minutes < 10 ? `0${minutes}` : `${minutes}`;
  }

  valueUpdated(): void {
    const hours = this.is24HourFormat()
      ? this.hours()
      : this.period() === 'PM'
      ? this.hours() === 12
        ? 12
        : this.hours() + 12
      : this.hours() === 12
      ? 0
      : this.hours();

    const value: TimePickerValue = {
      hours,
      minutes: this.minutes(),
    };

    this.formControl.setValue(value, { emitEvent: false });
    this.onValueChange(value);
    this.valueChanged.emit(value);
  }

  onTimePickerIconClick(): void {
    if (this.isTimePickerIconReady()) {
      if (!this.isOpen()) {
        // Reinitialize state from formControl value
        this.onValueReady(this.formControl.value);
      }
      this.isOpen.update((prev) => !prev);
    }
  }

  onClickOutside(): void {
    this.onCancel();
  }

  onApply(): void {
    this.valueUpdated();
    this.isOpen.set(false);
  }

  onCancel(): void {
    this.hours.set(this.initialHours);
    this.minutes.set(this.initialMinutes);
    this.period.set(this.initialPeriod);
    this.is24HourFormat.set(this.initialFormat);
    this.isOpen.set(false);
    this.valueUpdated();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && value.match(/^\d{2}:\d{2}$/)) {
      const [hoursStr, minutesStr] = value.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (this.is24HourFormat()) {
        if (hours >= 0 && hours <= 23) {
          this.hours.set(hours);
        }
      } else {
        if (hours >= 1 && hours <= 12) {
          this.hours.set(hours);
        }
      }

      if (minutes >= 0 && minutes <= 59) {
        this.minutes.set(minutes);
      }

      this.valueUpdated();
      input.value = `${this.getFormattedHours()}:${this.getFormattedMinutes()}`;
    }
  }
}

export interface TimePickerValue {
  hours: number;
  minutes: number;
}