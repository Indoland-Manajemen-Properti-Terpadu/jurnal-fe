import React from 'react';
import { Group, SegmentedControl, Switch, Text } from '@mantine/core';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { useTranslation } from '@/i18n';

interface TrialBalanceDisplayControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  hideZero: boolean;
  onHideZeroChange: (value: boolean) => void;
  mode: 'rinci' | 'ringkas';
  onModeChange: (value: 'rinci' | 'ringkas') => void;
}

export const TrialBalanceDisplayControls: React.FC<TrialBalanceDisplayControlsProps> = ({
  search,
  onSearchChange,
  hideZero,
  onHideZeroChange,
  mode,
  onModeChange,
}) => {
  const { t } = useTranslation('reports');

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
      <ReportSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t('trialBalance.searchAccounts')}
      />
      <Group gap="md" wrap="wrap">
        <Switch
          checked={hideZero}
          onChange={(event) => onHideZeroChange(event.currentTarget.checked)}
          label={t('trialBalance.hideZeroBalances')}
          size="sm"
        />
        <Group gap="xs" align="center" wrap="nowrap">
          <Text fz="sm" c="dimmed">
            {t('trialBalance.displayMode')}
          </Text>
          <SegmentedControl
            value={mode}
            onChange={(value) => onModeChange(value as 'rinci' | 'ringkas')}
            aria-label={t('trialBalance.displayMode')}
            data={[
              { value: 'rinci', label: t('trialBalance.modeDetailed') },
              { value: 'ringkas', label: t('trialBalance.modeSummary') },
            ]}
          />
        </Group>
      </Group>
    </Group>
  );
};
