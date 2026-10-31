import {
  Container,
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Select,
  Button,
  Flex,
  Notification,
} from '@mantine/core';
import { IconArrowsExchange } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconChevronDown, IconFileExport, IconX } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import AppShellLayout from '@/components/AppShellLayout';
import EquityChangesTable from '@/module/reports/presentation/components/equity-changes/EquityChangesTable';
import { useState } from 'react';
import { exportReport } from '@/module/reports/infrastructure/exportReport';
import { REPORT_EXPORT_ENDPOINTS } from '@/module/reports/infrastructure/reportEndpoints';
import ExportMenu from '@/module/reports/presentation/components/shared/ExportMenu';
import FilterDate from '@/module/reports/presentation/components/shared/FilterDate';

import { useTranslation } from '@/i18n';
const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
const EquityChangesPage = () => {
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
        url: `${REPORT_EXPORT_ENDPOINTS.EQUITY_CHANGE}`,
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
            icon={IconArrowsExchange}
            title={t('catalog.equityTitle')}
            description={t('equityChanges.description')}
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
              <EquityChangesTable fromDate={fromDate} toDate={toDate} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default EquityChangesPage;
