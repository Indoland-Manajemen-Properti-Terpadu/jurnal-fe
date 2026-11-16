import { useState } from 'react';
import { Button, Checkbox, Group, List, Modal, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconFileOff,
  IconLockOpen,
  IconReportMoney,
  IconRotate2,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { useReopenPeriod } from '@/module/period-closing/presentation/hooks/usePeriodQueries';
import { formatRange } from '@/module/period-closing/presentation/periodFormat';

interface ReopenPeriodModalProps {
  period: AccountingPeriod;
  onClose: () => void;
}

/** Undo the latest closing, after the user has read what it changes and said so. */
export function ReopenPeriodModal({ period, onClose }: Readonly<ReopenPeriodModalProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const [acknowledged, setAcknowledged] = useState(false);
  const reopen = useReopenPeriod();
  const range = formatRange(period, currentLanguage);

  return (
    <Modal
      opened
      onClose={reopen.isPending ? () => undefined : onClose}
      centered
      size="lg"
      radius="lg"
      title={
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="red">
            <IconRotate2 size={20} />
          </ThemeIcon>
          <Text fw={700}>{t('reopen.title')}</Text>
        </Group>
      }
    >
      <Stack gap="md">
        <Text size="sm">{t('reopen.intro', { name: period.name, range })}</Text>

        <Paper withBorder radius="md" p="md" bg="gray.0">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              {t('reopen.effectsTitle')}
            </Text>
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl" variant="light" color="red">
                    <IconFileOff size={14} />
                  </ThemeIcon>
                }
              >
                {period.closingJournalId
                  ? t('reopen.effectJournal')
                  : t('reopen.effectJournalNone')}
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl" variant="light" color="orange">
                    <IconLockOpen size={14} />
                  </ThemeIcon>
                }
              >
                {t('reopen.effectUnlock', { range })}
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl" variant="light" color="primary">
                    <IconReportMoney size={14} />
                  </ThemeIcon>
                }
              >
                {t('reopen.effectReports')}
              </List.Item>
            </List>
          </Stack>
        </Paper>

        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon size={24} radius="xl" variant="light" color="teal">
            <IconCalendarEvent size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={600}>
              {t('reopen.afterTitle')}
            </Text>
            <Text size="sm" c="dimmed">
              {t('reopen.after')}
            </Text>
          </div>
        </Group>

        <Checkbox
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.currentTarget.checked)}
          label={t('reopen.acknowledge')}
          color="red"
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={onClose} disabled={reopen.isPending}>
            {t('actions.cancel')}
          </Button>
          <Button
            color="red"
            radius="md"
            leftSection={<IconAlertTriangle size={16} />}
            disabled={!acknowledged}
            loading={reopen.isPending}
            onClick={() => reopen.mutate(period, { onSuccess: onClose })}
          >
            {t('reopen.confirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
