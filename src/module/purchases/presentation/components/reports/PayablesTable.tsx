import { Group, Paper, Skeleton, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { AGING_BUCKETS } from '@/module/purchases/domain/payablesView';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { AGING_COLOR, SegmentBar } from '@/module/purchases/presentation/components/shared/visuals';

interface PayablesTableProps {
  data: PayablesAging | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const COLUMNS = 2 + AGING_BUCKETS.length;

const Head = ({ label, right }: { label: string; right?: boolean }) => (
  <Table.Th ta={right ? 'right' : undefined} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

const Amount = ({ value, bold, late }: { value: number; bold?: boolean; late?: boolean }) => (
  <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
    <Text
      size="sm"
      fw={bold ? 700 : 400}
      c={value === 0 && !bold ? 'dimmed' : late && value > 0 ? 'red.7' : undefined}
    >
      {value === 0 && !bold ? '-' : formatAmount(value)}
    </Text>
  </Table.Td>
);

/** One row per vendor with the open balance split by how long it has been due, and a totals row. */
export const PayablesTable = ({
  data,
  isLoading,
  isError,
  onRetry,
}: Readonly<PayablesTableProps>) => {
  const { t } = useTranslation('purchases');

  const body = () => {
    if (isLoading) {
      return Array.from({ length: 4 }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMNS}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (isError) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMNS} p={0}>
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
    if (!data || data.rows.length === 0) {
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
    return data.rows.map((row) => (
      <Table.Tr key={row.vendorId || row.vendorName}>
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" fw={500}>
            {row.vendorName}
          </Text>
          <Text size="xs" c="dimmed">
            {t('reports.billsCount', { count: row.billCount })}
          </Text>
        </Table.Td>
        <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          <Text size="sm" fw={700}>
            {formatAmount(row.totalRemaining)}
          </Text>
          <Group justify="flex-end" mt={4}>
            <div style={{ width: 64 }}>
              <SegmentBar
                aria-label={t('reports.col.remaining')}
                segments={[
                  { key: 'current', value: row.current, color: AGING_COLOR.current },
                  {
                    key: 'late',
                    value: row.totalRemaining - row.current,
                    color: AGING_COLOR.days31to60,
                  },
                ]}
              />
            </div>
          </Group>
        </Table.Td>
        {AGING_BUCKETS.map((key) => (
          <Amount key={key} value={row[key]} late={key !== 'current'} />
        ))}
      </Table.Tr>
    ));
  };

  const showTotals = !isLoading && !isError && data && data.rows.length > 0;

  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Head label={t('reports.col.vendor')} />
              <Head right label={t('reports.col.remaining')} />
              {AGING_BUCKETS.map((key) => (
                <Head key={key} right label={t(`reports.col.${key}`)} />
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{body()}</Table.Tbody>
          {showTotals && (
            <Table.Tfoot>
              <Table.Tr
                bg="var(--jurnal-color-surface-hover)"
                style={{ borderTop: '1px solid var(--jurnal-color-border-muted)' }}
              >
                <Table.Td>
                  <Text size="sm" fw={700}>
                    {t('reports.total')}
                  </Text>
                </Table.Td>
                <Amount bold value={data.totals.totalRemaining} />
                {AGING_BUCKETS.map((key) => (
                  <Amount key={key} bold late={key !== 'current'} value={data.totals[key]} />
                ))}
              </Table.Tr>
            </Table.Tfoot>
          )}
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
