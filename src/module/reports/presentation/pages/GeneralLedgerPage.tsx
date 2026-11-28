import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Alert, Box, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useTranslation } from '@/i18n';
import { useCompanySite } from '@/module/profile';
import { selectLedgerAccounts } from '@/module/reports/domain/generalLedgerView';
import { formatMoney } from '@/module/reports/domain/reportFormat';
import { GeneralLedgerFilterBar } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerFilterBar';
import { GeneralLedgerHeader } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerHeader';
import { GeneralLedgerSummaryCards } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerSummaryCards';
import { GeneralLedgerTable } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerTable';
import { useGeneralLedger } from '@/module/reports/presentation/hooks/useGeneralLedger';
import { ReportPrecisionProvider } from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from '@/module/reports/presentation/components/general-ledger/GeneralLedger.module.css';

export default function GeneralLedgerPage() {
  const { t } = useTranslation('reports');
  const ledger = useGeneralLedger();
  const { site } = useCompanySite();
  const [printMode, setPrintMode] = useState(false);
  const report = ledger.query.data;
  const hasAccounts = ledger.hideWithoutTransactions
    ? ledger.activeAccountCount > 0
    : ledger.accounts.length > 0;
  const printAccounts = printMode
    ? selectLedgerAccounts(ledger.accounts, '', ledger.hideWithoutTransactions)
    : ledger.filteredAccounts;
  const print = () => {
    flushSync(() => setPrintMode(true));
    window.print();
    setPrintMode(false);
  };

  return (
    <AppShellLayout>
      <ReportPrecisionProvider
        precision={report?.precision}
        negativeFormat={report?.negativeFormat}
      >
        <Box p={{ base: 'md', sm: 'xl' }} className="general-ledger-print">
          <Stack gap="lg">
            <GeneralLedgerHeader
              hasData={Boolean(report && hasAccounts)}
              isExporting={ledger.exportMutation.isPending}
              onExport={(type) => ledger.exportMutation.mutate(type)}
              onPrint={print}
            />
            <Box className={classes.screenOnly}>
              <GeneralLedgerFilterBar
                preset={ledger.preset}
                onPresetChange={ledger.handlePresetChange}
                period={ledger.period}
                onPeriodChange={ledger.handleCustomPeriod}
              />
            </Box>

            {ledger.query.isPending && (
              <Stack gap="md">
                <Skeleton height={104} radius="lg" />
                <Skeleton height={440} radius="lg" />
              </Stack>
            )}
            {ledger.query.isError && (
              <Alert
                color="red"
                title={t('generalLedger.loadFailed')}
                icon={<IconAlertTriangle size={20} />}
                radius="lg"
              >
                <Group justify="space-between" align="center" gap="sm">
                  <Text size="sm">{ledger.query.error.message}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => ledger.query.refetch()}
                  >
                    {t('common.retry')}
                  </Button>
                </Group>
              </Alert>
            )}

            {report && (
              <>
                {!ledger.isBalanced && (
                  <Alert
                    color="red"
                    radius="lg"
                    icon={<IconAlertTriangle size={20} />}
                    title={t('generalLedger.unbalancedTitle')}
                    className={classes.screenOnly}
                  >
                    {t('generalLedger.unbalancedCallout', {
                      value: formatMoney(ledger.difference, report.precision ?? 2),
                    })}
                  </Alert>
                )}
                <Box className={classes.screenOnly}>
                  <GeneralLedgerSummaryCards
                    report={report}
                    period={ledger.period}
                    activeAccountCount={ledger.activeAccountCount}
                    journalCount={ledger.journalCount}
                    isBalanced={ledger.isBalanced}
                  />
                </Box>
                <GeneralLedgerTable
                  accounts={printAccounts}
                  period={ledger.period}
                  companyName={site?.name}
                  search={printMode ? '' : ledger.accountSearch}
                  onSearchChange={ledger.setAccountSearch}
                  hideWithoutTransactions={ledger.hideWithoutTransactions}
                  onHideWithoutTransactionsChange={ledger.setHideWithoutTransactions}
                  debitTotal={report.periodDebitTotal}
                  creditTotal={report.periodCreditTotal}
                  printMode={printMode}
                />
              </>
            )}
          </Stack>
        </Box>
      </ReportPrecisionProvider>
    </AppShellLayout>
  );
}
