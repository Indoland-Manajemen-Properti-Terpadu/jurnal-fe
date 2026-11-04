import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { reimbursementJourney } from '@/module/petty-cash/domain/documentJourney';
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
import { ReplenishmentActions } from '@/module/petty-cash/presentation/components/ReplenishmentActions';
import { useReimbursement } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';
import { usePettyCashFund } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { pocketLabel } from '@/module/petty-cash/domain/pockets';

interface Props {
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  replenishmentId: string | null;
  opened: boolean;
  onClose: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

export function ReplenishmentDetailDrawer({ replenishmentId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useReimbursement(replenishmentId ?? undefined);
  const record = query.data;
  const fund = usePettyCashFund(record?.fund.id);
  const bank = record ? `${record.bankAccount.accountNumber} · ${record.bankAccount.name}` : '';

  return (
    <DocumentDrawer
      opened={opened}
      onClose={onClose}
      kindLabel={t('replenishmentDrawer.title')}
      number={record?.reimbursementNumber}
      status={record && <PettyCashStatusBadge kind="reimbursement" status={record.status} />}
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      loadFailed={t('replenishmentDrawer.loadFailed')}
      onRetry={() => query.refetch()}
      actions={record && <ReplenishmentActions record={record} onChanged={onClose} />}
    >
      {record && (
        <>
          <AmountSummary
            label={t('replenishmentDrawer.payout')}
            amount={money(record.totalAmount)}
            meta={`${dateFormatV1(record.requestDate)} · ${bank}`}
          />

          {record.status === 'REJECTED' && record.rejectedReason && (
            <DocumentNotice tone="refusal" title={t('replenishmentDrawer.rejectedReason')}>
              {record.rejectedReason}
            </DocumentNotice>
          )}

          <DetailSection title={t('detail.breakdown')}>
            <AmountRows
              rows={[
                { label: t('replenishmentDrawer.voucherTotal'), value: money(record.voucherTotal) },
                ...(record.varianceAmount !== 0
                  ? [
                      {
                        label: t(
                          record.varianceAmount < 0
                            ? 'replenishmentDrawer.shortage'
                            : 'replenishmentDrawer.surplus'
                        ),
                        value: money(Math.abs(record.varianceAmount)),
                      },
                    ]
                  : []),
                {
                  label: t('replenishmentDrawer.payout'),
                  value: money(record.totalAmount),
                  total: true,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={t('detail.info')}>
            <DetailFacts
              facts={[
                { label: t('replenishmentDrawer.bank'), value: bank },
                {
                  label: t('detail.pocket'),
                  value: pocketLabel(fund.data?.pockets ?? [], record.pocket),
                },
                { label: t('replenishmentDrawer.count'), value: record.count?.countNumber },
                {
                  label: t('replenishmentDrawer.disbursedOn'),
                  value: record.disbursementDate ? dateFormatV1(record.disbursementDate) : null,
                },
                {
                  label: t('detail.journal'),
                  value: record.journalId ? t('detail.journalPosted') : null,
                },
              ]}
            />
          </DetailSection>

          <DetailSection
            title={t('replenishmentDrawer.vouchers')}
            aside={
              <Text size="xs" c="dimmed">
                {t('detail.itemCount', { count: record.items.length })}
              </Text>
            }
          >
            <LineItems
              items={record.items.map((item) => ({
                key: item.voucherId,
                title: item.voucher?.voucherNumber ?? item.voucherId,
                subtitle: item.voucher
                  ? `${item.voucher.beneficiary} · ${dateFormatV1(item.voucher.transactionDate)}`
                  : undefined,
                amount: money(item.amount),
              }))}
            />
          </DetailSection>

          <JourneySection steps={reimbursementJourney(record)} />
          <AuditTimeline entityType="REIMBURSEMENT" entityId={record.id} />
        </>
      )}
    </DocumentDrawer>
  );
}
