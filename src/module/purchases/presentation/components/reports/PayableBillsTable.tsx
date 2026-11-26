import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Badge, Paper, Skeleton, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface PayableBillsTableProps {
  data: PayablesAging | undefined;
  isLoading: boolean;
  isError: boolean;
  canReadBills: boolean;
  onRetry: () => void;
}

/** Invoice details supplied by the same report response as the vendor totals. */
export const PayableBillsTable = ({
  data,
  isLoading,
  isError,
  canReadBills,
  onRetry,
}: Readonly<PayableBillsTableProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const rows = data?.invoices ?? [];

  const body = () => {
    if (isLoading) {
      return Array.from({ length: 4 }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={5}>
            <Skeleton height={16} />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (isError) {
      return (
        <Table.Tr>
          <Table.Td colSpan={5} p={0}>
            <EmptyState
              icon={<IconAlertCircle size={32} stroke={1.6} />}
              color="red"
              title={t('list.errorTitle')}
              description={t('list.errorDescription')}
              actionLabel={t('common.retry')}
              onAction={onRetry}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    if (rows.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={5} p={0}>
            <EmptyState
              icon={<IconCircleCheck size={32} stroke={1.6} />}
              title={t('reports.emptyTitle')}
              description={t('reports.emptyDescription')}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return rows.map((invoice) => (
      <Table.Tr key={invoice.id}>
        <Table.Td>
          {canReadBills ? (
            <Link to={routes.purchases.billDetail.replace(':id', invoice.id)}>
              {invoice.transactionNumber}
            </Link>
          ) : (
            <Text size="sm" fw={600}>
              {invoice.transactionNumber}
            </Text>
          )}
          {invoice.vendorInvoiceNumber && (
            <Text size="xs" c="dimmed">
              {invoice.vendorInvoiceNumber}
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm">{invoice.vendorName}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatDay(invoice.dueDate, currentLanguage)}</Text>
        </Table.Td>
        <Table.Td>
          <Badge
            variant="light"
            color={invoice.daysOverdue > 0 ? 'red' : 'green'}
            radius="sm"
            tt="none"
          >
            {invoice.daysOverdue > 0
              ? t('reports.bills.late', { count: invoice.daysOverdue })
              : t('reports.bills.notDue')}
          </Badge>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" fw={700}>
            {formatAmount(invoice.remainingAmount, data?.precision)}
          </Text>
        </Table.Td>
      </Table.Tr>
    ));
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
              <Table.Th>{t('reports.bills.col.bill')}</Table.Th>
              <Table.Th>{t('reports.col.vendor')}</Table.Th>
              <Table.Th>{t('reports.bills.col.due')}</Table.Th>
              <Table.Th>{t('reports.bills.col.age')}</Table.Th>
              <Table.Th ta="right">{t('reports.col.remaining')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{body()}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
