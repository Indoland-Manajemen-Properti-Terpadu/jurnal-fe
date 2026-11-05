import { useState } from 'react';
import { ActionIcon, Button, Group, Paper, Stack, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconReportAnalytics, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { downloadPayablesExcel } from '@/module/purchases/infrastructure/purchaseApi';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { AgingChart } from '@/module/purchases/presentation/components/reports/AgingChart';
import { PayablesKpis } from '@/module/purchases/presentation/components/reports/PayablesKpis';
import { PayablesTable } from '@/module/purchases/presentation/components/reports/PayablesTable';
import { VendorCreditCard } from '@/module/purchases/presentation/components/reports/VendorCreditCard';
import { usePayablesReport } from '@/module/purchases/presentation/components/reports/usePayablesReport';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { routes } from '@/router/routes';

export default function PayablesReportPage() {
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const [asOf, setAsOf] = useState(todayIso);
  const [vendor, setVendor] = useState<string | null>(null);
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
      description={t('reports.subtitle')}
      backTo={routes.purchases.main}
      backLabel={t('reports.backToHub')}
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
        {report.data && (
          <>
            <PayablesKpis data={report.data} />
            <AgingChart totals={report.data.totals} />
          </>
        )}

        <Paper withBorder radius="lg" p="md" bg="white">
          <Stack gap="md">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <DateField
                label={t('reports.asOf')}
                value={asOf}
                onChange={(value) => setAsOf(value || todayIso())}
                w={200}
              />
              <SupplierSelect
                clearable
                label={t('reports.vendor')}
                placeholder={t('reports.allVendors')}
                value={vendor}
                onChange={(id) => setVendor(id)}
                w={300}
              />
            </Group>
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

        {vendor && <VendorCreditCard vendorId={vendor} />}
      </Stack>
    </PageFrame>
  );
}
