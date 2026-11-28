import { useMemo } from 'react';
import { Alert, Button, Group, Loader, Modal, Stack, Table, Text } from '@mantine/core';
import { format } from 'date-fns';
import { useJournalEntriesByAccount } from '@/module/journal-entries';
import { useTranslation } from '@/i18n';
import { profitLossApi } from '@/module/reports/infrastructure/profitLossApi';
import type { BalanceSheetAccountItem } from '@/module/reports/domain/balanceSheet.types';
import { formatAmount } from '@/module/reports/domain/reportFormat';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';
import { useQuery } from '@tanstack/react-query';

interface Props {
  opened: boolean;
  onClose: () => void;
  onClosed: () => void;
  account: Pick<
    BalanceSheetAccountItem,
    'accountId' | 'accountNumber' | 'accountName' | 'balance'
  > | null;
  asOf: string;
}

const displayDate = (value: Date | string, language: string) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function BalanceSheetProfitBreakdownModal({
  opened,
  onClose,
  onClosed,
  account,
  asOf,
}: Props) {
  const { t, currentLanguage } = useTranslation('reports');
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  const retained =
    account?.accountNumber === '3-10002' || /ditahan|retained/i.test(account?.accountName ?? '');
  const period = useMemo(() => {
    const year = Number(asOf.slice(0, 4));
    const start = retained ? `${year - 1}-01-01` : `${year}-01-01`;
    return { startDate: start, endDate: retained ? `${year - 1}-12-31` : asOf };
  }, [asOf, retained]);
  const profitQuery = useQuery({
    queryKey: ['balance-sheet-profit-breakdown', period.startDate, period.endDate, currentLanguage],
    queryFn: ({ signal }) =>
      profitLossApi.getReport(
        period,
        {
          lang: currentLanguage,
          fallbackMessage: t('balanceSheet.profitBreakdownFailed'),
        },
        signal
      ),
    enabled: opened,
    staleTime: 60_000,
  });
  const entryQuery = useJournalEntriesByAccount(
    opened && retained ? (account?.accountId ?? '') : ''
  );
  const retainedEntries = useMemo(() => {
    const yearStart = `${asOf.slice(0, 4)}-01-01`;
    return (entryQuery.data ?? []).filter((entry) => {
      const date = format(entry.transactionDate, 'yyyy-MM-dd');
      return date >= yearStart && date <= asOf && !/void|draft|batal/i.test(entry.status);
    });
  }, [asOf, entryQuery.data]);
  const accounts =
    profitQuery.data?.statement?.current.sections.flatMap((section) => section.accounts) ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      onExitTransitionEnd={onClosed}
      title={
        <Stack gap={2}>
          <Text fw={700}>
            {account?.accountName} {account?.accountNumber ? `(${account.accountNumber})` : ''}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('balanceSheet.balanceAsOf', {
              date: displayDate(asOf, currentLanguage),
              amount: formatAmount(account?.balance ?? 0, precision, negativeFormat),
            })}
          </Text>
        </Stack>
      }
      centered
      size={920}
      keepMounted
    >
      <Stack gap="lg">
        <Text fz="sm" c="dimmed">
          {t(
            retained
              ? 'balanceSheet.retainedEarningsExplanation'
              : 'balanceSheet.currentEarningsExplanation'
          )}
        </Text>
        {profitQuery.isPending ? (
          <Loader size="sm" />
        ) : profitQuery.isError ? (
          <Alert color="red" title={t('balanceSheet.profitBreakdownFailed')}>
            {profitQuery.error.message}
          </Alert>
        ) : (
          <Table.ScrollContainer minWidth={520} type="native">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('common.accountName')}</Table.Th>
                  <Table.Th>{t('common.category')}</Table.Th>
                  <Table.Th ta="right">{t('balanceSheet.profitLoss')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {accounts.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      {item.code} · {item.name}
                    </Table.Td>
                    <Table.Td>{item.category ?? '–'}</Table.Td>
                    <Table.Td ta="right">
                      {formatAmount(item.balance, precision, negativeFormat)}
                    </Table.Td>
                  </Table.Tr>
                ))}
                {accounts.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Text c="dimmed" ta="center">
                        {t('balanceSheet.noProfitBreakdown')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        {retained && account?.accountId && (
          <Stack gap="xs">
            <Text fw={600}>{t('balanceSheet.retainedMutations')}</Text>
            {entryQuery.isPending ? (
              <Loader size="sm" />
            ) : entryQuery.isError ? (
              <Alert color="red" title={t('balanceSheet.retainedMutationsFailed')}>
                {entryQuery.error.message}
              </Alert>
            ) : (
              <Table.ScrollContainer minWidth={620} type="native">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('common.date')}</Table.Th>
                      <Table.Th>{t('balanceSheet.journalNumber')}</Table.Th>
                      <Table.Th>{t('common.detail')}</Table.Th>
                      <Table.Th ta="right">{t('common.debit')}</Table.Th>
                      <Table.Th ta="right">{t('common.creditId')}</Table.Th>
                      <Table.Th ta="right">{t('common.balance')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {retainedEntries.map((entry) => (
                      <Table.Tr key={entry.id}>
                        <Table.Td>{displayDate(entry.transactionDate, currentLanguage)}</Table.Td>
                        <Table.Td>#{entry.transactionNumber}</Table.Td>
                        <Table.Td>{entry.notes || entry.referenceNumber || '–'}</Table.Td>
                        <Table.Td ta="right">
                          {formatAmount(entry.debit, precision, negativeFormat)}
                        </Table.Td>
                        <Table.Td ta="right">
                          {formatAmount(entry.credit, precision, negativeFormat)}
                        </Table.Td>
                        <Table.Td ta="right">
                          {formatAmount(entry.balance, precision, negativeFormat)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {retainedEntries.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text c="dimmed" ta="center">
                            {t('balanceSheet.noRetainedMutations')}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Stack>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('balanceSheet.closeBreakdown')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
