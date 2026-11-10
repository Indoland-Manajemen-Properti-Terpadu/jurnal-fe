import React from 'react';
import { Box, Paper, Text } from '@mantine/core';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import {
  currentAssetsShare,
  currentRatio,
  fundingStructure,
} from '@/module/reports/domain/balanceSheetInsights';
import { useTranslation } from '@/i18n';
import classes from './BalanceSheet.module.css';

const ratioFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

interface BalanceSheetReadingProps {
  data: BalanceSheetData;
}

const Reading = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <Box>
    <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    <Text fz="xl" fw={700} c="dark.9" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Text>
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
  const { t } = useTranslation('reports');
  const ratio = currentRatio(data);
  const funding = fundingStructure(data);
  const currentShare = currentAssetsShare(data);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fz="sm" fw={600} c="dark.9" mb="md">
        {t('balanceSheet.readingTitle')}
      </Text>
      <div className={classes.reading}>
        <Reading
          label={t('balanceSheet.ratioLabel')}
          value={ratio === null ? '–' : `${ratioFormat.format(ratio)}×`}
          note={
            ratio === null
              ? t('balanceSheet.ratioNone')
              : t('balanceSheet.ratioNote', { times: ratioFormat.format(ratio) })
          }
        />
        <Reading
          label={t('balanceSheet.fundingLabel')}
          value={t('balanceSheet.fundingValue', {
            liabilities: percentFormat.format(funding.liabilitiesShare),
            equity: percentFormat.format(funding.equityShare),
          })}
          note={t('balanceSheet.fundingNote')}
        />
        <Reading
          label={t('balanceSheet.currentShareLabel')}
          value={currentShare === null ? '–' : `${percentFormat.format(currentShare)}%`}
          note={t('balanceSheet.currentShareNote')}
        />
      </div>
    </Paper>
  );
};
