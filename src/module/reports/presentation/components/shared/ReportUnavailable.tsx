import React from 'react';
import { Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconFileOff, IconRefresh } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';

interface ReportUnavailableProps {
  onRetry?: () => void;
  /** Drops the card border when the state already sits inside a card. */
  embedded?: boolean;
}

/** Shown in place of a report whose data cannot be loaded; it says so plainly and points back to the report center. */
export const ReportUnavailable: React.FC<ReportUnavailableProps> = ({
  onRetry,
  embedded = false,
}) => {
  const { t } = useTranslation('reports');

  return (
    <Paper
      withBorder={!embedded}
      radius="lg"
      p={embedded ? 0 : 'xl'}
      bg="white"
      shadow={embedded ? undefined : 'xs'}
    >
      <Stack align="center" gap="sm" py="xl" ta="center" maw={440} mx="auto">
        <ThemeIcon size={56} radius="xl" color="gray" variant="light">
          <IconFileOff size={28} stroke={1.6} />
        </ThemeIcon>
        <Text fw={700} fz="lg" c="dark.9" role="status">
          {t('common.unavailableTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('common.unavailableDescription')}
        </Text>
        <Group gap="sm" mt="sm" justify="center">
          {onRetry && (
            <Button
              variant="default"
              radius="md"
              leftSection={<IconRefresh size={16} />}
              onClick={onRetry}
            >
              {t('common.retry')}
            </Button>
          )}
          <Button component={Link} to={routes.reports.main} radius="md" color="primary">
            {t('common.backToReportCenter')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
