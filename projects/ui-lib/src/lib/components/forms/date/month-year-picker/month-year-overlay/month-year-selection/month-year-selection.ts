import { NgClass } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import { BaseControlValueAccessor } from '../../../../../../core/base-control-value-accessor';
import { DateUtils } from '../../../date-utils';

@Component({
  selector: 'ui-month-year-selection',
  imports: [NgClass],
  templateUrl: './month-year-selection.html',
})
export class MonthYearSelection extends BaseControlValueAccessor<Date> implements OnInit {
  minDate = input<Date | null>();
  maxDate = input<Date | null>();
  allowOnlyPast = input<boolean>(false);
  allowOnlyFuture = input<boolean>(false);
  selectedDate = input<Date | null>(); // New input to receive selectedDate from overlay

  monthYearSelected = output<Date>();

  months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  uiMode = signal<'month' | 'year'>('month');
  activeMonth!: number; // Add this to track the active month
  activeYear!: number;
  years: { value: number; isEnabled: boolean }[] = [];

  ngOnInit(): void {
    this.initDate();
    this.populateYears();
  }

  protected override onValueReady(value: Date): void {
    // Prioritize selectedDate input over formControl.value
    if (this.selectedDate() && DateUtils.isValidDate(this.selectedDate()!)) {
      this.activeMonth = this.selectedDate()!.getMonth();
      this.activeYear = this.selectedDate()!.getFullYear();
    } else if (value && DateUtils.isValidDate(value)) {
      this.activeMonth = value.getMonth();
      this.activeYear = value.getFullYear();
    } else {
      this.initDate();
    }
    this.populateYears();
  }

  initDate() {
    // Use selectedDate if provided and valid, else fall back to formControl or today
    const date = this.selectedDate() && DateUtils.isValidDate(this.selectedDate()!)
      ? this.selectedDate()!
      : this.formControl.value ?? new Date();
    this.activeMonth = date.getMonth();
    this.activeYear = date.getFullYear();
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
      if (isEnabled && this.minDate()) isEnabled = year >= this.minDate()!.getFullYear();
      if (isEnabled && this.maxDate()) isEnabled = year <= this.maxDate()!.getFullYear();

      return { value: year, isEnabled };
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
    const selectedDate = new Date(this.activeYear, month, 1);
    this.activeMonth = month; // Update activeMonth for display on reopen
    this.onValueChange(selectedDate);
    this.monthYearSelected.emit(selectedDate);
  }

  isSelected(month: number): boolean {
    if (!this.selectedDate() || !DateUtils.isValidDate(this.selectedDate()!)) return false;
    const selDate = this.selectedDate()!;
    const d = new Date(this.activeYear, month, 1);
    return selDate.getFullYear() === d.getFullYear() && selDate.getMonth() === d.getMonth();
  }

  isSelectedYear(year: number): boolean {
    if (!this.selectedDate() || !DateUtils.isValidDate(this.selectedDate()!)) return false;
    const selDate = this.selectedDate()!;
    return selDate.getFullYear() === year;
  }

  previousYearPressed() {
    if (this.uiMode() === 'year') {
      if (this.activeYear > 24) {
        this.activeYear -= 24;
        this.populateYears();
      }
    } else {
      if (this.activeYear > 1) this.activeYear--;
    }
  }

  nextYearPressed() {
    if (this.uiMode() === 'year') {
      this.activeYear += 24;
      this.populateYears();
    } else {
      this.activeYear++;
    }
  }

  onYearSelectionPressed() {
    if (this.uiMode() === 'year') {
      this.uiMode.set('month');
    } else {
      this.populateYears();
      this.uiMode.set('year');
    }
  }

  getFirstYear() {
    return this.years[0]?.value ?? this.activeYear;
  }

  getLastYear() {
    return this.years[this.years.length - 1]?.value ?? this.activeYear;
  }

  // Add getMMMYYYY to display month/year in the header
  getMMMYYYY() {
    return `${this.months[this.activeMonth]} ${this.activeYear}`;
  }
}