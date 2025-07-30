import { Meta, StoryObj } from '@storybook/angular';
import { BreadcrumbComponent } from './breadcrumb.component';
import { NgClass } from '@angular/common';
import { provideRouter } from '@angular/router';
import { moduleMetadata, applicationConfig } from '@storybook/angular';

export default {
  title: 'Components/Breadcrumb',
  component: BreadcrumbComponent,
  decorators: [
    moduleMetadata({
      imports: [NgClass],
    }),
    applicationConfig({
      providers: [
        provideRouter([
          { path: '**', redirectTo: '' } // Catch-all route for testing
        ]),
      ],
    }),
  ],
  argTypes: {
    baseRoute: {
      control: 'text',
      description: 'Base route for the breadcrumb navigation',
    },
  },
} as Meta<BreadcrumbComponent>;

type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {
  args: {
    baseRoute: "/main/rte",
  },
  parameters: {
    router: {
      url: '/main/dashboard',
    },
  },
};

export const NestedRoute: Story = {
  args: {
    baseRoute: '/main',
  },
  parameters: {
    router: {
      url: '/main/dashboard/settings/profile',
    },
  },
};

export const WithQueryParams: Story = {
  args: {
    baseRoute: '/main',
  },
  parameters: {
    router: {
      url: '/main/dashboard?id=123',
    },
  },
};

export const CustomBaseRoute: Story = {
  args: {
    baseRoute: '/app',
  },
  parameters: {
    router: {
      url: '/app/projects/details',
    },
  },
};

export const WithUUID: Story = {
  args: {
    baseRoute: '/main',
  },
  parameters: {
    router: {
      url: '/main/projects/550e8400-e29b-41d4-a716-446655440000/details',
    },
  },
};