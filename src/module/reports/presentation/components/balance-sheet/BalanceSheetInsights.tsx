import React, { useMemo } from 'react';
import { Box, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import {
  assetAccounts,
  composeByCategory,
  fundingStructure,
} from '@/module/reports/domain/balanceSheetInsights';
import { formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

const TONES = [
  'var(--mantine-color-primary-6)',
  'var(--mantine-color-primary-4)',
  'var(--mantine-color-primary-3)',
  'var(--mantine-color-primary-2)',
  'var(--mantine-color-sky-3)',
  'var(--mantine-color-gray-4)',
];

const percent = (value: number) => `${value.toFixed(value >= 10 || value === 0 ? 0 : 1)}%`;

interface BalanceSheetInsightsProps {
  data: BalanceSheetData;
}

const Legend = ({ tone, label, value }: { tone: string; label: string; value: string }) => (
  <Group gap={8} wrap="nowrap" justify="space-between">
    <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: tone, flexShrink: 0 }} />
      <Text fz="sm" c="dark.8" truncate>
        {label}
      </Text>
    </Group>
    <Text fz="sm" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
      {value}
    </Text>
  </Group>
);

/** Two pictures of the balance sheet: how the assets are financed and what they are made of. */
export const BalanceSheetInsights: React.FC<BalanceSheetInsightsProps> = ({ data }) => {
  const { t } = useTranslation('reports');
  const funding = fundingStructure(data);
  const composition = useMemo(() => composeByCategory(assetAccounts(data)), [data]);

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <Paper withBorder radius="lg" p="lg" bg="white">
        <Text fz="sm" fw={600} c="dark.9">
          {t('balanceSheet.fundingTitle')}
        </Text>
        <Text fz="xs" c="dimmed" mb="md">
          {t('balanceSheet.fundingHint')}
        </Text>

        <div
          role="img"
          aria-label={`${t('balanceSheet.liabilities')} ${percent(funding.liabilitiesShare)}, ${t('balanceSheet.equity')} ${percent(funding.equityShare)}`}
          style={{
            display: 'flex',
            height: 14,
            overflow: 'hidden',
            borderRadius: 999,
            background: 'var(--mantine-color-gray-2)',
            gap: 2,
          }}
        >
          <span style={{ width: `${funding.liabilitiesShare}%`, background: TONES[2] }} />
          <span style={{ width: `${funding.equityShare}%`, background: TONES[0] }} />
        </div>

        <Stack gap={8} mt="md">
          <Legend
            tone={TONES[2]}
            label={t('balanceSheet.liabilities')}
            value={`${formatMoney(data.totalLiabilities)} · ${percent(funding.liabilitiesShare)}`}
          />
          <Legend
            tone={TONES[0]}
            label={t('balanceSheet.equity')}
            value={`${formatMoney(data.totalEquity)} · ${percent(funding.equityShare)}`}
          />
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg" bg="white">
        <Text fz="sm" fw={600} c="dark.9">
          {t('balanceSheet.compositionTitle')}
        </Text>
        <Text fz="xs" c="dimmed" mb="md">
          {t('balanceSheet.compositionHint')}
        </Text>

        {composition.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {t('balanceSheet.noCurrentAssets')}
          </Text>
        ) : (
          <Stack gap={10}>
            {composition.map((slice, index) => (
              <Box key={slice.key}>
                <Group justify="space-between" wrap="nowrap" mb={4}>
                  <Text fz="sm" c="dark.8" truncate>
                    {slice.name || t('balanceSheet.compositionOthers')}
                  </Text>
                  <Text fz="sm" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(slice.value)} · {percent(slice.share)}
                  </Text>
                </Group>
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--mantine-color-gray-1)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${slice.share}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: slice.key === 'others' ? TONES[5] : TONES[Math.min(index, 3)],
                    }}
                  />
                </div>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </SimpleGrid>
  );
};
