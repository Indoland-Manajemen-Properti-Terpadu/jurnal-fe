import { Box, Button, Group, Stack } from '@mantine/core';
import { IconArrowsExchange, IconDownload } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { transferNewPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { BalancesTab } from '@/module/inventory/presentation/components/stock/BalancesTab';
import { HistoryTab } from '@/module/inventory/presentation/components/stock/HistoryTab';
import { StockTabList } from '@/module/inventory/presentation/components/stock/StockTabList';
import { TransfersTab } from '@/module/inventory/presentation/components/stock/TransfersTab';
import { useStockFilters } from '@/module/inventory/presentation/components/stock/useStockFilters';
import { useStockExport } from '@/module/inventory/presentation/hooks/useStockExport';
import { useStockRights } from '@/module/inventory/presentation/hooks/useStockQueries';

export default function StockMovementsPage() {
  const { t } = useTranslation('stockMovements');
  const navigate = useNavigate();
  const { values, update, today } = useStockFilters();
  const { card, transfer } = useStockRights();
  const exporter = useStockExport();

  const canExport = card.read && values.tab !== 'transfers';

  const exportCurrent = () => {
    if (values.tab === 'balances') {
      exporter.run(
        'balances',
        {
          asOf: values.asOf || undefined,
          warehouse: values.warehouse || undefined,
          categoryId: values.category || undefined,
        },
        today
      );
      return;
    }
    exporter.run(
      'movements',
      {
        startDate: values.from,
        endDate: values.to,
        warehouse: values.warehouse || undefined,
        product: values.product || undefined,
        types: values.type.split(',').filter(Boolean),
        categoryId: values.category || undefined,
        search: values.doc || undefined,
      },
      today
    );
  };

  const tabList = <StockTabList value={values.tab} onChange={(tab) => update({ tab })} />;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconArrowsExchange}
            title={t('title')}
            description={t('description')}
            actions={
              <Group gap="xs">
                {canExport && (
                  <Button
                    variant="default"
                    leftSection={<IconDownload size={16} />}
                    loading={exporter.loading}
                    onClick={exportCurrent}
                  >
                    {t('export')}
                  </Button>
                )}
                {transfer.create && (
                  <Button
                    color="primary"
                    leftSection={<IconArrowsExchange size={16} />}
                    onClick={() => navigate(transferNewPath())}
                  >
                    {t('transfer')}
                  </Button>
                )}
              </Group>
            }
          />
          {values.tab === 'balances' && (
            <BalancesTab filters={values} today={today} update={update} tabList={tabList} />
          )}
          {values.tab === 'history' && (
            <HistoryTab filters={values} today={today} update={update} tabList={tabList} />
          )}
          {values.tab === 'transfers' && (
            <TransfersTab filters={values} update={update} tabList={tabList} />
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
