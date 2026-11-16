import { Alert, Button, Paper, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconLockAccess, IconRefresh } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { PeriodIllustration } from './PeriodIllustration';

/** Shown instead of the page to someone without the period menu. */
export function PeriodNoAccess() {
  const { t } = useTranslation('periodClosing');
  return (
    <Paper withBorder radius="lg" bg="white">
      <EmptyState
        title={t('access.title')}
        description={t('access.description')}
        icon={<IconLockAccess size={32} stroke={1.5} />}
        color="gray"
        maw={480}
      />
    </Paper>
  );
}

export function PeriodLoadError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  const { t } = useTranslation('periodClosing');
  return (
    <Alert
      variant="light"
      color="red"
      radius="md"
      icon={<IconAlertCircle size={18} />}
      title={t('loadError.title')}
    >
      {t('loadError.description')}
      <Button
        mt="sm"
        size="xs"
        variant="default"
        leftSection={<IconRefresh size={14} />}
        onClick={onRetry}
        display="block"
      >
        {t('loadError.retry')}
      </Button>
    </Alert>
  );
}

/** The table before anything was locked or closed: a picture and what to do first. */
export function PeriodEmptyList() {
  const { t } = useTranslation('periodClosing');
  return (
    <Stack align="center" gap="xs" py={40} px="md">
      <PeriodIllustration name="empty" maxWidth={120} />
      <Text fw={600} ta="center">
        {t('empty.title')}
      </Text>
      <Text size="sm" c="dimmed" ta="center" maw={420} lh={1.55}>
        {t('empty.description')}
      </Text>
    </Stack>
  );
}
