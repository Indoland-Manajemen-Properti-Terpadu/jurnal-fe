import React from 'react';
import { Box, Group, Text } from '@mantine/core';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import {
  currentAssetsShare,
  currentRatio,
  debtRatio,
} from '@/module/reports/domain/balanceSheetInsights';
import { useTranslation } from '@/i18n';
import classes from './BalanceSheet.module.css';

interface BalanceSheetReadingProps {
  data: BalanceSheetData;
}

const Reading = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <Box className={classes.readingCell}>
    <Group justify="space-between" align="baseline" wrap="nowrap" gap="xs">
      <Text fz="sm" c="dark.9" fw={600}>
        {label}
      </Text>
      <Text fz="md" fw={700} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Group>
    <Text fz="xs" c="dimmed" mt={2}>
      {note}
    </Text>
  </Box>
);

/**
 * Three plain readings that turn the totals into a conclusion: whether the short-term obligations
 * are covered, who finances the assets, and how much of the assets can be turned into cash soon.
 * They state the figure and what it means; they judge nothing.
 */
export const BalanceSheetReading: React.FC<BalanceSheetReadingProps> = ({ data }) => {
  const { t, currentLanguage } = useTranslation('reports');
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
  const ratioFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const percentFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const ratio = currentRatio(data);
  const debt = debtRatio(data);
  const currentShare = currentAssetsShare(data);

  return (
    <div className={classes.reading}>
      <Reading
        label={t('balanceSheet.ratioLabel')}
        value={ratio === null ? '–' : `${ratioFormat.format(ratio)}×`}
        note={
          ratio === null
            ? t('balanceSheet.ratioNone')
            : t(ratio >= 1 ? 'balanceSheet.ratioEnough' : 'balanceSheet.ratioShort')
        }
      />
      <Reading
        label={t('balanceSheet.debtRatioLabel')}
        value={debt === null ? '–' : `${percentFormat.format(debt)}%`}
        note={
          debt === null
            ? t('balanceSheet.debtRatioNone')
            : t(debt > 100 ? 'balanceSheet.debtRatioOver' : 'balanceSheet.debtRatioNote')
        }
      />
      <Reading
        label={t('balanceSheet.currentShareLabel')}
        value={currentShare === null ? '–' : `${percentFormat.format(currentShare)}%`}
        note={
          currentShare === null
            ? t('balanceSheet.currentShareNone')
            : t('balanceSheet.currentShareNote')
        }
      />
    </div>
  );
};
