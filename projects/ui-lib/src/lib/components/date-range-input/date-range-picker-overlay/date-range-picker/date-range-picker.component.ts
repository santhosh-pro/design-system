import {Component, input, OnInit, output, signal} from '@angular/core';
import {NgClass} from "@angular/common";
import { Weekday } from '../../../multi-date-input/multi-date-picker-overlay/multi-date-picker/multi-date-picker.component';
import { BaseControlValueAccessorV3 } from '../../../../core/base-control-value-accessor-v3';

@Component({
  selector: 'app-date-range-picker',
  imports: [
    NgClass
  ],
  standalone: true,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.css'
})
export class DateRangePickerComponent extends BaseControlValueAccessorV3<DateRangeEvent | null> implements OnInit {

  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  allowToday = input<boolean>(false);

  dateRangeSelected = output<DateRangeEvent>();

  days: { day: Weekday, displayName: string }[] = [
    {day: 'sunday', displayName: 'Su'},
    {day: 'monday', displayName: 'Mo'},
    {day: 'tuesday', displayName: 'Tu'},
    {day: 'wednesday', displayName: 'We'},
    {day: 'thursday', displayName: 'Th'},
    {day: 'friday', displayName: 'Fr'},
    {day: 'saturday', displayName: 'Sa'}
  ];

  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  uiMode = signal<'date' | 'month' | 'year'>('date');

  activeMonth!: number;
  activeYear!: number;
  startDate?: Date | null;
  endDate?: Date | null;

  selectingStart = true;
  hoveredDate: Date | null = null;

  years: { value: number; isEnabled: boolean }[] = [];
  daysOfMonth: { value: number; isEnabled: boolean }[] = [];
  blankDays: number[] = [];

  ngOnInit(): void {
    this.initDate();
    this.populateDays();
  }

  protected override onValueReady(value: DateRangeEvent): void {
    if (value?.startDate && value?.endDate) {
      this.startDate = new Date(value.startDate);
      this.endDate = new Date(value.endDate);
      this.activeMonth = this.startDate.getMonth();
      this.activeYear = this.startDate.getFullYear();
    } else {
      this.initDate();
    }

    this.populateDays();
  }

  initDate() {
    let today: Date = this.controlValue?.startDate ?? new Date();
    this.activeMonth = today.getMonth();
    this.activeYear = today.getFullYear();
  }

  getMMMYYYY() {
    return `${this.months[this.activeMonth]} ${this.activeYear}`;
  }

