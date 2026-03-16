import type { Decorator } from '@storybook/react-vite';

declare module 'storybook-addon-mock/dist/esm/withRoundTrip' {
  export const withRoundTrip: Decorator;
}
