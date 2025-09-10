import { Routes } from '@angular/router';
import { DataTableDemo } from './data-table-demo/data-table-demo';
import { DateRangePickerDemo } from './date-range-picker-demo/date-range-picker-demo';
import { SingleSelectionDemoComponent } from './single-select-field-demo/single-select-field-demo';
import { OverlayDemo } from './overlay-demo/overlay-demo';
import { TimeInputDemo } from './time-input-demo/time-input-demo';
import { FileUploadDemo } from './file-upload-demo/file-upload-demo';
import { MultiSelectFieldDemo } from './multi-select-field-demo/multi-select-field-demo';
import { TooltipDemo } from './tooltip-demo/tooltip-demo';
import { SingleAutoCompleteDemo } from './single-auto-complete-demo/single-auto-complete-demo';
import { DataTablePickerDemo } from './data-table-picker-demo/data-table-picker-demo';
import { MultiSelectDropdown } from './multi-select-dropdown/multi-select-dropdown';

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
        path: 'time-picker',
        component: TimeInputDemo
    },
    {
        path: 'file-upload',
        component: FileUploadDemo
    },
    {
        path: 'single-select',
        component: SingleSelectionDemoComponent
    },
    {
        path: 'multi-select',
        component: MultiSelectFieldDemo
    },
    {
        path: 'overlay',
        component: OverlayDemo
    },
    {
        path: 'tooltip',
        component: TooltipDemo
    },
    {
        path: 'single-auto-complete',
        component: SingleAutoCompleteDemo
    },
    {
        path: 'data-table-picker',
        component: DataTablePickerDemo
    },
    {
        path: 'multi-select-dropdown',
        component: MultiSelectDropdown
    }
];
