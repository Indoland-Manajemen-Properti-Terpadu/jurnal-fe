import React from 'react';
import { ActionIcon, Group, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import type {
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';

import { useTranslation } from '@/i18n';

interface BalanceSheetFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: BalanceSheetQueryParams;
  onDraftPeriodChange: (period: BalanceSheetQueryParams) => void;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onExport: (type: BalanceSheetExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const BalanceSheetFilterBar: React.FC<BalanceSheetFilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  ...toolbar
}) => {
  const { t } = useTranslation('reports');

  return (
    <ReportToolbar
      {...toolbar}
      endDateLabel={t('balanceSheet.asOfDate')}
      extra={
        <Group gap="sm" align="flex-end" wrap="wrap">
          <TextInput
            placeholder={t('balanceSheet.searchAccounts')}
            aria-label={t('balanceSheet.searchAccounts')}
            radius="md"
            leftSection={<IconSearch size={15} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  aria-label={t('common.resetSearch')}
                  onClick={() => onSearchQueryChange('')}
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
            w={{ base: '100%', xs: 220 }}
          />
        </Group>
      }
    />
  );
};
