import { Button, Group, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { SalePaymentResult } from '@/module/sales/domain/sale';
import { formatIDR } from '@/module/sales/domain/saleFormat';

type PaymentResultViewProps = {
  result: SalePaymentResult;
  /** Names of the invoice lines by id, for rows the server returns without a product name. */
  lineNames: Record<string, string>;
  onClose: () => void;
};

/** After an automatic allocation: where the server placed the money. */
export function PaymentResultView({
  result,
  lineNames,
  onClose,
}: Readonly<PaymentResultViewProps>) {
  const { t } = useTranslation('sales');
  return (
    <Stack gap="md">
      <div>
        <Text fw={700}>{t('pay.resultTitle')}</Text>
        <Text size="sm" c="dimmed">
          {t('pay.resultHint')}
        </Text>
      </div>
      <Table verticalSpacing="xs" withRowBorders>
        <Table.Tbody>
          {result.items.map((item, index) => (
            <Table.Tr key={item.saleItem ?? index}>
              <Table.Td>
                {item.productName || (item.saleItem && lineNames[item.saleItem]) || '—'}
              </Table.Td>
              <Table.Td ta="right">{formatIDR(item.amount)}</Table.Td>
            </Table.Tr>
          ))}
          {result.lateFeeAmount > 0 && (
            <Table.Tr>
              <Table.Td>{t('pay.lateFee')}</Table.Td>
              <Table.Td ta="right">{formatIDR(result.lateFeeAmount)}</Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <Group justify="flex-end">
        <Button onClick={onClose}>{t('pay.done')}</Button>
      </Group>
    </Stack>
  );
}

export default PaymentResultView;
