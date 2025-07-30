import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  "stories": ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  "staticDirs": ['../public'],
  "addons": [],
  "framework": {
    "name": "@storybook/angular",
    "options": {}
  },
};
export default config;