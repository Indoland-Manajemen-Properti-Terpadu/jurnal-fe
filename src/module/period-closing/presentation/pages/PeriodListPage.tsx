import { useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconBook2, IconCalendarStats, IconLock, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { latestActiveClosing } from '@/module/period-closing/domain/periodRules';
import { PeriodFormModal } from '@/module/period-closing/presentation/components/PeriodFormModal';
import { PeriodGuide } from '@/module/period-closing/presentation/components/PeriodGuide';
import { PeriodHero } from '@/module/period-closing/presentation/components/PeriodHero';
import type { PeriodAction } from '@/module/period-closing/presentation/components/PeriodRowActions';
import {
  PeriodLoadError,
  PeriodNoAccess,
} from '@/module/period-closing/presentation/components/PeriodStates';
import { PeriodStatusSummary } from '@/module/period-closing/presentation/components/PeriodStatusSummary';
import { PeriodTable } from '@/module/period-closing/presentation/components/PeriodTable';
import { ReopenPeriodModal } from '@/module/period-closing/presentation/components/ReopenPeriodModal';
import { usePeriodAccess } from '@/module/period-closing/presentation/hooks/usePeriodAccess';
import { usePeriodListParams } from '@/module/period-closing/presentation/hooks/usePeriodListParams';
import {
  isForbiddenError,
  useActivePeriods,
  useDeletePeriod,
  usePeriods,
  useToggleLock,
} from '@/module/period-closing/presentation/hooks/usePeriodQueries';
import { formatRange } from '@/module/period-closing/presentation/periodFormat';

type Dialog =
  | { kind: 'form'; period: AccountingPeriod | null }
  | { kind: 'delete'; period: AccountingPeriod }
  | { kind: 'reopen'; period: AccountingPeriod }
  | null;

/** Every period lock and closing of the site, with the state of the books on top. */
export function PeriodListPage() {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const access = usePeriodAccess();
  const filters = usePeriodListParams();
  const [dialog, setDialog] = useState<Dialog>(null);

  const allowed = !access.isReady || access.canRead;
  const list = usePeriods(filters.params, allowed);
  const closings = useActivePeriods('CLOSE', allowed);
  const locks = useActivePeriods('LOCK', allowed);
  const remove = useDeletePeriod();
  const toggle = useToggleLock();

  const forbidden = (access.isReady && !access.canRead) || isForbiddenError(list.error);
  const latestClosing = latestActiveClosing(closings.data?.items ?? []);
  const summaryLoading = closings.isLoading || locks.isLoading;
  const nothingYet = !summaryLoading && !latestClosing && (locks.data?.items.length ?? 0) === 0;
  // The guide opens on a first visit only, decided once, so it does not jump while working.
  const [guideOpen, setGuideOpen] = useState<boolean | null>(null);
  useEffect(() => {
    if (!summaryLoading && guideOpen === null) setGuideOpen(nothingYet);
  }, [summaryLoading, guideOpen, nothingYet]);

  const refetch = () => {
    list.refetch();
    closings.refetch();
    locks.refetch();
  };

  const onAction = (action: PeriodAction, period: AccountingPeriod) => {
    switch (action) {
      case 'edit':
        setDialog({ kind: 'form', period });
        break;
      case 'toggle':
        toggle.mutate(period);
        break;
      case 'delete':
        setDialog({ kind: 'delete', period });
        break;
      case 'reopen':
        setDialog({ kind: 'reopen', period });
        break;
      case 'journal':
        if (period.closingJournalId) {
          navigate(routes.journalEntries.detail.replace(':idTransaction', period.closingJournalId));
        }
        break;
      default:
        break;
    }
  };

  const headerActions = !forbidden && (
    <Group gap="sm" wrap="wrap">
      <Tooltip label={t('page.refresh')} withArrow>
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          aria-label={t('page.refresh')}
          onClick={refetch}
          loading={list.isFetching && !list.isLoading}
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Tooltip>
      {access.canCreate && (
        <>
          <Button
            variant="default"
            radius="md"
            leftSection={<IconLock size={16} />}
            onClick={() => setDialog({ kind: 'form', period: null })}
          >
            {t('actions.lockPeriod')}
          </Button>
          <Button
            color="primary"
            radius="md"
            leftSection={<IconBook2 size={16} />}
            onClick={() => navigate(routes.periodClosing.closeBooks)}
          >
            {t('actions.closeBooks')}
          </Button>
        </>
      )}
    </Group>
  );

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconCalendarStats}
            title={t('page.title')}
            description={t('page.description')}
            actions={headerActions}
          />

          {forbidden ? (
            <PeriodNoAccess />
          ) : (
            <>
              <PeriodHero />

              <PeriodStatusSummary
                latestClosing={latestClosing}
                activeLocks={locks.data?.items ?? []}
                loading={summaryLoading}
              />

              {guideOpen !== null && <PeriodGuide defaultOpen={guideOpen} />}

              {list.isError ? (
                <PeriodLoadError onRetry={refetch} />
              ) : (
                <Paper withBorder radius="md" p="xl" bg="white">
                  <Stack gap="lg">
                    <Stack gap={2}>
                      <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
                        {t('table.title')}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {t('table.subtitle')}
                      </Text>
                    </Stack>
                    <PeriodTable
                      periods={list.data?.items ?? []}
                      pagination={list.data?.pagination}
                      loading={list.isLoading}
                      filters={filters}
                      access={access}
                      latestClosingId={latestClosing?.id}
                      onAction={onAction}
                    />
                  </Stack>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </Box>

      {dialog?.kind === 'form' && (
        <PeriodFormModal
          key={dialog.period?.id ?? 'new'}
          opened
          period={dialog.period}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'reopen' && (
        <ReopenPeriodModal period={dialog.period} onClose={() => setDialog(null)} />
      )}

      <ConfirmModal
        opened={dialog?.kind === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind !== 'delete') return;
          remove.mutate(dialog.period, { onSuccess: () => setDialog(null) });
        }}
        title={t('delete.title')}
        message={dialog?.kind === 'delete' ? t('delete.message', { name: dialog.period.name }) : ''}
        helperText={
          dialog?.kind === 'delete'
            ? t('delete.helper', { range: formatRange(dialog.period, currentLanguage) })
            : ''
        }
        imageAlt=""
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('actions.cancel')}
        confirmLoading={remove.isPending}
      />
    </>
  );
}

export default PeriodListPage;
