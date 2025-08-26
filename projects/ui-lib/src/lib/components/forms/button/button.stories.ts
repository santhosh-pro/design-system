import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { moduleMetadata } from '@storybook/angular';
import { SpinnerComponent } from '../../feedback/spinner/spinner';
import { AppSvgIconComponent } from '../../misc/app-svg-icon/app-svg-icon';
export default {
  title: 'Components/Forms/Button',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        NgClass,
        SpinnerComponent,
        AppSvgIconComponent,
      ],
    }),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'The type of button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes the button full width',
    },
    appearance: {
      control: 'select',
      options: ['textType', 'primary', 'outline', 'primaryRounded', 'outlineRounded'],
      description: 'Button appearance style',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state',
    },
    iconSize: {
      control: 'number',
      description: 'Size of the icon',
    },
    iconSrc: {
      control: 'text',
      description: 'Path to SVG icon',
    },
    iconColor: {
      control: 'text',
      description: 'Color of the icon',
    },
    buttonColor: {
      control: 'text',
      description: 'Background color for primary buttons',
    },
    outlineColor: {
      control: 'text',
      description: 'Border color for outline buttons',
    },
    textButtonColor: {
      control: 'text',
      description: 'Text color for text-type buttons',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    click: {
      action: 'buttonClick',
      description: 'Emitted when the button is clicked',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A customizable button component with various appearances, sizes, and states, supporting multiple color variants.',
      },
    },
  },
} as Meta<ButtonComponent>;

type Story = StoryObj<ButtonComponent>;

// Primary Variants
export const Primary: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Primary Button</app-button>`,
  }),
};

export const PrimaryOutline: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'outline',
    loading: false,
    size: 'medium',
    outlineColor: 'border-primary-500',
    textButtonColor: 'text-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [outlineColor]="outlineColor" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Primary Outline Button</app-button>`,
  }),
};

export const PrimaryText: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'textType',
    loading: false,
    size: 'medium',
    textButtonColor: 'text-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Primary Text Button</app-button>`,
  }),
};

// Success Variants
export const Success: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-success-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Success Button</app-button>`,
  }),
};

export const SuccessOutline: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'outline',
    loading: false,
    size: 'medium',
    outlineColor: 'border-success-500',
    textButtonColor: 'text-success-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [outlineColor]="outlineColor" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Success Outline Button</app-button>`,
  }),
};

export const SuccessText: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'textType',
    loading: false,
    size: 'medium',
    textButtonColor: 'text-success-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Success Text Button</app-button>`,
  }),
};

// Info Variants
export const Info: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-info-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Info Button</app-button>`,
  }),
};

export const InfoOutline: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'outline',
    loading: false,
    size: 'medium',
    outlineColor: 'border-info-500',
    textButtonColor: 'text-info-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [outlineColor]="outlineColor" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Info Outline Button</app-button>`,
  }),
};

export const InfoText: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'textType',
    loading: false,
    size: 'medium',
    textButtonColor: 'text-info-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Info Text Button</app-button>`,
  }),
};

// Warning Variants
export const Warning: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-warning-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Warning Button</app-button>`,
  }),
};

export const WarningOutline: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'outline',
    loading: false,
    size: 'medium',
    outlineColor: 'border-warning-500',
    textButtonColor: 'text-warning-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [outlineColor]="outlineColor" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Warning Outline Button</app-button>`,
  }),
};

export const WarningText: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'textType',
    loading: false,
    size: 'medium',
    textButtonColor: 'text-warning-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Warning Text Button</app-button>`,
  }),
};

// Error Variants
export const Error: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-error-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Error Button</app-button>`,
  }),
};

export const ErrorOutline: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'outline',
    loading: false,
    size: 'medium',
    outlineColor: 'border-error-500',
    textButtonColor: 'text-error-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [outlineColor]="outlineColor" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Error Outline Button</app-button>`,
  }),
};

export const ErrorText: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'textType',
    loading: false,
    size: 'medium',
    textButtonColor: 'text-error-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [textButtonColor]="textButtonColor" (buttonClick)="buttonClick(); ">Error Text Button</app-button>`,
  }),
};

// All Colors Comparison
export const AllColors: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `
      <div class="space-y-4">
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="'bg-primary-500'" (buttonClick)="buttonClick(); ">Primary Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="'bg-success-500'" (buttonClick)="buttonClick(); ">Success Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="'bg-info-500'" (buttonClick)="buttonClick(); ">Info Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="'bg-warning-500'" (buttonClick)="buttonClick(); ">Warning Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="'bg-error-500'" (buttonClick)="buttonClick(); ">Error Button</app-button>
      </div>
    `,
  }),
};

// Existing Stories (unchanged)
export const WithIcon: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    iconSrc: 'icons/alarm.svg',
    iconSize: 18,
    iconColor: 'text-white',
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" [iconSrc]="iconSrc" [iconSize]="iconSize" [iconColor]="iconColor" (buttonClick)="buttonClick(); ">Button with Icon</app-button>`,
  }),
};

export const Loading: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: true,
    size: 'medium',
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Loading Button</app-button>`,
  }),
};

export const Disabled: Story = {
  args: {
    type: 'button',
    disabled: true,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Disabled Button</app-button>`,
  }),
};

export const FullWidth: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: true,
    appearance: 'primary',
    loading: false,
    size: 'medium',
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `<app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="size" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Full Width Button</app-button>`,
  }),
};

export const Sizes: Story = {
  args: {
    type: 'button',
    disabled: false,
    fullWidth: false,
    appearance: 'primary',
    loading: false,
    buttonColor: 'bg-primary-500',
  },
  render: (args) => ({
    props: {
      ...args,
      onButtonClick: ($event: any) => {
        console.log('buttonClick event emitted:', $event);
      },
    },
    template: `
      <div class="space-y-4">
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="'small'" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Small Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="'medium'" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Medium Button</app-button>
        <app-button [type]="type" [disabled]="disabled" [fullWidth]="fullWidth" [appearance]="appearance" [loading]="loading" [size]="'large'" [buttonColor]="buttonColor" (buttonClick)="buttonClick(); ">Large Button</app-button>
      </div>
    `,
  }),
};