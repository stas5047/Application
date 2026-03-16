import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagMultiSelect } from './tag-multi-select';

const MOCK_TAGS = [
  { id: '1', name: 'tech' },
  { id: '2', name: 'art' },
  { id: '3', name: 'business' },
  { id: '4', name: 'music' },
  { id: '5', name: 'sports' },
];

interface WrapperProps {
  value?: string[];
  maxTags?: number;
  disabled?: boolean;
}

function TagMultiSelectWrapper({ value: initialValue = [], maxTags, disabled }: WrapperProps) {
  const [value, setValue] = useState<string[]>(initialValue);
  return (
    <TagMultiSelect
      value={value}
      onChange={setValue}
      maxTags={maxTags}
      disabled={disabled}
    />
  );
}

const meta: Meta<typeof TagMultiSelectWrapper> = {
  title: 'UI/TagMultiSelect',
  component: TagMultiSelectWrapper,
  parameters: {
    mockData: [
      {
        url: 'http://localhost:3000/api/tags',
        method: 'GET',
        status: 200,
        response: MOCK_TAGS,
      },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof TagMultiSelectWrapper>;

export const Empty: Story = {};
export const PreSelected: Story = { args: { value: ['tech', 'music'] } };
export const MaxReached: Story = { args: { value: ['tech', 'art', 'business'], maxTags: 3 } };
export const Disabled: Story = { args: { disabled: true } };
