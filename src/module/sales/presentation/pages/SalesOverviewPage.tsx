import { Alert, Box, Button, Skeleton, Stack } from '@mantine/core';
import { IconAlertTriangle, IconChartBar, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  SalesOverviewAging,
  SalesOverviewCredit,
  SalesOverviewCustomers,
} from '../components/overview/SalesOverviewDataCards';
import {
  SalesOverviewMonthly,
  SalesOverviewQuotes,
} from '../components/overview/SalesOverviewTrends';
import {
  SalesOverviewHighlights,
  SalesOverviewReceivables,
  SalesOverviewWorkflow,
} from '../components/overview/SalesOverviewSummary';
import { SalesOverviewTasks } from '../components/overview/SalesOverviewTasks';
import { useSalesOverview } from '../hooks/useSaleQueries';
import classes from '../components/overview/SalesOverview.module.css';

export default function SalesOverviewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('sales');
  const query = useSalesOverview();
  const retry = () => {
    query.refetch();
  };

  const scrollToActions = () => {
    document.getElementById('sales-overview-actions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const errorNotice = (
    <Alert
      color="red"
      variant="light"
      icon={<IconAlertTriangle size={20} />}
      title={t('overview.page.errorTitle')}
    >
      <Stack align="flex-start" gap="sm">
        {t('overview.page.errorDescription')}
        <Button size="sm" variant="default" loading={query.isFetching} onClick={retry}>
          {t('overview.page.retry')}
        </Button>
      </Stack>
    </Alert>
  );

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'lg' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconChartBar}
            title={t('overview.page.title')}
            description={t('overview.page.description')}
            actions={
              <Button
                color="primary"
                leftSection={<IconPlus size={18} />}
                onClick={() => navigate(routes.sales.add)}
              >
                {t('overview.page.create')}
              </Button>
            }
          />

          {query.isLoading ? (
            <Stack gap="lg">
              <Skeleton height={230} radius="lg" />
              <Skeleton height={190} radius="lg" />
              <Skeleton height={160} radius="lg" />
              <Skeleton height={290} radius="lg" />
            </Stack>
          ) : !query.data ? (
            errorNotice
          ) : (
            <Stack gap="lg">
              {query.isError && errorNotice}
              <div className={classes.summaryGrid}>
                <SalesOverviewReceivables data={query.data} />
                <SalesOverviewHighlights data={query.data} onShowActions={scrollToActions} />
              </div>
              <SalesOverviewWorkflow data={query.data} />
              <div className={classes.dashboardGrid}>
                <SalesOverviewTasks data={query.data} />
                <Stack gap="md" className={classes.dashboardAside}>
                  <SalesOverviewAging data={query.data} />
                  <SalesOverviewCustomers data={query.data} />
                  <SalesOverviewCredit data={query.data} />
                  <SalesOverviewMonthly data={query.data} />
                  <SalesOverviewQuotes data={query.data} />
                </Stack>
              </div>
            </Stack>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
