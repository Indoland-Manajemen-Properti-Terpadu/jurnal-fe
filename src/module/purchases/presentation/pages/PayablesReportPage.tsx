import { useState } from 'react';
import { ActionIcon, Button, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconReportAnalytics, IconRefresh } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { downloadPayablesExcel } from '@/module/purchases/infrastructure/purchaseApi';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { PayablesKpis } from '@/module/purchases/presentation/components/reports/PayablesKpis';
import { PayableBillsTable } from '@/module/purchases/presentation/components/reports/PayableBillsTable';
import { PayablesTable } from '@/module/purchases/presentation/components/reports/PayablesTable';
import { usePayablesReport } from '@/module/purchases/presentation/components/reports/usePayablesReport';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { formatDay, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { routes } from '@/router/routes';

export default function PayablesReportPage() {
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const [asOf] = useState(todayIso);
  const [searchParams, setSearchParams] = useSearchParams();
  const vendor = searchParams.get('vendor');
  const [exporting, setExporting] = useState(false);
  const allowed = can(PURCHASE_MENU.reports, 'read');
  const report = usePayablesReport({ asOf, vendor: vendor ?? undefined }, allowed);

  if (accessLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!allowed) {
    return <StateFrame kind="noAccess" backTo={routes.purchases.main} />;
  }

  const exportExcel = async () => {
    setExporting(true);
    try {
      saveBlob(
        await downloadPayablesExcel({ asOf, vendor: vendor ?? undefined }),
        `hutang-per-vendor-${asOf}.xlsx`
      );
    } catch {
      notifications.show({ color: 'orange', message: t('reports.exportFailed') });
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageFrame
      icon={IconReportAnalytics}
      title={t('reports.title')}
      description={t('reports.subtitleAsOf', { date: formatDay(asOf, currentLanguage) })}
      backTo={routes.purchases.main}
      backLabel={t('reports.backToHub')}
      backOutside
      actions={
        <Group gap="sm">
          <Tooltip label={t('reports.refresh')}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label={t('reports.refresh')}
              loading={report.isFetching}
              onClick={() => {
                report.refetch();
              }}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            variant="default"
            radius="md"
            leftSection={<IconDownload size={16} />}
            loading={exporting}
            onClick={() => {
              exportExcel();
            }}
          >
            {t('reports.export')}
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <SupplierSelect
          clearable
          label={t('reports.vendor')}
          placeholder={t('reports.allVendors')}
          value={vendor}
          onChange={(id) => setSearchParams(id ? { vendor: id } : {})}
          w={{ base: '100%', sm: 300 }}
        />
        {report.data && <PayablesKpis data={report.data} />}

        <Paper withBorder radius="lg" p="md" bg="white">
          <Stack gap="md">
            <Text fw={700}>{t('reports.perVendor')}</Text>
            <PayablesTable
              data={report.data}
              isLoading={report.isLoading}
              isError={report.isError}
              onRetry={() => {
                report.refetch();
              }}
            />
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p="md" bg="white">
          <Stack gap="md">
            <Text fw={700}>{t('reports.billDetail')}</Text>
            <PayableBillsTable
              data={report.data}
              isLoading={report.isLoading}
              isError={report.isError}
              onRetry={() => {
                report.refetch();
              }}
              canReadBills={can(PURCHASE_MENU.documents, 'read')}
            />
          </Stack>
        </Paper>
      </Stack>
    </PageFrame>
  );
}
