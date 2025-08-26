import { Component, input, OnInit, output, signal } from "@angular/core";
import { NgClass } from "@angular/common";
import { BaseControlValueAccessor } from "../../../../../../core/base-control-value-accessor";
import { Weekday } from "../../../date-input/date-picker-overlay/date-picker/date-picker";

export interface DateRangeEvent {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: "app-date-range-picker",
  imports: [NgClass],
  standalone: true,
  templateUrl: "./date-range-picker.component.html",
  styleUrl: "./date-range-picker.component.css",
})
export class DateRangePickerComponent
  extends BaseControlValueAccessor<DateRangeEvent | null>
  implements OnInit
{
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  allowToday = input<boolean>(false);
  minDaysRange = input<number | null>(null);
  maxDaysRange = input<number | null>(null);


  dateRangeSelected = output<DateRangeEvent>();

  days: { day: Weekday; displayName: string }[] = [
    { day: "sunday", displayName: "Su" },
    { day: "monday", displayName: "Mo" },
    { day: "tuesday", displayName: "Tu" },
    { day: "wednesday", displayName: "We" },
    { day: "thursday", displayName: "Th" },
    { day: "friday", displayName: "Fr" },
    { day: "saturday", displayName: "Sa" },
  ];

  months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  uiMode = signal<"date" | "month" | "year">("date");
  activeMonth = signal<number>(0);
  activeYear = signal<number>(0);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  selectingStart = signal(true);
  hoveredDate = signal<Date | null>(null);

  years: { value: number; isEnabled: boolean }[] = [];
  daysOfMonth: { value: number; isEnabled: boolean }[] = [];
  blankDays: number[] = [];

  ngOnInit(): void {
    this.initDate();
    this.populateDays();
  }

  override writeValue(value: DateRangeEvent | null): void {
    if (value?.startDate && value?.endDate) {
      this.startDate.set(new Date(value.startDate));
      this.endDate.set(new Date(value.endDate));
      this.activeMonth.set(this.startDate()!.getMonth());
      this.activeYear.set(this.startDate()!.getFullYear());
    } else {
      this.initDate();
    }
    this.selectingStart.set(true);
    this.populateDays();
  }

  protected override onValueReady(value: DateRangeEvent | null): void {
    this.writeValue(value);
  }

  initDate() {
    const today = new Date();
    this.activeMonth.set(today.getMonth());
    this.activeYear.set(today.getFullYear());
    this.startDate.set(null);
    this.endDate.set(null);
  }

  getMMMYYYY() {
    return `${this.months[this.activeMonth()]} ${this.activeYear()}`;
  }

  populateYears(): void {
    let startYear = Math.floor(this.activeYear() / 24) * 24;
    if (startYear <= 0) startYear = 1;

    const todayYear = new Date().getFullYear();

    this.years = Array.from({ length: 24 }, (_, i) => {
      const year = startYear + i;
      let isEnabled = true;

      if (this.allowOnlyPast() && year > todayYear) isEnabled = false;
      if (this.allowOnlyFuture() && year < todayYear) isEnabled = false;

      if (isEnabled && this.minDate()) {
        isEnabled = year >= this.minDate()!.getFullYear();
      }

      if (isEnabled && this.maxDate()) {
        isEnabled = isEnabled && year <= this.maxDate()!.getFullYear();
      }

      return { value: year, isEnabled };
    });
  }

  populateDays() {
    const daysInMonth = new Date(
      this.activeYear(),
      this.activeMonth() + 1,
      0,
    ).getDate();
    this.blankDays = Array.from(
      { length: new Date(this.activeYear(), this.activeMonth()).getDay() },
      (_, i) => i + 1,
    );

    this.daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const currentDate = new Date(this.activeYear(), this.activeMonth(), day);
      let isEnabled = true;

      if (this.allowOnlyFuture() && currentDate < new Date()) {
        isEnabled = false;
      }

      if (this.allowOnlyPast() && currentDate > new Date()) {
        isEnabled = false;
      }

      if (isEnabled && this.minDate()) {
        isEnabled = currentDate >= this.minDate()!;
      }

      if (isEnabled && this.maxDate()) {
        isEnabled = isEnabled && currentDate <= this.maxDate()!;
      }

      if (this.allowToday() && this.isToday(day)) {
        isEnabled = true;
      }

      if (
        isEnabled &&
        this.startDate() &&
        !this.endDate() &&
        (this.minDaysRange() || this.maxDaysRange())
      ) {
        const minDate = this.minDaysRange() ? new Date(this.startDate()!) : null;
        const maxDate = this.maxDaysRange() ? new Date(this.startDate()!) : null;

        if (minDate) {
          minDate.setDate(this.startDate()!.getDate() + this.minDaysRange()!);
          isEnabled = isEnabled && currentDate >= minDate;
        }

        if (maxDate) {
          maxDate.setDate(this.startDate()!.getDate() + this.maxDaysRange()!);
          isEnabled = isEnabled && currentDate <= maxDate;
        }
      }

      return { value: day, isEnabled };
    });
  }

  isMonthEnabled(month: number): boolean {
    const monthStartDate = new Date(this.activeYear(), month, 1);
    const today = new Date();
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (this.allowOnlyPast() && monthStartDate > todayMonthStart) return false;
    if (this.allowOnlyFuture() && monthStartDate < todayMonthStart)
      return false;

    if (this.minDate()) {
      const minMonthStart = new Date(
        this.minDate()!.getFullYear(),
        this.minDate()!.getMonth(),
        1,
      );
      if (monthStartDate < minMonthStart) return false;
    }

    if (this.maxDate()) {
      const maxMonthStart = new Date(
        this.maxDate()!.getFullYear(),
        this.maxDate()!.getMonth(),
        1,
      );
      if (monthStartDate > maxMonthStart) return false;
    }

    return true;
  }

  onYearSelected(year: number): void {
    this.activeYear.set(year);
    this.uiMode.set("month");
  }

  onMonthSelected(month: number): void {
    this.activeMonth.set(month);
    this.uiMode.set("date");
    this.populateDays();
  }

  isToday(day: number) {
    const today = new Date();
    const d = new Date(this.activeYear(), this.activeMonth(), day);
    return today.toDateString() === d.toDateString();
  }

  onDaySelected(day: number) {
    const selectedDate = new Date(this.activeYear(), this.activeMonth(), day);

    if (this.selectingStart()) {
      this.startDate.set(selectedDate);
      this.endDate.set(null);
      this.hoveredDate.set(null);
      this.selectingStart.set(false);
      this.populateDays();
    } else {
      let endDate = selectedDate;
      if (selectedDate < this.startDate()!) {
        endDate = this.startDate()!;
        this.startDate.set(selectedDate);
      }

      const diffTime = Math.abs(endDate.getTime() - this.startDate()!.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (this.minDaysRange() && diffDays < this.minDaysRange()!) {
        endDate = new Date(this.startDate()!);
        endDate.setDate(this.startDate()!.getDate() + this.minDaysRange()!);
      } else if (this.maxDaysRange() && diffDays > this.maxDaysRange()!) {
        endDate = new Date(this.startDate()!);
        endDate.setDate(this.startDate()!.getDate() + this.maxDaysRange()!);
      }

      this.endDate.set(endDate);

      const event: DateRangeEvent = {
        startDate: this.startDate()!,
        endDate: this.endDate()!,
      };
      this.dateRangeSelected.emit(event);
      this.onValueChange(event);
      this.selectingStart.set(true);
    }
  }

  onDayHovered(day: number) {
    if (this.startDate() && !this.endDate()) {
      this.hoveredDate.set(new Date(this.activeYear(), this.activeMonth(), day));
    } else {
      this.hoveredDate.set(null);
    }
  }

  isDateInSelectionRange(day: number): boolean {
    const date = new Date(this.activeYear(), this.activeMonth(), day);
    if (this.startDate() && this.endDate()) {
      return date >= this.startDate()! && date <= this.endDate()!;
    }
    return false;
  }

  isDateInHoveredRange(day: number): boolean {
    const date = new Date(this.activeYear(), this.activeMonth(), day);
    if (this.startDate() && this.hoveredDate() && !this.endDate()) {
      return date > this.startDate()! && date < this.hoveredDate()!;
    }
    return false;
  }

  isDateHovered(day: number): boolean {
    const date = new Date(this.activeYear(), this.activeMonth(), day);
    return this.hoveredDate()?.getTime() === date.getTime();
  }

  isSelectionStartDate(day: number): boolean {
    const date = new Date(this.activeYear(), this.activeMonth(), day);
    return !!this.startDate() && date.toDateString() === this.startDate()!.toDateString();
  }

  isSelectionEndDate(day: number): boolean {
    const date = new Date(this.activeYear(), this.activeMonth(), day);
    return !!this.endDate() && date.toDateString() === this.endDate()!.toDateString();
  }

  previousMonthPressed() {
    switch (this.uiMode()) {
      case "year":
        if (this.activeYear() > 24) {
          this.activeYear.set(this.activeYear() - 24);
          this.populateYears();
        }
        break;
      case "month":
        if (this.activeYear() > 1) {
          this.activeYear.set(this.activeYear() - 1);
        }
        break;
      case "date":
        if (this.activeMonth() === 0) {
          if (this.activeYear() > 1) {
            this.activeYear.set(this.activeYear() - 1);
            this.activeMonth.set(11);
          }
        } else {
          this.activeMonth.set(this.activeMonth() - 1);
        }
        this.populateDays();
        break;
      default:
        console.warn("Unknown mode:", this.uiMode());
    }
  }

  nextMonthPressed() {
    switch (this.uiMode()) {
      case "year":
        this.activeYear.set(this.activeYear() + 24);
        this.populateYears();
        break;
      case "month":
        this.activeYear.set(this.activeYear() + 1);
        break;
      case "date":
        if (this.activeMonth() === 11) {
          this.activeYear.set(this.activeYear() + 1);
          this.activeMonth.set(0);
        } else {
          this.activeMonth.set(this.activeMonth() + 1);
        }
        this.populateDays();
        break;
      default:
        console.warn("Unknown mode:", this.uiMode());
    }
  }

  onYearSelectionPressed() {
    switch (this.uiMode()) {
      case "year":
        this.uiMode.set("date");
        break;
      case "month":
        this.uiMode.set("year");
        break;
      case "date":
        this.populateYears();
        this.uiMode.set("year");
        break;
    }
  }

  getFirstYear() {
    return this.years[0].value;
  }

  getLastYear() {
    return this.years[this.years.length - 1].value;
  }

  resetSelection() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.hoveredDate.set(null);
    this.selectingStart.set(true);
    this.onValueChange(null);
  }

  toggleSelectionMode(day: number) {
    if (this.isSelectionStartDate(day)) {
      this.selectingStart.set(true);
    } else if (this.isSelectionEndDate(day)) {
      this.selectingStart.set(false);
    }
  }
}