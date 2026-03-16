import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from 'lucide-react';
import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  args: {
    icon: Calendar,
    heading: 'No events found',
    subText: 'There are no upcoming events matching your filters.',
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const WithoutCta: Story = {};
export const WithCta: Story = {
  args: {
    ctaLabel: 'Create Event',
    onCta: () => alert('CTA clicked'),
  },
};
