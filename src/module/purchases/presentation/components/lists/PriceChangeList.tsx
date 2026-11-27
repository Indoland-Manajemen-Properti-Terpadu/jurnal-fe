import { Anchor, Badge, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import { useTranslation } from '@/i18n';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface PriceChangeListProps {
  requests: PriceChangeRequest[];
  canDecide: boolean;
  busy?: boolean;
  onApprove: (request: PriceChangeRequest, note?: string) => void;
  onReject: (request: PriceChangeRequest, reason: string) => void;
}

export const PriceChangeList = ({
  requests,
  canDecide,
  busy,
  onApprove,
  onReject,
}: Readonly<PriceChangeListProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Stack gap="md">
      {requests.map((request) => {
        const activeStage =
          request.pending.find((stage) => stage.level === request.approvalStage) ??
          request.pending[0];
        const stageName = activeStage?.name ?? request.plan[request.approvalStage ?? 0]?.name;
        const requestCanDecide =
          canDecide &&
          request.status === 'PENDING_APPROVAL' &&
          request.canDecide &&
          request.approvalStage !== null;
        return (
          <Paper key={request.id} withBorder radius="lg" p="lg">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Group gap="xs" align="center">
                  <IconTag size={18} aria-hidden />
                  <Anchor
                    component={Link}
                    fw={700}
                    to={routes.purchases.orderDetail.replace(':id', request.purchaseOrderId)}
                  >
                    {request.purchaseOrderNumber || t('bills.priceChange.orderLink')}
                  </Anchor>
                </Group>
                <Badge color={requestCanDecide ? 'orange' : 'gray'} variant="light">
                  {requestCanDecide
                    ? t('bills.priceChange.queueCanDecide')
                    : t('bills.priceChange.queueWaiting')}
                </Badge>
              </Group>

              <Text size="sm">{request.reason}</Text>
              <Group gap="lg" wrap="wrap">
                {request.vendorInvoiceNumber && (
                  <Text size="sm" c="dimmed">
                    {t('bills.priceChange.invoiceNumber')}: {request.vendorInvoiceNumber}
                  </Text>
                )}
                {request.vendorInvoiceTotal !== null && (
                  <Text size="sm" c="dimmed">
                    {t('bills.priceChange.invoiceTotal')}:{' '}
                    {formatAmount(request.vendorInvoiceTotal)}
                  </Text>
                )}
                {stageName && (
                  <Text size="sm" c="dimmed">
                    {t('bills.priceChange.queueStage')}: {stageName}
                  </Text>
                )}
              </Group>

              <Table.ScrollContainer minWidth={480} type="native">
                <Table verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('bills.priceChange.item')}</Table.Th>
                      <Table.Th ta="right">{t('bills.priceChange.oldPrice')}</Table.Th>
                      <Table.Th ta="right">{t('bills.priceChange.newPrice')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {request.items.map((item) => (
                      <Table.Tr key={item.purchaseOrderItemId}>
                        <Table.Td>{item.description || item.purchaseOrderItemId}</Table.Td>
                        <Table.Td ta="right">{formatAmount(item.oldUnitPrice)}</Table.Td>
                        <Table.Td ta="right" fw={600}>
                          {formatAmount(item.newUnitPrice)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              <ApprovalPanel
                approval={request}
                status={request.status}
                canApprove={requestCanDecide}
                busy={busy}
                rejectMinLength={1}
                rejectMaxLength={2_000}
                onApprove={(note) => onApprove(request, note)}
                onReject={(reason) => onReject(request, reason)}
                bare
                actionsOnly
              />
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};
