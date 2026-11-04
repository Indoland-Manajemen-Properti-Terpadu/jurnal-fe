import { useState } from 'react';
import { Box, Grid, NavLink, Select, Stack } from '@mantine/core';
import {
  IconChartBar,
  IconClockHour4,
  IconHistory,
  IconListCheck,
  IconScale,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AdvancesByUserReport } from '@/module/petty-cash/presentation/components/reports/AdvancesByUserReport';
import { AuditLogReport } from '@/module/petty-cash/presentation/components/reports/AuditLogReport';
import { ExpenseSummaryReport } from '@/module/petty-cash/presentation/components/reports/ExpenseSummaryReport';
import { PendingVouchersReport } from '@/module/petty-cash/presentation/components/reports/PendingVouchersReport';
import { PeriodEndReport } from '@/module/petty-cash/presentation/components/reports/PeriodEndReport';
import { ReconciliationReport } from '@/module/petty-cash/presentation/components/reports/ReconciliationReport';

const SECTIONS: Array<{ value: Section; icon: Icon }> = [
  { value: 'pending', icon: IconClockHour4 },
  { value: 'expense', icon: IconChartBar },
  { value: 'advances', icon: IconUsers },
  { value: 'reconciliation', icon: IconScale },
  { value: 'periodEnd', icon: IconListCheck },
  { value: 'audit', icon: IconHistory },
];
type Section = 'pending' | 'expense' | 'advances' | 'reconciliation' | 'periodEnd' | 'audit';

/** Report picker beside the report on a wide screen, a select above it on a narrow one. */
export function ReportsPanel({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [section, setSection] = useState<Section>('pending');

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Select
          hiddenFrom="md"
          aria-label={t('workspace.tabs.reports')}
          data={SECTIONS.map(({ value }) => ({ value, label: t(`reports.sections.${value}`) }))}
          value={section}
          onChange={(value) => value && setSection(value as Section)}
          allowDeselect={false}
        />
        <Box visibleFrom="md" component="nav" aria-label={t('workspace.tabs.reports')}>
          <Stack gap={2}>
            {SECTIONS.map(({ value, icon: SectionIcon }) => (
              <NavLink
                key={value}
                label={t(`reports.sections.${value}`)}
                leftSection={<SectionIcon size={16} />}
                active={section === value}
                onClick={() => setSection(value)}
                variant="light"
                color="primary"
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
                aria-current={section === value ? 'page' : undefined}
              />
            ))}
          </Stack>
        </Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        {section === 'pending' && <PendingVouchersReport fundId={fundId} />}
        {section === 'expense' && <ExpenseSummaryReport fundId={fundId} />}
        {section === 'advances' && <AdvancesByUserReport fundId={fundId} />}
        {section === 'reconciliation' && <ReconciliationReport />}
        {section === 'periodEnd' && <PeriodEndReport />}
        {section === 'audit' && <AuditLogReport />}
      </Grid.Col>
    </Grid>
  );
}
