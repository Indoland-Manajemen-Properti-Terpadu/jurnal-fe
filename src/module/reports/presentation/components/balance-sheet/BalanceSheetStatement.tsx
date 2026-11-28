import React from 'react';
import { Box, Group, Paper, SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import type {
  BalanceSheetData,
  BalanceSheetQueryParams,
  BalanceSheetViewMode,
} from '@/module/reports/domain/balanceSheet.types';
import {
  balanceSheetChange,
  selectBalanceSheetSections,
} from '@/module/reports/domain/balanceSheetView';
import { displayLongDate, formatCount } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { BalanceSheetTable } from './BalanceSheetTable';
import classes from './BalanceSheet.module.css';

interface BalanceSheetStatementProps {
  data: BalanceSheetData;
  period: BalanceSheetQueryParams;
  companyName?: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  viewMode: BalanceSheetViewMode;
  onViewModeChange: (mode: BalanceSheetViewMode) => void;
  hideZero: boolean;
  onHideZeroChange: (hide: boolean) => void;
  onDerivedAccountClick: (
    name: string,
    code: string | null,
    balance: number,
    accountId: string | null
  ) => void;
}

export const BalanceSheetStatement: React.FC<BalanceSheetStatementProps> = ({
  data,
  period,
  companyName,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  hideZero,
  onHideZeroChange,
  onDerivedAccountClick,
}) => {
  const { t, currentLanguage } = useTranslation('reports');
  const searching = searchQuery.trim() !== '';
  const sections = selectBalanceSheetSections(data.sections, data.compare?.sections, {
    search: searchQuery,
    hideZero,
    mode: viewMode,
  });
  const grandChange = data.compare
    ? balanceSheetChange(data.totalLiabilitiesAndEquity, data.compare.totalLiabilitiesAndEquity)
    : null;
  const moduleCounts = Object.entries(data.modules ?? {})
    .map(([name, count]) => `${name} ${formatCount(count)}`)
    .join(' · ');

  return (
    <Paper withBorder radius="lg" p={0} bg="white" className={classes.statementPaper}>
      <Stack gap="md" p="lg">
        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="md"
          className={classes.screenOnly}
        >
          <ReportSearchInput
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder={t('balanceSheet.searchAccounts')}
          />
          <Group justify="flex-end" wrap="wrap" gap="md">
            <Switch
              size="sm"
              color="primary"
              checked={hideZero}
              onChange={(event) => onHideZeroChange(event.currentTarget.checked)}
              label={t('balanceSheet.hideZero')}
              aria-label={t('balanceSheet.hideZero')}
            />
            <SegmentedControl
              size="sm"
              radius="md"
              value={searching ? 'rinci' : viewMode}
              onChange={(value) => onViewModeChange(value as BalanceSheetViewMode)}
              data={[
                { value: 'rinci', label: t('balanceSheet.modeDetailed') },
                { value: 'ringkas', label: t('balanceSheet.modeSummary') },
              ]}
              aria-label={t('balanceSheet.viewMode')}
            />
          </Group>
        </Group>
        <Box className={classes.reportHeading}>
          {companyName && (
            <Text fz="sm" c="dimmed">
              {companyName}
            </Text>
          )}
          <Text fw={700} fz="lg">
            {t('balanceSheet.pageTitle')}
          </Text>
          <Text fz="sm" c="dimmed">
            {displayLongDate(period.startDate, currentLanguage)} {t('balanceSheet.periodUntil')}{' '}
            {displayLongDate(period.endDate, currentLanguage)}
            {data.compare &&
              ` · ${t('balanceSheet.comparedTo', {
                date: displayLongDate(data.compare.endDate, currentLanguage),
              })}`}
          </Text>
        </Box>
        <BalanceSheetTable
          sections={sections}
          searching={searching}
          compareAsOf={data.compare ? data.compare.endDate : undefined}
          period={period}
          onDerivedAccountClick={onDerivedAccountClick}
          grandTotal={{
            value: data.totalLiabilitiesAndEquity,
            compareValue: data.compare?.totalLiabilitiesAndEquity ?? null,
            change: grandChange?.amount ?? null,
            changePercent: grandChange?.percent ?? null,
          }}
        />
        <Text fz="xs" c="dimmed" className={classes.footnote}>
          {data.journalCount == null
            ? t('balanceSheet.footnoteBase', {
                date: displayLongDate(data.endDate, currentLanguage),
              })
            : t('balanceSheet.footnote', {
                count: formatCount(data.journalCount),
                date: displayLongDate(data.endDate, currentLanguage),
                modules: moduleCounts || t('balanceSheet.noModuleCounts'),
              })}
          {data.overdrafts.length > 0 && ` ${t('balanceSheet.overdraftFootnote')}`}
        </Text>
      </Stack>
    </Paper>
  );
};
