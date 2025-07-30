import { create } from '@storybook/theming/create';
import type { ThemeVars } from '@storybook/theming';

const storybookTheme: ThemeVars = create({
  base: 'light',

  // Branding
  brandTitle: '⚡️ UI Design System',
  brandImage: undefined, // Add a logo URL here if desired
  brandTarget: '_self',

  // Vibrant and dynamic color palette
  colorPrimary: '#10B981', // Emerald green for a bold, lively primary color
  colorSecondary: '#EC4899', // Vivid pink for striking accents

  // Rich, layered background gradient
  appBg: 'linear-gradient(145deg, #E6FFFA 0%, #DBEAFE 100%)', // Soft green-blue gradient for vibrancy
  appContentBg: 'rgba(255, 255, 255, 0.95)', // Translucent white for depth
  appBorderColor: 'rgba(0, 0, 0, 0.12)', // Subtle border for definition
  appBorderRadius: 16, // Larger radius for a modern, polished look

  // Typography
  fontBase: '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif', // Modern Manrope font for a premium feel
  fontCode: '"Fira Code", "Source Code Pro", monospace', // Fira Code for a stylish code look

  // Text colors optimized for readability and flair
  textColor: '#111827', // Deep gray for high contrast
  textInverseColor: '#FFFFFF', // White for inverse text
  textMutedColor: '#4B5563', // Softer gray for secondary text

  // Toolbar & Bottom Menu
  barTextColor: '#111827', // Deep gray for toolbar text
  barSelectedColor: '#10B981', // Emerald green for active/selected items
  barHoverColor: '#EC4899', // Pink for hover effects
  barBg: 'linear-gradient(145deg, #E6FFFA 20%, #DBEAFE 80%)', // Matching gradient with subtle variation

  // Form styles
  inputBg: '#F9FAFB', // Light gray background for inputs
  inputBorder: 'rgba(0, 0, 0, 0.15)', // Slightly darker border for clarity
  inputTextColor: '#111827', // Deep gray for input text
  inputBorderRadius: 10, // Smooth, modern corners for inputs

  // Additional UI elements
  buttonBg: '#10B981', // Emerald green for buttons
  booleanBg: '#E5E7EB', // Light gray for boolean toggles
  booleanSelectedBg: '#10B981', // Emerald green for selected state
});

export default storybookTheme;