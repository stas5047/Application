import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'url';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // storybook-addon-mock excluded from addons: its Panel component imports
  // '@storybook/addon-docs/blocks' which was removed in Storybook 10.
  // The withRoundTrip decorator in preview.ts still provides full XHR interception.
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    config.plugins = [tailwindcss(), ...(config.plugins ?? [])];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': path.resolve(__dirname, '../src'),
      },
    };
    return config;
  },
};

export default config;
