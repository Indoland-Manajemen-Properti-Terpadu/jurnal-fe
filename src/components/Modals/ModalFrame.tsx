import type { ReactNode } from 'react';
import { Box, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface ModalFrameProps {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  /** One or two sentences under the title: what the dialog is for. */
  description?: ReactNode;
  /** The buttons, right aligned in the footer; leave it out when the body ends the dialog itself. */
  footer?: ReactNode;
  /** A Mantine size or a CSS width; wide tables want `min(1080px, 94vw)`. */
  size?: string | number;
  /** Lets the body scroll while the header and footer stay put. */
  scrollBody?: boolean;
  /** Padding of the body; `0` lets a table or a list run edge to edge. */
  bodyPadding?: 'lg' | 0;
  /** Sits in the header under the title, inside its border: a search box, a filter. */
  headerExtra?: ReactNode;
  children?: ReactNode;
}

/**
 * The frame every dialog shares: a header and a footer separated from the body by a line that
 * runs from edge to edge, and a body that pads its own content. The theme pads every Paper, so
 * the frame sets the padding of each region itself.
 */
export function ModalFrame({
  opened,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  scrollBody,
  bodyPadding = 'lg',
  headerExtra,
  children,
}: Readonly<ModalFrameProps>) {
  const { t } = useTranslation('common');
  return (
    <Modal.Root opened={opened} onClose={onClose} centered size={size} radius="lg">
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content p={0} radius="lg">
        <Box style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Modal.Header px="lg" py="md" style={{ minHeight: 0 }}>
            <Modal.Title style={{ flex: 1, paddingRight: 'var(--mantine-spacing-md)' }}>
              <Text component="div" fw={600} fz={17} c="dark.9" lh={1.3}>
                {title}
              </Text>
              {description && (
                <Text size="sm" c="dimmed" lh={1.5} component="div" fw={400} mt={4}>
                  {description}
                </Text>
              )}
            </Modal.Title>
            <Modal.CloseButton aria-label={t('close')} style={{ alignSelf: 'flex-start' }} />
          </Modal.Header>
          {headerExtra && (
            <Box px="lg" pb="md">
              {headerExtra}
            </Box>
          )}
        </Box>
        <Modal.Body
          p={0}
          style={scrollBody ? { overflowY: 'auto', maxHeight: 'min(60vh, 640px)' } : undefined}
        >
          <Box p={bodyPadding}>
            <Stack gap="md">{children}</Stack>
          </Box>
        </Modal.Body>
        {footer && (
          <Group
            justify="flex-end"
            gap="sm"
            px="lg"
            py="md"
            style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
          >
            {footer}
          </Group>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
