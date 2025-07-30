import { Meta, StoryObj } from '@storybook/angular';
import { SampleComponent } from './sample.component';

export default {
  title: 'Components/Sample',
  component: SampleComponent,
} as Meta<SampleComponent>;

type Story = StoryObj<SampleComponent>;
export const Default: Story = {
  args: {},
};