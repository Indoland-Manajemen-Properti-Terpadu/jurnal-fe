import React, { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Group,
  Menu,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconInfoCircle,
  IconPrinter,
  IconRefresh,
  IconScale,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useBalanceSheet } from '@/module/reports/presentation/hooks/useBalanceSheet';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { ReportBackButton } from '@/module/reports/presentation/components/shared/ReportBackButton';
import { BalanceSheetFilterBar } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetFilterBar';
import { BalanceSheetSummary } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetSummary';
import { BalanceSheetStatement } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetStatement';
import { BalanceSheetProfitBreakdownModal } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetProfitBreakdownModal';
import type { BalanceSheetAccountItem } from '@/module/reports/domain/balanceSheet.types';
import { formatMoney } from '@/module/reports/domain/reportFormat';
import { useCompanySite } from '@/module/profile';
import { useTranslation } from '@/i18n';
import { ReportPrecisionProvider } from '@/module/reports/presentation/hooks/useReportPrecision';
import { routes } from '@/router/routes';
import classes from '@/module/reports/presentation/components/balance-sheet/BalanceSheet.module.css';

type BreakdownAccount = Pick<
  BalanceSheetAccountItem,
  'accountId' | 'accountNumber' | 'accountName' | 'balance'
>;

/** Route `/result-reports/business-overview/balance-sheet`: the balance sheet. */
export default function BalanceSheetPage() {
  const { t } = useTranslation('reports');
  const balanceSheet = useBalanceSheet();
  const { site } = useCompanySite();
  const [breakdown, setBreakdown] = useState<BreakdownAccount | null>(null);
  const [breakdownOpened, setBreakdownOpened] = useState(false);
  const { data } = balanceSheet;

  return (
    <AppShellLayout>
      <ReportPrecisionProvider precision={data?.precision} negativeFormat={data?.negativeFormat}>
        <Box p={0} className="balance-sheet-print">
          <Stack gap="md">
            <Box className={classes.screenOnly}>
              <ReportBackButton label={t('balanceSheet.backToReportCenter')} plain />
            </Box>
            <Box className={classes.screenOnly}>
              <ReportPageHeader
                icon={IconScale}
                title={t('balanceSheet.pageTitle')}
                description={t('balanceSheet.pageDescription')}
                showBackButton={false}
                compact
                actions={
                  <>
                    <Tooltip label={t('common.printReport')}>
                      <ActionIcon
                        variant="default"
                        size="input-sm"
                        radius="md"
                        onClick={() => window.print()}
                        disabled={!data}
                        aria-label={t('common.printReport')}
                      >
                        <IconPrinter size={17} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu position="bottom-end" shadow="md" width={200} withinPortal>
                      <Menu.Target>
                        <Button
                          size="sm"
                          variant="default"
                          radius="md"
                          leftSection={<IconDownload size={16} />}
                          rightSection={<IconChevronDown size={14} />}
                          loading={balanceSheet.exportMutation.isPending}
                          disabled={!data}
                        >
                          {t('common.export')}
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconFileTypePdf size={16} />}
                          onClick={() => balanceSheet.exportMutation.mutate('pdf')}
                        >
                          {t('common.formatPdf')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconFileSpreadsheet size={16} />}
                          onClick={() => balanceSheet.exportMutation.mutate('xlsx')}
                        >
                          {t('common.formatXlsx')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconFileTypeCsv size={16} />}
                          onClick={() => balanceSheet.exportMutation.mutate('csv')}
                        >
                          {t('common.formatCsv')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </>
                }
              />
            </Box>
            <Box className={classes.screenOnly}>
              <BalanceSheetFilterBar
                preset={balanceSheet.preset}
                onPresetChange={balanceSheet.handlePresetChange}
                period={balanceSheet.period}
                onPeriodChange={balanceSheet.handlePeriodChange}
                comparison={balanceSheet.comparison}
                onComparisonChange={balanceSheet.setComparison}
                customComparePeriod={balanceSheet.customComparePeriod}
                onCustomComparePeriodChange={balanceSheet.setCustomComparePeriod}
                comparePeriod={balanceSheet.comparePeriod}
              />
            </Box>

            {balanceSheet.query.isPending && (
              <Stack gap="md">
                <Skeleton height={230} radius="lg" />
                <Skeleton height={110} radius="lg" />
                <Skeleton height={420} radius="lg" />
              </Stack>
            )}

            {balanceSheet.query.isError && (
              <Alert
                color="red"
                title={t('balanceSheet.loadFailed')}
                icon={<IconAlertTriangle size={20} />}
                radius="lg"
              >
                <Group justify="space-between" align="center" gap="sm">
                  <Text size="sm">{balanceSheet.query.error.message}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => balanceSheet.query.refetch()}
                  >
                    {t('common.retry')}
                  </Button>
                </Group>
              </Alert>
            )}

            {data && (
              <>
                {data.unmapped.length > 0 && (
                  <Alert
                    color="orange"
                    radius="lg"
                    icon={<IconAlertTriangle size={20} />}
                    title={t('balanceSheet.unmappedTitle', { count: data.unmapped.length })}
                  >
                    <Stack gap="xs">
                      <Text size="sm">
                        {data.unmapped
                          .map((item) => `${item.accountNumber ?? '–'} ${item.accountName}`)
                          .join(' · ')}
                      </Text>
                      <Anchor component={Link} to={routes.chartOfAccounts.main} size="sm" fw={600}>
                        {t('balanceSheet.openChartOfAccounts')}
                      </Anchor>
                    </Stack>
                  </Alert>
                )}
                {data.overdrafts.length > 0 && (
                  <Alert
                    color="blue"
                    radius="lg"
                    icon={<IconInfoCircle size={20} />}
                    title={t('balanceSheet.overdraftTitle', { count: data.overdrafts.length })}
                  >
                    <Stack gap="xs">
                      {data.overdrafts.map((item) => (
                        <Text size="sm" key={`${item.accountNumber}-${item.accountName}`}>
                          {item.accountNumber ? `${item.accountNumber} · ` : ''}
                          {item.accountName}:{' '}
                          {formatMoney(item.balance, data.precision ?? 2, data.negativeFormat)}
                        </Text>
                      ))}
                      <Text size="sm">{t('balanceSheet.overdraftExplanation')}</Text>
                    </Stack>
                  </Alert>
                )}
                <BalanceSheetSummary data={data} />
                <BalanceSheetStatement
                  data={data}
                  period={balanceSheet.period}
                  companyName={site?.name}
                  searchQuery={balanceSheet.searchQuery}
                  onSearchQueryChange={balanceSheet.setSearchQuery}
                  viewMode={balanceSheet.viewMode}
                  onViewModeChange={balanceSheet.setViewMode}
                  hideZero={balanceSheet.hideZero}
                  onHideZeroChange={balanceSheet.setHideZero}
                  onDerivedAccountClick={(name, code, balance, accountId) => {
                    setBreakdown({ accountName: name, accountNumber: code, balance, accountId });
                    setBreakdownOpened(true);
                  }}
                />
              </>
            )}
          </Stack>
        </Box>
        <BalanceSheetProfitBreakdownModal
          opened={breakdownOpened}
          onClose={() => setBreakdownOpened(false)}
          onClosed={() => setBreakdown(null)}
          account={breakdown}
          asOf={balanceSheet.period.endDate}
        />
      </ReportPrecisionProvider>
    </AppShellLayout>
  );
}
