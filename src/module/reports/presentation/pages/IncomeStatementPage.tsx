import { Container, Paper, Stack, Flex, Notification } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import AppShellLayout from '@/components/AppShellLayout';
import IncomeStatementTable from '@/module/reports/presentation/components/income-statement/IncomeStatementTable';
import { useState } from 'react';
import FilterDate from '@/module/reports/presentation/components/shared/FilterDate';
import ExportMenu from '@/module/reports/presentation/components/shared/ExportMenu';
import { REPORT_EXPORT_ENDPOINTS } from '@/module/reports/infrastructure/reportEndpoints';
import { exportReport } from '@/module/reports/infrastructure/exportReport';

import { useTranslation } from '@/i18n';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
const IncomeStatementPage = () => {
  const { t } = useTranslation('reports');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  const handleFilterChange = (start: string | undefined, end: string | undefined) => {
    setFromDate(start);
    setToDate(end);
  };

  const handleExport = async (type: 'pdf' | 'csv' | 'xlsx') => {
    if (!fromDate || !toDate) {
      <Notification color="red" title={t('common.periodRequiredTitle')}>
        {t('common.periodRequiredMessage')}
      </Notification>;
      return;
    }
    try {
      await exportReport({
        url: `${REPORT_EXPORT_ENDPOINTS.INCOME_STATEMENT}`,
        fromDate,
        toDate,
        type,
        filenamePrefix: 'IncomeStatement',
        errorNoData: t('common.exportNoData'),
        errorExportFailed: t('common.exportBalanceSheetFailed'),
      });
    } catch (error) {
      alert(t('common.exportRetry'));
    }
  };

  return (
    <AppShellLayout>
      <Container fluid>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconChartBar}
            title={t('catalog.incomeStatementTitle')}
            description={t('incomeStatement.description')}
          />
          <Paper {...PAPER_PROPS}>
            <Stack>
              <Flex gap="xs" justify="space-between" align="center" direction="row">
                <FilterDate onFilterChange={handleFilterChange} />
                <ExportMenu
                  onExportPDF={() => handleExport('pdf')}
                  onExportCSV={() => handleExport('csv')}
                  onExportXLSX={() => handleExport('xlsx')}
                />
              </Flex>
              <IncomeStatementTable fromDate={fromDate} toDate={toDate} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default IncomeStatementPage;
