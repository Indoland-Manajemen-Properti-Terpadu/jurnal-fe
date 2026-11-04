import { Anchor, Group, Stack } from '@mantine/core';
import { IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { settlementBalance } from '@/module/petty-cash/domain/advance';
import { advanceJourney } from '@/module/petty-cash/domain/documentJourney';
import type { AdvanceRecord, PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { AdvanceActions } from '@/module/petty-cash/presentation/components/AdvanceActions';
import { AuditTimeline } from '@/module/petty-cash/presentation/components/AuditTimeline';
import {
  AmountRows,
  AmountSummary,
  DetailFacts,
  DetailSection,
  LineItems,
} from '@/module/petty-cash/presentation/components/DetailKit';
import {
  DocumentDrawer,
  DocumentNotice,
} from '@/module/petty-cash/presentation/components/DocumentDrawer';
import { JourneySection } from '@/module/petty-cash/presentation/components/JourneySection';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
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

const BALANCE_LABEL = {
  EXTRA: 'advanceDrawer.extra',
  RETURN: 'advanceDrawer.returned',
  EVEN: 'advanceDrawer.even',
} as const;

function SettlementSection({ advance }: Readonly<{ advance: AdvanceRecord }>) {
  const { t } = useTranslation('pettyCash');
  const { settlement } = advance;
  const balance = settlementBalance(advance.amount, settlement.actualTotal);
  return (
    <DetailSection title={t('advanceDrawer.settlement')}>
      <Stack gap="sm">
        <DetailFacts
          facts={[
            { label: t('settlementForm.beneficiary'), value: settlement.beneficiary },
            {
              label: t('settlementForm.date'),
              value: settlement.transactionDate ? dateFormatV1(settlement.transactionDate) : null,
            },
          ]}
        />
        <LineItems
          items={settlement.lines.map((line) => ({
            key: String(line.lineNo),
            title: line.description,
            subtitle: line.expenseAccount
              ? `${line.expenseAccount.accountNumber} · ${line.expenseAccount.name}`
              : t('advanceDrawer.noAccount'),
            amount: money(line.amount),
          }))}
        />
        <AmountRows
          rows={[
            { label: t('advanceDrawer.spent'), value: money(settlement.actualTotal) },
            {
              label: t(BALANCE_LABEL[balance.kind]),
              value: balance.kind === 'EVEN' ? '' : money(balance.amount),
              total: true,
            },
          ]}
        />
      </Stack>
    </DetailSection>
  );
}

export function AdvanceDetailDrawer({ fund, advanceId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useAdvance(advanceId ?? undefined);
  const lookups = usePettyCashLookups();
  const attachment = useOpenAttachment();
  const advance = query.data;
  const nameOf = (userId: string) =>
    lookups.data?.users.find((user) => user.id === userId)?.name ?? null;
  const verified = advance && advance.status !== 'DISBURSED';

  return (
    <DocumentDrawer
      opened={opened}
      onClose={onClose}
      kindLabel={t('advanceDrawer.title')}
      number={advance?.advanceNumber}
      status={advance && <PettyCashStatusBadge kind="advance" status={advance.status} />}
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      loadFailed={t('advanceDrawer.loadFailed')}
      onRetry={() => query.refetch()}
      actions={advance && <AdvanceActions advance={advance} fund={fund} onChanged={onClose} />}
    >
      {advance && (
        <>
          <AmountSummary
            label={t('advanceDrawer.outstanding')}
            amount={money(advance.outstandingAmount)}
            meta={[
              t('detail.requested', { amount: money(advance.requestedAmount) }),
              advance.amount !== advance.requestedAmount
                ? t('detail.approvedAmount', { amount: money(advance.amount) })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          />

          {advance.rejectedReason && (
            <DocumentNotice tone="refusal" title={t('advanceDrawer.rejectedReason')}>
              {advance.rejectedReason}
            </DocumentNotice>
          )}
          {advance.settlementRejectedReason && advance.status === 'DISBURSED' && (
            <DocumentNotice tone="warning" title={t('advanceDrawer.settlementRejectedReason')}>
              {advance.settlementRejectedReason}
            </DocumentNotice>
          )}

          <DetailSection title={t('detail.info')}>
            <DetailFacts
              facts={[
                { label: t('advanceDrawer.requester'), value: advance.requester.name },
                {
                  label: t('advanceDrawer.due'),
                  value: advance.dueAt ? dateFormatV1(advance.dueAt) : null,
                },
                { label: t('advanceDrawer.purpose'), value: advance.purpose, wide: true },
                { label: t('advanceDrawer.approvedBy'), value: advance.approvedBy?.name },
                { label: t('advanceDrawer.disbursedBy'), value: advance.disbursedBy?.name },
                {
                  label: t('advanceDrawer.custodianVerifiedBy'),
                  value: verified ? advance.custodianVerifiedBy?.name : null,
                },
                {
                  label: t('advanceDrawer.financeVerifiedBy'),
                  value: verified ? advance.financeVerifiedBy?.name : null,
                },
                {
                  label: t('advanceDrawer.receivable'),
                  value: advance.receivableAmount > 0 ? money(advance.receivableAmount) : null,
                },
              ]}
            />
          </DetailSection>

          {advance.settlement.submittedAt && <SettlementSection advance={advance} />}

          {advance.attachments.length > 0 && (
            <DetailSection title={t('advanceDrawer.attachments')}>
              <Stack gap={6}>
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
            </DetailSection>
          )}

          <JourneySection steps={advanceJourney(advance, nameOf)} statusKind="advance" />
          <AuditTimeline entityType="ADVANCE" entityId={advance.id} />
        </>
      )}
    </DocumentDrawer>
  );
}
