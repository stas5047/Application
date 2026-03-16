import type { Preview } from '@storybook/react-vite';
import { withRoundTrip } from 'storybook-addon-mock/dist/esm/withRoundTrip';
import '../src/index.css';

const preview: Preview = {
  decorators: [withRoundTrip],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'oklch(1 0 0)' },
        { name: 'dark', value: 'oklch(0.129 0.042 264.695)' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
};

export default preview;
