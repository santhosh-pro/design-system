import { addons } from '@storybook/manager-api';
import storybookTheme from './storybookTheme';

addons.setConfig({
  theme: storybookTheme,
  showThemeSwitch: false,
  panelPosition: 'right',
});
