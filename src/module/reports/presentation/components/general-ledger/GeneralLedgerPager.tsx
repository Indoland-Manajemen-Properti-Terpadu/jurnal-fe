import React from 'react';
import { Group, Pagination, Text } from '@mantine/core';
import type { GeneralLedgerPagination } from '@/module/reports/domain/generalLedger.types';
import { formatCount } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

interface GeneralLedgerPagerProps {
  pagination: GeneralLedgerPagination;
  onChange: (page: number) => void;
  disabled?: boolean;
}

/** Page switch for the accounts of the ledger (the server sends them in pages). */
export const GeneralLedgerPager: React.FC<GeneralLedgerPagerProps> = ({
  pagination,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('reports');
  const from = (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.totalAccounts);

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="xs">
      <Text fz="xs" c="dimmed">
        {t('generalLedger.pagerSummary', {
          from: formatCount(from),
          to: formatCount(to),
          total: formatCount(pagination.totalAccounts),
        })}
      </Text>
      {pagination.totalPages > 1 && (
        <Pagination
          size="sm"
          radius="md"
          color="primary"
          total={pagination.totalPages}
          value={pagination.page}
          onChange={onChange}
          disabled={disabled}
          siblings={0}
        />
      )}
    </Group>
  );
};
