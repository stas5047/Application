import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Button' },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Link: Story = { args: { variant: 'link' } };

export const SizeDefault: Story = { args: { size: 'default' } };
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeIcon: Story = { args: { size: 'icon', children: '★' } };
export const Disabled: Story = { args: { disabled: true } };
