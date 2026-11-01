import { Button, Modal, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

type Props = {
  /** True while there are changes that would be lost; read at the moment of leaving. */
  when: () => boolean;
  title: string;
  body: string;
  leaveLabel: string;
  stayLabel: string;
};

/** Asks before leaving the page (in-app links and closing the tab) with unsaved changes. */
export function UnsavedChangesGuard({ when, title, body, leaveLabel, stayLabel }: Readonly<Props>) {
  const blocker = useBlocker(() => when());

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (when()) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [when]);

  return (
    <Modal
      opened={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      centered
      title={title}
    >
      <Stack gap="md">
        <Text size="sm">{body}</Text>
        <Stack gap="xs">
          <Button color="red" onClick={() => blocker.proceed?.()}>
            {leaveLabel}
          </Button>
          <Button variant="default" onClick={() => blocker.reset?.()}>
            {stayLabel}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
