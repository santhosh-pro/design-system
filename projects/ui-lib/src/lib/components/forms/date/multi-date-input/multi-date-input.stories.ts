import { Meta, StoryObj } from '@storybook/angular';
import { MultiDateInputComponent, InputDateFormat } from './multi-date-input';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { NgxMaskDirective } from '../../input-mask/ngx-mask';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';

// Define the Meta configuration
export default {
  title: 'Components/Forms/Date/MultiDateInput',
  component: MultiDateInputComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
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
    showDatePickerIcon: { control: 'boolean', description: 'Show the date picker icon' },
    fullWidth: { control: 'boolean', description: 'Make the input full width' },
    showErrorSpace: { control: 'boolean', description: 'Reserve space for error messages' },
    minDate: { control: 'date', description: 'Minimum selectable date' },
    maxDate: { control: 'date', description: 'Maximum selectable date' },
    allowOnlyPast: { control: 'boolean', description: 'Allow only past dates' },
    allowOnlyFuture: { control: 'boolean', description: 'Allow only future dates' },
    disabledDays: {
      control: {
        type: 'multi-select',
        options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      description: 'Array of disabled weekdays',
    },
    disabledDates: { control: 'object', description: 'Array of specific disabled dates' },
    inputDateFormat: {
      control: 'select',
      options: Object.values(InputDateFormat).filter((v) => typeof v === 'string'),
      description: 'Date format for input',
    },
    valueChanged: { action: 'valueChanged' }, // Define action for value changes
  },
} as Meta<MultiDateInputComponent>;

type Story = StoryObj<MultiDateInputComponent>;

// Primary Story with FormControl Value Logging
export const Primary: Story = {
  args: {
    label: 'Select Dates',
    iconSrc: null,
    showDatePickerIcon: true,
    fullWidth: false,
    showErrorSpace: false,
    minDate: null,
    maxDate: null,
    allowOnlyPast: false,
    allowOnlyFuture: false,
    disabledDays: [],
    disabledDates: [],
    inputDateFormat: InputDateFormat.mmddyyyy,
  },
  render: (args) => {
    const dateControl = new FormControl([]); // Fresh FormControl for each story
    return {
      props: {
        ...args,
        dateControl,
      },
      template: `
        <div>
          <app-multi-date-input
            [formControl]="dateControl"
            [label]="label"
            [iconSrc]="iconSrc"
            [showDatePickerIcon]="showDatePickerIcon"
            [fullWidth]="fullWidth"
            [showErrorSpace]="showErrorSpace"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [allowOnlyPast]="allowOnlyPast"
            [allowOnlyFuture]="allowOnlyFuture"
            [disabledDays]="disabledDays"
            [disabledDates]="disabledDates"
            [inputDateFormat]="inputDateFormat"
            (valueChanged)="valueChanged($event)"
          ></app-multi-date-input>
          <div style="margin-top: 20px;">
            <strong>FormControl Value:</strong> {{ dateControl.value | json }}
          </div>
        </div>
      `,
    };
  },
};

// Reuse Primary render function for other stories
export const WithIcon: Story = {
  args: {
    ...Primary.args,
    iconSrc: 'assets/calendar-icon.svg',
    label: 'Select Dates with Icon',
  },
  render: Primary.render,
};

export const FullWidth: Story = {
  args: {
    ...Primary.args,
    fullWidth: true,
    label: 'Full Width Date Input',
  },
  render: Primary.render,
};

export const OnlyPastDates: Story = {
  args: {
    ...Primary.args,
    allowOnlyPast: true,
    label: 'Select Past Dates',
  },
  render: Primary.render,
};

export const OnlyFutureDates: Story = {
  args: {
    ...Primary.args,
    allowOnlyFuture: true,
    label: 'Select Future Dates',
  },
  render: Primary.render,
};

export const WithDisabledDays: Story = {
  args: {
    ...Primary.args,
    disabledDays: ['saturday', 'sunday'],
    label: 'No Weekends',
  },
  render: Primary.render,
};

export const WithDisabledDates: Story = {
  args: {
    ...Primary.args,
    disabledDates: [new Date('2025-05-05'), new Date('2025-05-10')],
    label: 'Specific Dates Disabled',
  },
  render: Primary.render,
};

export const DDMMYYYYFormat: Story = {
  args: {
    ...Primary.args,
    inputDateFormat: InputDateFormat.ddmmyyyy,
    label: 'DD/MM/YYYY Format',
  },
  render: Primary.render,
};

export const WithMinMaxDates: Story = {
  args: {
    ...Primary.args,
    minDate: new Date('2025-05-01'),
    maxDate: new Date('2025-12-31'),
    label: 'Restricted Date Range',
  },
  render: Primary.render,
};

export const WithErrorSpace: Story = {
  args: {
    ...Primary.args,
    showErrorSpace: true,
    label: 'With Error Space',
  },
  render: Primary.render,
};