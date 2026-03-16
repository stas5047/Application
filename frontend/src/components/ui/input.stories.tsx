import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: { placeholder: 'Enter text\u2026' },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: 'Disabled value' } };
export const Error: Story = { args: { 'aria-invalid': true, placeholder: 'Invalid field' } };
