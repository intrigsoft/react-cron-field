import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
    '@chromatic-com/storybook'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {},

  staticDirs: ['../public'],

  viteFinal: async (config) => {
    // Add SVG handling if not already configured
    if (config.plugins) {
      config.plugins = [...config.plugins];
    }
    return config;
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};

export default config;
