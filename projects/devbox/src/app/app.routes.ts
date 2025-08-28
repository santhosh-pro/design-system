import { Routes } from '@angular/router';
import { DataTableDemo } from './data-table-demo/data-table-demo';
import { DateRangePickerDemo } from './date-range-picker-demo/date-range-picker-demo';
import { SingleSelectionDemoComponent } from './single-select-field-demo/single-select-field-demo';
import { OverlayDemo } from './overlay-demo/overlay-demo';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'single-select',
        pathMatch: 'full'
    },
    {
        path: 'data-table',
        component: DataTableDemo
    },
    {
        path: 'date-range-picker',
        component: DateRangePickerDemo
    },
    {
        path: 'single-select',
        component: SingleSelectionDemoComponent
    },
    {
        path: 'overlay',
        component: OverlayDemo
    }
];
