import { Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCircleCheck, IconFileText, IconList } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { formatDay, formatRange } from '@/module/period-closing/presentation/periodFormat';

/** The outcome of a closing, with the way to its journal. */
export function ClosingDone({ period }: Readonly<{ period: AccountingPeriod }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const navigate = useNavigate();

  return (
    <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} bg="white">
      <Stack align="center" gap="md" py="lg" maw={560} mx="auto" ta="center">
        <ThemeIcon size={72} radius="xl" variant="light" color="teal">
          <IconCircleCheck size={40} stroke={1.6} />
        </ThemeIcon>
        <Stack gap={4}>
          <Title order={3} fz="xl">
            {t('wizard.done.title', { end: formatDay(period.endDate, currentLanguage) })}
          </Title>
          <Text size="sm" c="dimmed">
            {period.name} · {formatRange(period, currentLanguage)}
          </Text>
        </Stack>
        <Text size="sm">
          {period.closingJournalId ? t('wizard.done.journal') : t('wizard.done.noJournal')}
        </Text>
        <Group gap="sm" justify="center">
          {period.closingJournalId && (
            <Button
              variant="default"
              radius="md"
              leftSection={<IconFileText size={16} />}
              onClick={() =>
                navigate(
                  routes.journalEntries.detail.replace(
                    ':idTransaction',
                    period.closingJournalId as string
                  )
                )
              }
            >
              {t('wizard.done.viewJournal')}
            </Button>
          )}
          <Button
            color="primary"
            radius="md"
            leftSection={<IconList size={16} />}
            onClick={() => navigate(routes.periodClosing.main)}
          >
            {t('wizard.done.toList')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
