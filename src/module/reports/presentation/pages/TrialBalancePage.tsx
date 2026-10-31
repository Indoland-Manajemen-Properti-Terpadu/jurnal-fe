import { Container, Paper, Stack, Flex } from '@mantine/core';
import { IconFileAnalytics } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { AppShellLayout } from '@/components/AppShellLayout';
import TrialBalanceTable from '@/module/reports/presentation/components/trial-balance/TrialBalanceTable';
import { useState } from 'react';
import FilterDate from '@/module/reports/presentation/components/shared/FilterDate';

import { useTranslation } from '@/i18n';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
const TrialBalancePage = () => {
  const { t } = useTranslation('reports');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  const handleFilterChange = (start: string | undefined, end: string | undefined) => {
    setFromDate(start);
    setToDate(end);
  };

  return (
    <AppShellLayout>
      <Container fluid>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconFileAnalytics}
            title={t('catalog.trialBalanceTitle')}
            description={t('trialBalance.description')}
          />
          <Paper {...PAPER_PROPS}>
            <Stack>
              <Flex gap="xs" justify="space-between" align="center" direction="row">
                <FilterDate onFilterChange={handleFilterChange} />
              </Flex>
              <TrialBalanceTable fromDate={fromDate!} toDate={toDate!} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default TrialBalancePage;
