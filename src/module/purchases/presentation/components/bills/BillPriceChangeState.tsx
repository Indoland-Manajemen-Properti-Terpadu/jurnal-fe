import { Alert, Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { BillPriceChangeGate } from '@/module/purchases/domain/billPriceChangeGate';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import { useTranslation } from '@/i18n';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface BillPriceChangeStateProps {
  sourceIsManual: boolean;
  gate: BillPriceChangeGate;
  orderId?: string;
  orderNumber: string;
  vendorInvoiceTotal: number | '';
  previewTotal: number | null | undefined;
  previewReady: boolean;
  previewLoading: boolean;
  previewError: boolean;
  refreshLoading: boolean;
  pendingRequest?: PriceChangeRequest | null;
  requestDisabled: boolean;
  onRequest: () => void;
  onRefresh: () => void;
}

export const BillPriceChangeState = ({
  sourceIsManual,
  gate,
  orderId,
  orderNumber,
  vendorInvoiceTotal,
  previewTotal,
  previewReady,
  previewLoading,
  previewError,
  refreshLoading,
  pendingRequest,
  requestDisabled,
  onRequest,
  onRefresh,
}: Readonly<BillPriceChangeStateProps>) => {
  const { t } = useTranslation('purchases');
  if (sourceIsManual) return null;

  const refresh = (
    <Button
      variant="light"
      size="xs"
      leftSection={<IconRefresh size={14} />}
      loading={refreshLoading}
      onClick={onRefresh}
    >
      {t('bills.priceChange.refresh')}
    </Button>
  );

  if (gate.priceChangePending) {
    const stageIndex = pendingRequest?.approvalStage ?? 0;
    const approver =
      pendingRequest?.pending[0]?.name ??
      pendingRequest?.plan[stageIndex]?.name ??
      t('bills.priceChange.pendingGeneric');
    const number = pendingRequest?.purchaseOrderNumber || orderNumber;
    return (
      <Alert
        color="yellow"
        variant="light"
        icon={<IconAlertTriangle size={18} />}
        title={t('bills.priceChange.pendingTitle')}
      >
        <Stack gap="xs">
          <Text size="sm">
            {t('bills.priceChange.pendingBody', { orderNumber: number, approver })}
          </Text>
          <Group justify="space-between" wrap="wrap">
            {orderId && (
              <Anchor component={Link} to={routes.purchases.orderDetail.replace(':id', orderId)}>
                {number || t('bills.priceChange.orderLink')}
              </Anchor>
            )}
            {refresh}
          </Group>
        </Stack>
      </Alert>
    );
  }

  if (previewError) {
    return (
      <Alert color="red" variant="light" title={t('bills.priceChange.previewError')}>
        {refresh}
      </Alert>
    );
  }

  if (previewLoading || !previewReady) {
    return (
      <Alert color="gray" variant="light" title={t('bills.priceChange.previewLoading')}>
        {refresh}
      </Alert>
    );
  }

  if (gate.comparisonUnknown) {
    return (
      <Alert color="yellow" variant="light" title={t('bills.priceChange.unknownTitle')}>
        <Stack gap="xs">
          <Text size="sm">{t('bills.priceChange.unknownBody')}</Text>
          {refresh}
        </Stack>
      </Alert>
    );
  }

  if (gate.splitOrders) {
    return (
      <Alert color="yellow" variant="light" title={t('bills.priceChange.splitTitle')}>
        {t('bills.priceChange.splitBody')}
      </Alert>
    );
  }

  if (gate.comparison !== false) return null;

  return (
    <Alert color="red" variant="light" title={t('bills.priceChange.mismatchTitle')}>
      <Stack gap="sm">
        <Text size="sm">
          {t('bills.priceChange.mismatchBody', {
            vendor: vendorInvoiceTotal === '' ? '—' : formatAmount(vendorInvoiceTotal),
            system:
              previewTotal === null || previewTotal === undefined
                ? '—'
                : formatAmount(previewTotal),
          })}
        </Text>
        <Group justify="space-between" wrap="wrap">
          {orderId && (
            <Anchor component={Link} to={routes.purchases.orderDetail.replace(':id', orderId)}>
              {orderNumber || t('bills.priceChange.orderLink')}
            </Anchor>
          )}
          <Button disabled={requestDisabled} onClick={onRequest}>
            {t('bills.priceChange.request')}
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
};