  populateYears(): void {
    let startYear = Math.floor(this.activeYear / 24) * 24;
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
    const daysInMonth = new Date(this.activeYear, this.activeMonth + 1, 0).getDate();
    this.blankDays = Array.from({length: new Date(this.activeYear, this.activeMonth).getDay()}, (_, i) => i + 1);

    this.daysOfMonth = Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1;
      const currentDate = new Date(this.activeYear, this.activeMonth, day);
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

      if(this.allowToday() && this.isToday(day)) {
        isEnabled = true;
      }

      return {value: day, isEnabled};
    });
  }


  isMonthEnabled(month: number): boolean {
    const monthStartDate = new Date(this.activeYear, month, 1);
    const today = new Date();
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (this.allowOnlyPast() && monthStartDate > todayMonthStart) return false;
    if (this.allowOnlyFuture() && monthStartDate < todayMonthStart) return false;

    if (this.minDate()) {
      const minMonthStart = new Date(this.minDate()!.getFullYear(), this.minDate()!.getMonth(), 1);
      if (monthStartDate < minMonthStart) return false;
    }

    if (this.maxDate()) {
      const maxMonthStart = new Date(this.maxDate()!.getFullYear(), this.maxDate()!.getMonth(), 1);
      if (monthStartDate > maxMonthStart) return false;
    }

    return true;
  }

  onYearSelected(year: number): void {
    this.activeYear = year;
    this.uiMode.set('month');
  }

  onMonthSelected(month: number): void {
    this.activeMonth = month;
    this.uiMode.set('date');
    this.populateDays();
  }

  isToday(day: number) {
    const today = new Date();
    const d = new Date(this.activeYear, this.activeMonth, day);
    return today.toDateString() === d.toDateString();
  }

  onDaySelected(day: number) {
    const selectedDate = new Date(this.activeYear, this.activeMonth, day);

    if (!this.startDate || selectedDate < this.startDate) {
      this.startDate = selectedDate;
      this.endDate = null;
      this.hoveredDate = null;
      this.selectingStart = false;
    } else {
      this.endDate = selectedDate;

      let event: DateRangeEvent = {startDate: this.startDate, endDate: this.endDate};
      this.dateRangeSelected.emit(event);
      this.selectingStart = true;
    }


    if (this.startDate && this.endDate) {
      this.onValueChange({startDate: this.startDate, endDate: this.endDate});
    }
  }

  onDayHovered(day: number) {
    if (this.startDate && !this.endDate) {
      this.hoveredDate = new Date(this.activeYear, this.activeMonth, day);
    } else {
      this.hoveredDate = null;
    }
  }


  isDateInSelectionRange(day: number): boolean {

    let date = new Date(this.activeYear, this.activeMonth, day);
    if (this.startDate && this.endDate) {
      return date >= this.startDate && date <= this.endDate;
    }
    return false;
  }

  isDateInHoveredRange(day: number): boolean {
    let date = new Date(this.activeYear, this.activeMonth, day);

    if (this.startDate && this.hoveredDate && !this.endDate) {
      const adjustedHoveredDate = new Date(this.hoveredDate);
      adjustedHoveredDate.setDate(this.hoveredDate.getDate() - 1);
      return (
        date > this.startDate &&
        date < this.hoveredDate
      );
    }
    return false;
  }

  isDateHovered(day: number): boolean {
    let date = new Date(this.activeYear, this.activeMonth, day);
    return this.hoveredDate?.getTime() === date.getTime();
  }

  isDateInRange(day: number): boolean {
    let date = new Date(this.activeYear, this.activeMonth, day);
    return this.isDateInSelectionRange(day) || this.isDateInHoveredRange(day);
  }

  isSelectionStartDate(day: number): boolean | null | undefined {
    const date = new Date(this.activeYear, this.activeMonth, day);
    return (this.startDate && date.toDateString() === this.startDate.toDateString());
  }

  isSelectionEndDate(day: number): boolean | null | undefined {
    const date = new Date(this.activeYear, this.activeMonth, day);
    return (this.endDate && date.toDateString() === this.endDate.toDateString());
  }

  previousMonthPressed() {
    switch (this.uiMode()) {
      case 'year':
        if (this.activeYear > 24) {
          this.activeYear -= 24;
          this.populateYears();
        }
        break;

      case 'month':
        if (this.activeYear > 1) {
          this.activeYear--;
        }
        break;

      case 'date':
        if (this.activeMonth === 0) {
          if (this.activeYear > 1) {
            this.activeYear--;
            this.activeMonth = 11;
          }
        } else {
          this.activeMonth--;
        }
        this.populateDays();
        break;

      default:
        console.warn('Unknown mode:', this.uiMode());
    }
  }

  nextMonthPressed() {
    switch (this.uiMode()) {
      case 'year':
        this.activeYear += 24;
        this.populateYears();
        break;

      case 'month':
        this.activeYear++;
        break;

      case 'date':
        if (this.activeMonth === 11) {
          this.activeYear++;
          this.activeMonth = 0;
        } else {
          this.activeMonth++;
        }
        this.populateDays();
        break;

      default:
        console.warn('Unknown mode:', this.uiMode());
    }
  }

  onYearSelectionPressed() {
    switch (this.uiMode()) {
      case 'year':
        this.uiMode.set('date');
        break;
      case "month":
        this.uiMode.set('year');
        break;
      case "date":
        this.populateYears();
        this.uiMode.set('year');
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
    this.startDate = null;
    this.endDate = null;
    this.hoveredDate = null;

    this.onValueChange(null);
  }
}

export interface DateRangeEvent {
  startDate: Date;
  endDate: Date;
}
