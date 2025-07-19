import { create } from '@storybook/theming/create';

export default create({
  base: 'light',

  // Brand
  brandTitle: 'React Cron Field',
  brandUrl: 'https://github.com/intrigsoft/react-cron-field',
  // brandImage: 'scheduler-icon.svg',
  brandTarget: '_self',

  // UI
  appBg: '#f8f8f8',
  appContentBg: '#ffffff',
  appBorderColor: '#e6e6e6',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: '#333333',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#999999',
  barSelectedColor: '#1ea7fd',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#e6e6e6',
  inputTextColor: '#333333',
  inputBorderRadius: 4,

  // Colors
  colorPrimary: '#1ea7fd',
  colorSecondary: '#1ea7fd',

  // Other
  gridCellSize: 12,
});
