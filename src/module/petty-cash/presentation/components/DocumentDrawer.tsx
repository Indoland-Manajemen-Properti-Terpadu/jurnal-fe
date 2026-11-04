import type { ReactNode } from 'react';
import { Alert, Drawer, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import classes from '@/module/petty-cash/presentation/components/DocumentDrawer.module.css';

interface Props {
  opened: boolean;
  onClose: () => void;
  /** Small line above the number: what kind of document this is. */
  kindLabel: string;
  number?: string;
  status?: ReactNode;
  loading: boolean;
  error: unknown;
  loadFailed: string;
  onRetry: () => void;
  /** Rendered in a sticky footer; the footer hides itself when the actions render nothing. */
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * The frame every petty cash detail drawer shares: the same header, loading and error states, a
 * column of cards, and the actions pinned to the bottom so they are always within reach.
 */
export function DocumentDrawer({
  opened,
  onClose,
  kindLabel,
  number,
  status,
  loading,
  error,
  loadFailed,
  onRetry,
  actions,
  children,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      padding="lg"
      title={
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {kindLabel}
          </Text>
          <Group gap="sm">
            <Text fw={700} fz={17}>
              {number ?? ''}
            </Text>
            {status}
          </Group>
        </Stack>
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      {loading && (
        <Stack gap="sm">
          <Skeleton height={88} radius="md" />
          <Skeleton height={140} radius="md" />
        </Stack>
      )}
      {Boolean(error) && <QueryErrorState title={loadFailed} error={error} onRetry={onRetry} />}
      {children && <Stack gap="md">{children}</Stack>}
      {children && actions && <div className={classes.footer}>{actions}</div>}
    </Drawer>
  );
}

type NoticeTone = 'refusal' | 'warning' | 'info';

const NOTICE: Record<NoticeTone, { color: string; icon: ReactNode }> = {
  refusal: { color: 'red', icon: <IconCircleX size={18} /> },
  warning: { color: 'orange', icon: <IconAlertTriangle size={18} /> },
  info: { color: 'gray', icon: <IconInfoCircle size={18} /> },
};

/** The only colored element in a drawer besides the status: something the reader must know. */
export function DocumentNotice({
  tone,
  title,
  children,
}: Readonly<{ tone: NoticeTone; title?: string; children: ReactNode }>) {
  return (
    <Alert
      color={NOTICE[tone].color}
      variant="light"
      radius="md"
      icon={NOTICE[tone].icon}
      title={title}
    >
      {children}
    </Alert>
  );
}
