import type { ReactNode } from 'react';
import { Box, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface Props {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** One or two sentences under the title: what happens when the dialog is confirmed. */
  description?: ReactNode;
  /** The buttons, right aligned in a footer separated from the fields. */
  footer: ReactNode;
  size?: string | number;
  children?: ReactNode;
}

/**
 * The frame every petty cash dialog shares: title with its explanation, the fields, then the
 * actions in a footer. The explanation sits under the title so the fields start right away.
 */
export function DialogFrame({
  opened,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  children,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  return (
    <Modal.Root opened={opened} onClose={onClose} centered size={size}>
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      {/* The theme pads every Paper; the dialog pads each region itself, so the footer runs edge to edge. */}
      <Modal.Content p={0} radius="lg">
        <Modal.Header px="lg" pt="lg" pb="md" style={{ alignItems: 'flex-start' }}>
          <Modal.Title style={{ flex: 1, paddingRight: 'var(--mantine-spacing-md)' }}>
            <Stack gap={4}>
              <Text fw={600} fz={17} c="dark.9" lh={1.3}>
                {title}
              </Text>
              {description && (
                <Text size="sm" c="dimmed" lh={1.5} component="div">
                  {description}
                </Text>
              )}
            </Stack>
          </Modal.Title>
          <Modal.CloseButton aria-label={t('common.close')} />
        </Modal.Header>
        <Modal.Body p={0}>
          {children && (
            <Box px="lg" pb="lg">
              <Stack gap="md">{children}</Stack>
            </Box>
          )}
          <Group
            justify="flex-end"
            gap="sm"
            px="lg"
            py="md"
            bg="gray.0"
            style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
          >
            {footer}
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
