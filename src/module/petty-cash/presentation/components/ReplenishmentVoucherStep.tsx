import { Alert, Checkbox, Paper, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle, IconReceipt2, IconScale } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type {
  CountRecord,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import { selectedTotal, toggleAll, toggleVoucher } from '@/module/petty-cash/domain/replenishment';
import styles from '@/module/petty-cash/presentation/components/DocumentTable.module.css';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { SectionCard } from '@/module/petty-cash/presentation/components/SectionCard';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

interface Props {
  vouchers: PettyCashVoucherRecord[] | undefined;
  loading: boolean;
  error: PettyCashError | null;
  onRetry: () => void;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  counts: CountRecord[];
  countId: string | null;
  countRequired: boolean;
  countError?: string;
  onCountChange: (countId: string | null) => void;
  voucherError?: string;
  countsError: PettyCashError | null;
  onRetryCounts: () => void;
  hiddenVouchers: number;
}

const money = (amount: number) => formatCurrency(amount, false);

/** Step 1: the vouchers to replenish and, when there is one, the approved cash count that settles with them. */
export function ReplenishmentVoucherStep({
  vouchers,
  loading,
  error,
  onRetry,
  selectedIds,
  onSelect,
  counts,
  countId,
  countRequired,
  countError,
  onCountChange,
  voucherError,
  countsError,
  onRetryCounts,
  hiddenVouchers,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const items = vouchers ?? [];
  const allIds = items.map((voucher) => voucher.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const chosenCount = counts.find((count) => count.id === countId);

  return (
    <Stack gap="lg">
      <SectionCard
        icon={<IconReceipt2 size={18} />}
        title={t('replenishForm.vouchersTitle')}
        subtitle={t('replenishForm.vouchersSubtitle')}
      >
        {error && (
          <QueryErrorState title={t('vouchers.loadFailed')} error={error} onRetry={onRetry} />
        )}
        {loading && <Skeleton height={120} radius="md" />}
        {hiddenVouchers > 0 && (
          <Alert variant="light" color="orange" radius="md" mb="sm">
            {t('replenishForm.vouchersTruncated', {
              shown: items.length,
              total: items.length + hiddenVouchers,
            })}
          </Alert>
        )}
        {vouchers && items.length === 0 && (
          <EmptyState
            icon={<IconReceipt2 size={32} />}
            title={t('replenishForm.emptyTitle')}
            description={t('replenishForm.emptyBody')}
          />
        )}
        {items.length > 0 && (
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Table.ScrollContainer minWidth={520}>
              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={44} className={styles.th}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedIds.length > 0 && !allSelected}
                        onChange={() => onSelect(toggleAll(allIds, selectedIds))}
                        aria-label={t('replenishForm.selectAll')}
                      />
                    </Table.Th>
                    <Table.Th className={styles.th}>{t('vouchers.columns.number')}</Table.Th>
                    <Table.Th className={styles.th}>{t('vouchers.columns.date')}</Table.Th>
                    <Table.Th className={styles.th}>{t('vouchers.columns.beneficiary')}</Table.Th>
                    <Table.Th ta="right" className={styles.th}>
                      {t('vouchers.columns.total')}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((voucher) => (
                    <Table.Tr key={voucher.id}>
                      <Table.Td className={styles.td}>
                        <Checkbox
                          checked={selectedIds.includes(voucher.id)}
                          onChange={() => onSelect(toggleVoucher(selectedIds, voucher.id))}
                          aria-label={t('replenishForm.selectRow', {
                            number: voucher.voucherNumber,
                          })}
                        />
                      </Table.Td>
                      <Table.Td className={styles.td}>
                        <Text size="sm" fw={650}>
                          {voucher.voucherNumber}
                        </Text>
                      </Table.Td>
                      <Table.Td className={`${styles.td} ${styles.num}`}>
                        {dateFormatV1(voucher.transactionDate)}
                      </Table.Td>
                      <Table.Td className={styles.td}>{voucher.beneficiary}</Table.Td>
                      <Table.Td ta="right" className={`${styles.td} ${styles.num}`}>
                        <Text size="sm" fw={650}>
                          {money(voucher.totalAmount)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        )}
        {voucherError && (
          <Text size="sm" c="red.7" mt="sm" role="alert">
            {voucherError}
          </Text>
        )}
        {items.length > 0 && (
          <Text size="sm" c="dimmed" mt="sm" aria-live="polite">
            {t('replenishForm.selected', { count: selectedIds.length })} ·{' '}
            {t('replenishForm.selectedTotal', { amount: money(selectedTotal(items, selectedIds)) })}
          </Text>
        )}
      </SectionCard>

      <SectionCard
        icon={<IconScale size={18} />}
        title={t('replenishForm.countTitle')}
        subtitle={t('replenishForm.countSubtitle')}
      >
        <Stack gap="sm">
          {countsError && (
            <QueryErrorState
              title={t('replenishForm.countsFailed')}
              error={countsError}
              onRetry={onRetryCounts}
            />
          )}
          {countRequired && (
            <Text size="sm" c="dimmed">
              {t('replenishForm.countRequired')}
            </Text>
          )}
          <Select
            label={t('replenishForm.countLabel')}
            placeholder={
              counts.length === 0 ? t('replenishForm.countNone') : t('replenishForm.countSkip')
            }
            data={counts.map((count) => ({
              value: count.id,
              label: t('replenishForm.countOption', {
                number: count.countNumber,
                variance: t(
                  count.varianceType === 'SHORT'
                    ? 'counts.short'
                    : count.varianceType === 'OVER'
                      ? 'counts.over'
                      : 'counts.balanced',
                  { amount: money(Math.abs(count.varianceAmount)) }
                ),
              }),
            }))}
            value={countId}
            onChange={onCountChange}
            clearable={!countRequired}
            disabled={counts.length === 0}
            error={countError}
            required={countRequired}
          />
          {chosenCount?.isStale && (
            <Alert
              variant="light"
              color="orange"
              radius="md"
              icon={<IconAlertTriangle size={16} />}
            >
              {t('replenishForm.countStale')}
            </Alert>
          )}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
