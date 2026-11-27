import { Stack, Table, Text } from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import { useTranslation } from '@/i18n';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface PriceChangeApprovalCardProps {
  request: PriceChangeRequest | null;
  canApprove: boolean;
  busy?: boolean;
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
}

export const PriceChangeApprovalCard = ({
  request,
  canApprove,
  busy,
  onApprove,
  onReject,
}: Readonly<PriceChangeApprovalCardProps>) => {
  const { t } = useTranslation('purchases');
  if (!request) return null;

  const canDecide =
    canApprove &&
    request.status === 'PENDING_APPROVAL' &&
    request.canDecide &&
    request.approvalStage !== null;

  return (
    <SectionCard
      icon={IconTag}
      title={t('bills.priceChange.pendingTitle')}
      subtitle={request.purchaseOrderNumber}
    >
      <Stack gap="sm">
        <Text size="sm">{request.reason}</Text>
        {(request.vendorInvoiceNumber || request.vendorInvoiceTotal !== null) && (
          <Text size="sm" c="dimmed">
            {t('bills.priceChange.invoiceContext', {
              number: request.vendorInvoiceNumber || '—',
              total:
                request.vendorInvoiceTotal === null
                  ? '—'
                  : formatAmount(request.vendorInvoiceTotal),
            })}
          </Text>
        )}
        <Table.ScrollContainer minWidth={440} type="native">
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
          canApprove={canDecide}
          busy={busy}
          rejectMinLength={1}
          rejectMaxLength={2_000}
          onApprove={onApprove}
          onReject={onReject}
          bare
        />
      </Stack>
    </SectionCard>
  );
};
