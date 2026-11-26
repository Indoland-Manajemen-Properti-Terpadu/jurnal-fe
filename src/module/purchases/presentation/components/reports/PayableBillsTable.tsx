import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Badge, Paper, Skeleton, Table, Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { daysLate } from '@/module/purchases/domain/payablesView';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { NumberCell, PartyCell } from '@/module/purchases/presentation/components/lists/cells';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { useBills } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

const COLUMNS = 5;

const Head = ({ label, right }: { label: string; right?: boolean }) => (
  <Table.Th ta={right ? 'right' : undefined} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

interface PayableBillsTableProps {
  asOf: string;
  vendor?: string;
  enabled: boolean;
}

/** The open bills behind the totals above: which invoice, whose, when due, how late, what is left. */
export const PayableBillsTable = ({ asOf, vendor, enabled }: Readonly<PayableBillsTableProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  // The service filters by one display status at a time, so owed and late bills are two calls.
  const owed = useBills({ displayStatus: 'UNPAID', vendor, limit: 100 }, enabled);
  const late = useBills({ displayStatus: 'OVERDUE', vendor, limit: 100 }, enabled);
  const query = { isLoading: owed.isLoading || late.isLoading };
  const rows: PurchaseBill[] = [...(late.data?.items ?? []), ...(owed.data?.items ?? [])]
    .filter((bill) => bill.remainingAmount > 0)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));

  const body = () => {
    if (query.isLoading) {
      return Array.from({ length: 4 }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMNS}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (rows.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMNS} p={0}>
            <EmptyState
              icon={<IconCircleCheck size={32} stroke={1.6} />}
              title={t('reports.emptyTitle')}
              description={t('reports.emptyDescription')}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return rows.map((bill) => {
      const lateDays = daysLate(bill.dueDate, asOf);
      return (
        <Table.Tr key={bill.id}>
          <NumberCell
            kind="bill"
            id={bill.id}
            number={bill.number}
            sub={bill.vendorInvoiceNumber || undefined}
          />
          <PartyCell name={bill.vendor.name} />
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            <Text size="sm">{formatDay(bill.dueDate, currentLanguage)}</Text>
          </Table.Td>
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            <Badge
              variant="light"
              color={lateDays > 0 ? 'red' : 'green'}
              radius="sm"
              size="sm"
              tt="none"
            >
              {lateDays > 0
                ? t('reports.bills.late', { count: lateDays })
                : t('reports.bills.notDue')}
            </Badge>
          </Table.Td>
          <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            <Text size="sm" fw={700}>
              {formatAmount(bill.remainingAmount)}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    });
  };

  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer type="native" minWidth={760}>
        <Table
          className={tableClasses.table}
          verticalSpacing="sm"
          horizontalSpacing="md"
          highlightOnHover
        >
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Head label={t('reports.bills.col.bill')} />
              <Head label={t('reports.col.vendor')} />
              <Head label={t('reports.bills.col.due')} />
              <Head label={t('reports.bills.col.age')} />
              <Head right label={t('reports.col.remaining')} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{body()}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
