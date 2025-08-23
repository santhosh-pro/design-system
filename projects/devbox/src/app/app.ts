import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataTableDemo } from './data-table-demo/data-table-demo';
import { DateRangePickerDemo } from "./date-range-picker-demo/date-range-picker-demo";
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    DataTableDemo,
    DateRangePickerDemo
],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('devbox');


}
