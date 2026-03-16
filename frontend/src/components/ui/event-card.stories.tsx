import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { EventCard } from './event-card';

const baseArgs = {
  id: 'evt-1',
  title: 'React Meetup Berlin',
  description: 'Monthly React meetup for all skill levels.',
  dateTime: new Date(Date.now() + 86400000 * 3).toISOString(),
  location: 'Betahaus, Berlin',
  capacity: 40,
  participantCount: 25,
  cta: <Button size="sm">Join</Button>,
};

const meta: Meta<typeof EventCard> = {
  title: 'UI/EventCard',
  component: EventCard,
  args: baseArgs,
};
export default meta;
type Story = StoryObj<typeof EventCard>;

export const Default: Story = {};
export const Organizer: Story = { args: { isOrganizer: true } };
export const Past: Story = {
  args: {
    isPast: true,
    dateTime: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
};
export const WithTags: Story = {
  args: {
    tags: [
      { id: '1', name: 'tech' },
      { id: '2', name: 'networking' },
      { id: '3', name: 'design' },
    ],
  },
};
export const ManyTags: Story = {
  args: {
    tags: [
      { id: '1', name: 'tech' },
      { id: '2', name: 'networking' },
      { id: '3', name: 'design' },
      { id: '4', name: 'education' },
    ],
  },
};
export const AtCapacity: Story = { args: { participantCount: 40 } };
export const NoCapacity: Story = { args: { capacity: null, participantCount: 12 } };
export const NoDescription: Story = { args: { description: null } };
