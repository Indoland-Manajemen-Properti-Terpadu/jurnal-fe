import { Box, Divider, Drawer, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { AuditTimeline } from '@/module/petty-cash/presentation/components/AuditTimeline';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { ReplenishmentActions } from '@/module/petty-cash/presentation/components/ReplenishmentActions';
import { useReimbursement } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';

interface Props {
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  replenishmentId: string | null;
  opened: boolean;
  onClose: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

function Row({
  label,
  children,
  strong,
}: Readonly<{ label: string; children: React.ReactNode; strong?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right" component="div">
        {children}
      </Text>
    </Group>
  );
}

export function ReplenishmentDetailDrawer({ replenishmentId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useReimbursement(replenishmentId ?? undefined);
  const record = query.data;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={
        <Group gap="sm">
          <Text fw={700}>{record?.reimbursementNumber ?? t('replenishmentDrawer.title')}</Text>
          {record && <PettyCashStatusBadge kind="reimbursement" status={record.status} />}
        </Group>
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      {query.isLoading && (
        <Stack gap="sm">
          <Skeleton height={20} />
          <Skeleton height={140} />
        </Stack>
      )}
      {query.isError && (
        <QueryErrorState
          title={t('replenishmentDrawer.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      {record && (
        <Stack gap="lg">
          <Stack gap="xs">
            <Row label={t('replenishmentDrawer.voucherTotal')}>{money(record.voucherTotal)}</Row>
            {record.varianceAmount !== 0 && (
              <Row
                label={t(
                  record.varianceAmount < 0
                    ? 'replenishmentDrawer.shortage'
                    : 'replenishmentDrawer.surplus'
                )}
              >
                {money(Math.abs(record.varianceAmount))}
              </Row>
            )}
            <Divider />
            <Row label={t('replenishmentDrawer.payout')} strong>
              {money(record.totalAmount)}
            </Row>
          </Stack>

          <Stack gap="xs">
            <Row label={t('replenishmentDrawer.bank')}>
              {record.bankAccount.accountNumber} · {record.bankAccount.name}
            </Row>
            {record.count && (
              <Row label={t('replenishmentDrawer.count')}>{record.count.countNumber}</Row>
            )}
            <Row label={t('replenishmentDrawer.submittedBy')}>{record.submittedBy?.name}</Row>
            {record.approvedBy && (
              <Row label={t('replenishmentDrawer.approvedBy')}>{record.approvedBy.name}</Row>
            )}
            {record.disbursedBy && (
              <Row label={t('replenishmentDrawer.disbursedBy')}>{record.disbursedBy.name}</Row>
            )}
            {record.disbursementDate && (
              <Row label={t('replenishmentDrawer.disbursedOn')}>
                {dateFormatV1(record.disbursementDate)}
              </Row>
            )}
            {record.cancelledBy && (
              <Row label={t('replenishmentDrawer.cancelledBy')}>{record.cancelledBy.name}</Row>
            )}
          </Stack>

          {record.notes && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('replenishmentDrawer.notes')}
              </Text>
              <Text size="sm" fw={600}>
                {record.notes}
              </Text>
            </Box>
          )}
          {record.status === 'REJECTED' && record.rejectedReason && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('replenishmentDrawer.rejectedReason')}
              </Text>
              <Text size="sm" fw={600}>
                {record.rejectedReason}
              </Text>
            </Box>
          )}
          {record.journalId && (
            <Text size="sm" c="teal.8" fw={600}>
              {t('replenishmentDrawer.journalPosted')}
            </Text>
          )}

          <Box>
            <Text fw={700} mb="xs">
              {t('replenishmentDrawer.vouchers')}
            </Text>
            <Table.ScrollContainer minWidth={360}>
              <Table verticalSpacing="xs">
                <Table.Tbody>
                  {record.items.map((item) => (
                    <Table.Tr key={item.voucherId}>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {item.voucher?.voucherNumber}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item.voucher?.beneficiary}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">{money(item.amount)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>

          <AuditTimeline entityType="REIMBURSEMENT" entityId={record.id} />
          <ReplenishmentActions record={record} onChanged={onClose} />
        </Stack>
      )}
    </Drawer>
  );
}
