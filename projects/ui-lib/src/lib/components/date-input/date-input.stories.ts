import { Meta, StoryObj } from '@storybook/angular';
import { DateInputComponent, ViewType, InputDateFormat } from './date-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { moduleMetadata } from '@storybook/angular';
import { BaseInputComponent } from '../../core/base-input/base-input.component';
import { HumanizeFormMessagesPipe } from '../../core/humanize-form-messages.pipe';
import { AppSvgIconComponent } from '../app-svg-icon/app-svg-icon.component';
import { NgxMaskDirective } from '../input-mask/ngx-mask.directive';

export default {
  title: 'Components/DateInput',
  component: DateInputComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        NgClass,
        HumanizeFormMessagesPipe,
        BaseInputComponent,
        AppSvgIconComponent,
      ],
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Label for the input field' },
    iconSrc: { control: 'text', description: 'Source URL for the icon' },
    showDatePickerIcon: { control: 'boolean', description: 'Show/hide date picker icon (applies in picker mode)' },
    fullWidth: { control: 'boolean', description: 'Make input full width' },
    showErrorSpace: { control: 'boolean', description: 'Reserve space for error messages' },
    minDate: { control: 'date', description: 'Minimum selectable date' },
    maxDate: { control: 'date', description: 'Maximum selectable date' },
    allowOnlyPast: { control: 'boolean', description: 'Allow only past dates' },
    allowOnlyFuture: { control: 'boolean', description: 'Allow only future dates' },
    disabledDays: { control: 'object', description: 'Array of disabled weekdays' },
    disabledDates: { control: 'object', description: 'Array of disabled specific dates' },
    inputDateFormat: {
      control: 'select',
      options: [InputDateFormat.mmddyyyy, InputDateFormat.ddmmyyyy],
      description: 'Date format for input (mm/dd/yyyy or dd/mm/yyyy)',
    },
    viewType: {
      control: 'select',
      options: ['picker', 'calendar'],
      description: 'Display mode: "picker" for input with dropdown, "calendar" for inline calendar',
    },
  },
} as Meta<DateInputComponent>;

type Story = StoryObj<DateInputComponent>;

export const Default: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Select Date',
    iconSrc: 'assets/icons/calendar.svg',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: true,
    showErrorSpace: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const PastDatesOnly: Story = {
  args: {
    label: 'Select Past Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    allowOnlyPast: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const FutureDatesOnly: Story = {
  args: {
    label: 'Select Future Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    allowOnlyFuture: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const DDMMYYYYFormat: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    inputDateFormat: InputDateFormat.ddmmyyyy,
    viewType: 'picker',
  },
};

export const WithMinMaxDates: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    minDate: new Date(2025, 0, 1),
    maxDate: new Date(2025, 11, 31),
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const WithDisabledDays: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    disabledDays: ['sunday', 'saturday'],
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const WithDisabledDates: Story = {
  args: {
    label: 'Select Date',
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: true,
    disabledDates: [new Date(2025, 4, 1), new Date(2025, 4, 15)],
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'picker',
  },
};

export const InlineCalendar: Story = {
  args: {
    label: 'Select Date',
    fullWidth: false,
    showErrorSpace: true,
    inputDateFormat: InputDateFormat.mmddyyyy,
    viewType: 'calendar',
  },
};