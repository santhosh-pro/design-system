import {Component, input, OnInit, output, signal} from '@angular/core';
import {NgClass} from "@angular/common";
import { BaseControlValueAccessorV3 } from '../../../../../../core/base-control-value-accessor-v3';

export type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

@Component({
  selector: 'app-date-picker',
  imports: [
    NgClass
  ],
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent extends BaseControlValueAccessorV3<Date> implements OnInit {
  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  allowToday = input<boolean>(false);
  disabledDays = input<Weekday[]>([]);
  disabledDates = input<Date[]>([]);

  dateSelected = output<Date>();

  // days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
  selectedDate?: Date | null;

  years: { value: number; isEnabled: boolean }[] = [];
  daysOfMonth: { value: number; isEnabled: boolean }[] = [];
  blankDays: number[] = [];

  ngOnInit(): void {
    this.initDate();
    this.populateDays();
  }

  protected override onValueReady(value: Date): void {
    if (value) {
      this.selectedDate = value;
      this.activeMonth = value?.getMonth();
      this.activeYear = value?.getFullYear();
    } else {
      this.initDate();
    }

    this.populateDays();
  }

  initDate() {
    let today = this.controlValue ?? new Date();
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

    this.years = Array.from({length: 24}, (_, i) => {
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

      return {value: year, isEnabled};
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

      const dayName = this.days[currentDate.getDay()];
      if (this.disabledDays()?.includes(dayName.day)) {
        isEnabled = false;
      }

      if (this.disabledDates()?.some(date => this.isSameDate(date, currentDate))) {
        isEnabled = false;
      }

      return {value: day, isEnabled};
    });
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
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
    this.selectedDate = new Date(this.activeYear, this.activeMonth, day);
    this.onValueChange(this.selectedDate);
    this.dateSelected.emit(this.selectedDate);
  }

  resetPicker(): void {
    this.selectedDate = null;
    this.initDate();
    this.populateDays();
  }

  isSelected(day: number): boolean {
    const d = new Date(this.activeYear, this.activeMonth, day);
    return this.selectedDate?.toDateString() === d.toDateString();
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
}
