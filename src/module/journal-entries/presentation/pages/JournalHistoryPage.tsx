import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Paper, Stack } from '@mantine/core';
import { IconNotebook, IconPlus } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { ReportPageHeader, ReportToolbar } from '@/module/reports';
import { useMyGrants } from '@/module/user-management';
import { routes } from '@/router/routes';
import {
  LEDGER_MENU_ID,
  emptyHistoryFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  type JournalHistoryEntry,
  type JournalHistoryFilters,
} from '../../domain/journalHistory';
import { JournalHistoryFilterBar } from '../components/JournalHistoryFilters';
import { JournalHistoryTable } from '../components/JournalHistoryTable';
import { useJournalHistory } from '../hooks/useJournalHistory';
import { useExportJournals } from '../hooks/useExportJournals';
import { useJournalPeriod, withDefaultPeriod } from '../hooks/useJournalPeriod';
import { useVoidJournalEntry } from '../hooks/useVoidJournalEntry';

/**
 * Every posted journal across all accounts. The filters live in the address, so a view can be
 * shared, reloaded and reached with the back button; the server filters, sorts and pages.
 */
export default function JournalHistoryPage() {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, isReady } = useMyGrants();

  const rawFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const filters = useMemo(() => withDefaultPeriod(rawFilters), [rawFilters]);
  const query = useJournalHistory(filters);
  const voidMutation = useVoidJournalEntry();
  const [voidTarget, setVoidTarget] = useState<JournalHistoryEntry | null>(null);

  const canRead = !isReady || can(LEDGER_MENU_ID, 'read');
  const canVoid = can(LEDGER_MENU_ID, 'delete');

  const update = useCallback(
    (patch: Partial<JournalHistoryFilters>) => {
      // A change to what is listed starts again from page 1; only a page move keeps its page.
      const next = { ...filters, page: 1, ...patch };
      setSearchParams(filtersToParams(next));
    },
    [filters, setSearchParams]
  );

  const period = useJournalPeriod(filters, update);
  const journalExport = useExportJournals(filters);

  const openEntry = useCallback(
    (entry: JournalHistoryEntry) =>
      navigate(routes.journalEntries.detail.replace(':idTransaction', entry.id)),
    [navigate]
  );

  const confirmVoid = async () => {
    if (!voidTarget) return;
    try {
      await voidMutation.mutateAsync({ id: voidTarget.id, number: voidTarget.transactionNumber });
      setVoidTarget(null);
    } catch {
      // The hook already told the person; the dialog stays so they can retry or cancel.
    }
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconNotebook}
            title={t('history.title')}
            description={t('history.description')}
            actions={
              <Button
                color="primary"
                leftSection={<IconPlus size={18} />}
                onClick={() => navigate(routes.journalEntries.add)}
              >
                {t('history.add')}
              </Button>
            }
          />

          {canRead ? (
            <>
              <ReportToolbar
                preset={period.preset}
                onPresetChange={period.selectPreset}
                draftPeriod={period.draft}
                onDraftPeriodChange={period.setDraft}
                appliedPeriod={period.applied}
                onApplyPeriod={period.apply}
                isFetching={query.isFetching}
                onRefresh={() => query.refetch()}
                onExport={journalExport.exportJournals}
                isExporting={journalExport.isExporting}
                onCancelExport={journalExport.cancel}
                hasData={Boolean(query.data?.entries.length)}
                extra={<JournalHistoryFilterBar filters={filters} onChange={update} />}
              />
              <Paper withBorder radius="lg" p="md" bg="white">
                {query.isError && !query.data ? (
                  <ErrorAlert
                    title={t('history.loadErrorTitle')}
                    message={
                      <Button variant="light" color="red" size="xs" onClick={() => query.refetch()}>
                        {t('history.retry')}
                      </Button>
                    }
                  />
                ) : (
                  <JournalHistoryTable
                    data={query.data}
                    filters={filters}
                    isLoading={query.isLoading}
                    isFetching={query.isFetching}
                    isFiltered={hasActiveFilters(rawFilters)}
                    canVoid={canVoid}
                    onPageChange={(page) => update({ page })}
                    onLimitChange={(limit) => update({ limit })}
                    onSortChange={(sortBy, order) => update({ sortBy, order })}
                    onOpen={openEntry}
                    onVoid={setVoidTarget}
                    onResetFilters={() => setSearchParams(filtersToParams(emptyHistoryFilters()))}
                  />
                )}
              </Paper>
            </>
          ) : (
            <ErrorAlert title={t('history.loadErrorTitle')} message={t('history.voidNoAccess')} />
          )}
        </Stack>
      </Box>

      <ConfirmModal
        opened={voidTarget !== null}
        onClose={() => setVoidTarget(null)}
        title={t('void.confirmTitle')}
        message={t('void.confirmMessage', { number: voidTarget?.transactionNumber ?? '' })}
        helperText={t('void.confirmHelper')}
        confirmLabel={t('void.confirmLabel')}
        cancelLabel={t('void.cancel')}
        confirmLoading={voidMutation.isPending}
        onConfirm={confirmVoid}
      />
    </AppShellLayout>
  );
}
