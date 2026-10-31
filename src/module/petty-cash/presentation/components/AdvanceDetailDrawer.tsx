import { Anchor, Box, Divider, Drawer, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { settlementBalance } from '@/module/petty-cash/domain/advance';
import type { AdvanceRecord, PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { AdvanceActions } from '@/module/petty-cash/presentation/components/AdvanceActions';
import { AuditTimeline } from '@/module/petty-cash/presentation/components/AuditTimeline';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { useAdvance } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';
import { useOpenAttachment } from '@/module/petty-cash/presentation/hooks/useOpenAttachment';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  fund: PettyCashFund;
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  advanceId: string | null;
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
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right" component="div">
        {children}
      </Text>
    </Group>
  );
}

function SettlementSection({ advance }: Readonly<{ advance: AdvanceRecord }>) {
  const { t } = useTranslation('pettyCash');
  const { settlement } = advance;
  const balance = settlementBalance(advance.amount, settlement.actualTotal);
  return (
    <Box>
      <Text fw={700} mb="xs">
        {t('advanceDrawer.settlement')}
      </Text>
      <Stack gap="xs">
        {settlement.beneficiary && (
          <Row label={t('settlementForm.beneficiary')}>{settlement.beneficiary}</Row>
        )}
        {settlement.transactionDate && (
          <Row label={t('settlementForm.date')}>{dateFormatV1(settlement.transactionDate)}</Row>
        )}
        {settlement.lines.length > 0 && (
          <Table.ScrollContainer minWidth={360}>
            <Table verticalSpacing="xs">
              <Table.Tbody>
                {settlement.lines.map((line) => (
                  <Table.Tr key={line.lineNo}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {line.description}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {line.expenseAccount
                          ? `${line.expenseAccount.accountNumber} · ${line.expenseAccount.name}`
                          : t('advanceDrawer.noAccount')}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">{money(line.amount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        <Divider />
        <Row label={t('advanceDrawer.spent')}>{money(settlement.actualTotal)}</Row>
        <Row
          label={t(
            balance.kind === 'EXTRA'
              ? 'advanceDrawer.extra'
              : balance.kind === 'RETURN'
                ? 'advanceDrawer.returned'
                : 'advanceDrawer.even'
          )}
          strong
        >
          {balance.kind === 'EVEN' ? '' : money(balance.amount)}
        </Row>
      </Stack>
    </Box>
  );
}

export function AdvanceDetailDrawer({ fund, advanceId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useAdvance(advanceId ?? undefined);
  const lookups = usePettyCashLookups();
  const attachment = useOpenAttachment();
  const advance = query.data;
  const nameOf = (userId: string) =>
    lookups.data?.users.find((user) => user.id === userId)?.name ?? '-';

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={
        <Group gap="sm">
          <Text fw={700}>{advance?.advanceNumber ?? t('advanceDrawer.title')}</Text>
          {advance && <PettyCashStatusBadge kind="advance" status={advance.status} />}
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
          title={t('advanceDrawer.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      {advance && (
        <Stack gap="lg">
          <Stack gap="xs">
            <Row label={t('advanceDrawer.requester')}>{advance.requester.name}</Row>
            <Row label={t('advanceDrawer.purpose')}>{advance.purpose}</Row>
            <Row label={t('advanceDrawer.requested')}>{money(advance.requestedAmount)}</Row>
            {advance.amount !== advance.requestedAmount && (
              <Row label={t('advanceDrawer.approved')}>{money(advance.amount)}</Row>
            )}
            {advance.approvedBy && (
              <Row label={t('advanceDrawer.approvedBy')}>{advance.approvedBy.name}</Row>
            )}
            {advance.disbursedBy && (
              <Row label={t('advanceDrawer.disbursedBy')}>{advance.disbursedBy.name}</Row>
            )}
            {advance.dueAt && (
              <Row label={t('advanceDrawer.due')}>{dateFormatV1(advance.dueAt)}</Row>
            )}
            {advance.custodianVerifiedBy && advance.status !== 'DISBURSED' && (
              <Row label={t('advanceDrawer.custodianVerifiedBy')}>
                {advance.custodianVerifiedBy.name}
              </Row>
            )}
            {advance.financeVerifiedBy && advance.status !== 'DISBURSED' && (
              <Row label={t('advanceDrawer.financeVerifiedBy')}>
                {advance.financeVerifiedBy.name}
              </Row>
            )}
            <Divider />
            <Row label={t('advanceDrawer.outstanding')} strong>
              {money(advance.outstandingAmount)}
            </Row>
          </Stack>

          {advance.rejectedReason && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('advanceDrawer.rejectedReason')}
              </Text>
              <Text size="sm" fw={600}>
                {advance.rejectedReason}
              </Text>
            </Box>
          )}
          {advance.settlementRejectedReason && advance.status === 'DISBURSED' && (
            <Box>
              <Text size="xs" c="dimmed">
                {t('advanceDrawer.settlementRejectedReason')}
              </Text>
              <Text size="sm" fw={600}>
                {advance.settlementRejectedReason}
              </Text>
            </Box>
          )}
          {advance.receivableAmount > 0 && (
            <Text size="sm" c="teal.8" fw={600}>
              {t('advanceDrawer.receivable')}: {money(advance.receivableAmount)}
            </Text>
          )}

          {advance.settlement.submittedAt && <SettlementSection advance={advance} />}

          {advance.attachments.length > 0 && (
            <Box>
              <Text fw={700} mb="xs">
                {t('advanceDrawer.attachments')}
              </Text>
              <Stack gap={4}>
                {advance.attachments.map((file) => (
                  <Anchor
                    key={file.id}
                    component="button"
                    type="button"
                    size="sm"
                    ta="left"
                    onClick={() => attachment.open(file.id)}
                    aria-label={t('drawer.openAttachment', { name: file.fileName })}
                  >
                    <Group gap={6} wrap="nowrap">
                      <IconPaperclip size={14} />
                      {file.fileName}
                    </Group>
                  </Anchor>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Text fw={700} mb="xs">
              {t('advanceDrawer.timeline')}
            </Text>
            <Stack gap={6}>
              {advance.statusHistory.map((entry, index) => (
                <Group key={`${entry.status}-${entry.at}-${index}`} gap="xs" wrap="nowrap">
                  <PettyCashStatusBadge kind="advance" status={entry.status} />
                  <Text size="xs" c="dimmed">
                    {dateFormatV1(entry.at)} ·{' '}
                    {t('advanceDrawer.byUser', { name: nameOf(entry.byId) })}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>

          <AuditTimeline entityType="ADVANCE" entityId={advance.id} />
          <AdvanceActions advance={advance} fund={fund} onChanged={onClose} />
        </Stack>
      )}
    </Drawer>
  );
}
