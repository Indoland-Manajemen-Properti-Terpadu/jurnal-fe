import React from 'react';
import { Group, Paper, SegmentedControl, Switch, Text } from '@mantine/core';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { useTranslation } from '@/i18n';

interface ProfitLossDisplayControlsProps {
  search: string;
  onSearchChange: (search: string) => void;
  hideZero: boolean;
  onHideZeroChange: (hideZero: boolean) => void;
  mode: 'rinci' | 'ringkas';
  onModeChange: (mode: 'rinci' | 'ringkas') => void;
}

export const ProfitLossDisplayControls: React.FC<ProfitLossDisplayControlsProps> = ({
  search,
  onSearchChange,
  hideZero,
  onHideZeroChange,
  mode,
  onModeChange,
}) => {
  const { t } = useTranslation('reports');

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group align="center" wrap="wrap" gap="md" style={{ flex: 1 }}>
          <ReportSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={t('profitLoss.searchAccounts')}
          />
          <Switch
            size="sm"
            color="primary"
            checked={hideZero}
            onChange={(event) => onHideZeroChange(event.currentTarget.checked)}
            label={t('profitLoss.hideZero')}
            aria-label={t('profitLoss.hideZero')}
          />
        </Group>

        <Group gap="sm" align="center">
          <Text fz="sm" c="dimmed">
            {t('profitLoss.viewLabel')}
          </Text>
          <SegmentedControl
            size="sm"
            radius="md"
            value={mode}
            onChange={(value) => onModeChange(value as 'rinci' | 'ringkas')}
            data={[
              { label: t('profitLoss.viewDetailed'), value: 'rinci' },
              { label: t('profitLoss.viewSummary'), value: 'ringkas' },
            ]}
            aria-label={t('profitLoss.viewLabel')}
          />
        </Group>
      </Group>
    </Paper>
  );
};
