import { useState } from 'react';
import { Box, SegmentedControl, Stack } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { AdvancesByUserReport } from '@/module/petty-cash/presentation/components/reports/AdvancesByUserReport';
import { AuditLogReport } from '@/module/petty-cash/presentation/components/reports/AuditLogReport';
import { ExpenseSummaryReport } from '@/module/petty-cash/presentation/components/reports/ExpenseSummaryReport';
import { PendingVouchersReport } from '@/module/petty-cash/presentation/components/reports/PendingVouchersReport';
import { PeriodEndReport } from '@/module/petty-cash/presentation/components/reports/PeriodEndReport';
import { ReconciliationReport } from '@/module/petty-cash/presentation/components/reports/ReconciliationReport';

const SECTIONS = [
  'pending',
  'expense',
  'advances',
  'reconciliation',
  'periodEnd',
  'audit',
] as const;
type Section = (typeof SECTIONS)[number];

export function ReportsPanel({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [section, setSection] = useState<Section>('pending');

  return (
    <Stack gap="md">
      <Box style={{ overflowX: 'auto' }}>
        <SegmentedControl
          aria-label={t('workspace.tabs.reports')}
          value={section}
          onChange={(value) => setSection(value as Section)}
          data={SECTIONS.map((value) => ({ value, label: t(`reports.sections.${value}`) }))}
        />
      </Box>
      {section === 'pending' && <PendingVouchersReport fundId={fundId} />}
      {section === 'expense' && <ExpenseSummaryReport fundId={fundId} />}
      {section === 'advances' && <AdvancesByUserReport fundId={fundId} />}
      {section === 'reconciliation' && <ReconciliationReport />}
      {section === 'periodEnd' && <PeriodEndReport />}
      {section === 'audit' && <AuditLogReport />}
    </Stack>
  );
}
