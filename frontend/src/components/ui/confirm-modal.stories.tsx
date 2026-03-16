import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { ConfirmModal } from './confirm-modal';

interface WrapperProps {
  isLoading?: boolean;
}

function ConfirmModalWrapper({ isLoading }: WrapperProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Event
      </Button>
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="Delete Event"
        description="This will permanently delete the event and remove all participants. This cannot be undone."
        isLoading={isLoading}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

const meta: Meta<typeof ConfirmModalWrapper> = {
  title: 'UI/ConfirmModal',
  component: ConfirmModalWrapper,
};
export default meta;
type Story = StoryObj<typeof ConfirmModalWrapper>;

export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
