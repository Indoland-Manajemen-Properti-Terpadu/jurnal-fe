import { Alert, Box, Divider, Drawer, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { denominationRows } from '@/module/petty-cash/domain/cashCount';
import { CountActions } from '@/module/petty-cash/presentation/components/CountActions';
import { AuditTimeline } from '@/module/petty-cash/presentation/components/AuditTimeline';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { VarianceText } from '@/module/petty-cash/presentation/components/VarianceText';
import { useCount } from '@/module/petty-cash/presentation/hooks/useCountQueries';

interface Props {
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  countId: string | null;
  opened: boolean;
  onClose: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600} ta="right" component="div">
        {children}
      </Text>
    </Group>
  );
}

export function CountDetailDrawer({ countId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useCount(countId ?? undefined);
  const count = query.data;
  const rows = count ? denominationRows(count.denominations) : [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={
        <Group gap="sm">
          <Text fw={700}>{count?.countNumber ?? t('countDrawer.title')}</Text>
          {count && <PettyCashStatusBadge kind="count" status={count.status} />}
        </Group>
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      {query.isLoading && (
        <Stack gap="sm">
          <Skeleton height={20} />
          <Skeleton height={120} />
        </Stack>
      )}
      {query.isError && (
        <QueryErrorState
          title={t('countDrawer.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      {count && (
        <Stack gap="lg">
          {count.isStale && count.status !== 'SETTLED' && (
            <Alert
              color="orange"
              variant="light"
              radius="md"
              icon={<IconAlertTriangle size={16} />}
            >
              {t('countDrawer.stale')}
            </Alert>
          )}

          <Stack gap="xs">
            <Row label={t('countDrawer.counted')}>{money(count.totalPhysicalCash)}</Row>
            <Row label={t('countDrawer.expected')}>{money(count.expectedCash)}</Row>
            <Row label={t('countDrawer.pendingVouchers')}>{money(count.pendingVoucherTotal)}</Row>
            <Row label={t('countDrawer.advances')}>{money(count.outstandingAdvanceTotal)}</Row>
            <Divider />
            <Row label={t('countDrawer.variance')}>
              <VarianceText type={count.varianceType} amount={count.varianceAmount} />
            </Row>
          </Stack>

          {count.reason && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('countDrawer.reason')}
              </Text>
              <Text size="sm" fw={600}>
                {count.reason}
              </Text>
            </Box>
          )}
          {count.status === 'REJECTED' && count.rejectedReason && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('countDrawer.rejectedReason')}
              </Text>
              <Text size="sm" fw={600}>
                {count.rejectedReason}
              </Text>
            </Box>
          )}
          {count.status === 'SETTLED' && (
            <Text size="sm" c="dimmed">
              {t('countDrawer.settled')}
            </Text>
          )}

          <Stack gap="xs">
            <Row label={t('countDrawer.counter')}>{count.countedBy?.name}</Row>
            <Row label={t('countDrawer.witness')}>{count.witnessedBy?.name}</Row>
            <Row label={t('countDrawer.countedAt')}>{dateFormatV1(count.countedAt)}</Row>
            {count.approvedBy && (
              <Row label={t('countDrawer.approvedBy')}>{count.approvedBy.name}</Row>
            )}
          </Stack>

          <Box>
            <Text fw={700} mb="xs">
              {t('countDrawer.denominations')}
            </Text>
            <Table.ScrollContainer minWidth={320}>
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('countDrawer.denomination')}</Table.Th>
                    <Table.Th ta="right">{t('countDrawer.pieces')}</Table.Th>
                    <Table.Th ta="right">{t('countDrawer.subtotal')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => (
                    <Table.Tr key={`${row.kind}-${row.value}`}>
                      <Table.Td>
                        {money(row.value)}{' '}
                        <Text span size="xs" c="dimmed">
                          {t(row.kind === 'note' ? 'countDrawer.banknotes' : 'countDrawer.coins')}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">{row.pieces}</Table.Td>
                      <Table.Td ta="right">{money(row.subtotal)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>

          <AuditTimeline entityType="COUNT" entityId={count.id} />
          <CountActions count={count} onChanged={onClose} />
        </Stack>
      )}
    </Drawer>
  );
}
