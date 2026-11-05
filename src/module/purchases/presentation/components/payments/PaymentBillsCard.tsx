import { Anchor, Table, Text } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PaymentLine } from '@/module/purchases/domain/purchaseDocuments';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { useBill } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BillRow = ({ line }: Readonly<{ line: PaymentLine }>) => {
  const { t } = useTranslation('purchases');
  const bill = useBill(line.billId);
  return (
    <Table.Tr>
      <Table.Td>
        <Anchor
          component={Link}
          to={routes.purchases.billDetail.replace(':id', line.billId)}
          size="sm"
          fw={500}
        >
          {bill.data?.number ?? t('journey.bill')}
        </Anchor>
        {bill.data?.vendorInvoiceNumber && (
          <Text size="xs" c="dimmed">
            {bill.data.vendorInvoiceNumber}
          </Text>
        )}
      </Table.Td>
      <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
        <Text size="sm" fw={500}>
          {formatAmount(line.amount)}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
};

/** The bills this voucher settles and how much goes to each. */
export const PaymentBillsCard = ({ lines }: Readonly<{ lines: PaymentLine[] }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconListDetails}
      title={t('payments.detail.billsTitle')}
      subtitle={t('payments.detail.billsSubtitle')}
    >
      <Table verticalSpacing="sm" horizontalSpacing="sm">
        <Table.Thead bg="var(--jurnal-color-surface-hover)">
          <Table.Tr>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {t('payments.detail.col.bill')}
              </Text>
            </Table.Th>
            <Table.Th ta="right">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {t('payments.detail.col.amount')}
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => (
            <BillRow key={line.billId} line={line} />
          ))}
        </Table.Tbody>
      </Table>
    </SectionCard>
  );
};
