import { Routes } from '@angular/router';
import { DataTableDemo } from './data-table-demo/data-table-demo';
import { DateRangePickerDemo } from './date-range-picker-demo/date-range-picker-demo';
import { SingleSelectionDemoComponent } from './single-select-field-demo/single-select-field-demo';
import { OverlayDemo } from './overlay-demo/overlay-demo';
import { TimeInputDemo } from './time-input-demo/time-input-demo';
import { FileUploadDemo } from './file-upload-demo/file-upload-demo';
import { MultiSelectFieldDemo } from './multi-select-field-demo/multi-select-field-demo';
import { TooltipDemo } from './tooltip-demo/tooltip-demo';
import { DataTablePickerDemo } from './data-table-picker-demo/data-table-picker-demo';
import { MultiSelectDropdown } from './multi-select-dropdown/multi-select-dropdown';
import { SingleSelectDropdownDemo } from './single-select-dropdown-demo/single-select-dropdown-demo';
import { NumberFieldDemo } from './number-field-demo/number-field-demo';
import { SideNavDemo } from './side-nav-demo/side-nav-demo';

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
        path: 'data-table-picker',
        component: DataTablePickerDemo
    },
    {
        path: 'multi-select-dropdown',
        component: MultiSelectDropdown
    },
    {
        path: 'single-select-dropdown',
        component: SingleSelectDropdownDemo
    },
    {
        path:'number-field-demo',
        component: NumberFieldDemo
    },
    {
        path: 'side-nav',
        component: SideNavDemo
    }
];
