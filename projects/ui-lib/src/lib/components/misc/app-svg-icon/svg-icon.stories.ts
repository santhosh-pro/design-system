import { Meta, StoryObj } from '@storybook/angular';
import { AppSvgIconComponent } from './app-svg-icon.component';
import { moduleMetadata } from '@storybook/angular';
import { SvgIconComponent } from './lib/svg-icon.component';

export default {
  title: 'Components/Misc/SvgIcon',
  component: AppSvgIconComponent,
  decorators: [
    moduleMetadata({
      imports: [SvgIconComponent],
    }),
  ],
  argTypes: {
    src: {
      control: 'text',
      description: 'Source URL for the SVG icon',
    },
    stretch: {
      control: 'boolean',
      description: 'Whether to stretch the icon to fit its container',
    },
    size: {
      control: 'number',
      description: 'Size of the icon in pixels',
    },
    svgStyle: {
      control: 'object',
      description: 'Custom styles to apply to the SVG element',
    },
  },
} as Meta<AppSvgIconComponent>;

type Story = StoryObj<AppSvgIconComponent>;

export const Default: Story = {
  args: {
    src: 'icons/calendar.svg', 
    stretch: false,
    size: 24,
    svgStyle: {},
  },
};

export const Stretched: Story = {
  args: {
    src: 'icons/calendar.svg',
    stretch: true,
    size: 24,
    svgStyle: {},
  },
};

export const LargeSize: Story = {
  args: {
    src: 'icons/calendar.svg',
    stretch: false,
    size: 48,
    svgStyle: {},
  },
};

export const WithCustomStyles: Story = {
  args: {
    src: 'icons/calendar.svg',
    stretch: false,
    size: 24,
    svgStyle: { fill: 'blue', stroke: 'black', 'stroke-width': '2px' },
  },
};

export const DifferentIcon: Story = {
  args: {
    src: 'icons/alarm.svg',
    stretch: false,
    size: 24,
    svgStyle: {},
  },
};