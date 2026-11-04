import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { denominationRows } from '@/module/petty-cash/domain/cashCount';
import { countJourney } from '@/module/petty-cash/domain/documentJourney';
import { AuditTimeline } from '@/module/petty-cash/presentation/components/AuditTimeline';
import { CountActions } from '@/module/petty-cash/presentation/components/CountActions';
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
import { VarianceText } from '@/module/petty-cash/presentation/components/VarianceText';
import { useCount } from '@/module/petty-cash/presentation/hooks/useCountQueries';

interface Props {
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  countId: string | null;
  opened: boolean;
  onClose: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

export function CountDetailDrawer({ countId, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const query = useCount(countId ?? undefined);
  const count = query.data;

  return (
    <DocumentDrawer
      opened={opened}
      onClose={onClose}
      kindLabel={t('countDrawer.title')}
      number={count?.countNumber}
      status={count && <PettyCashStatusBadge kind="count" status={count.status} />}
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      loadFailed={t('countDrawer.loadFailed')}
      onRetry={() => query.refetch()}
      actions={count && <CountActions count={count} onChanged={onClose} />}
    >
      {count && (
        <>
          <AmountSummary
            label={t('detail.totalCounted')}
            amount={money(count.totalCounted)}
            meta={
              <VarianceText type={count.varianceType} amount={count.varianceAmount} size="xs" />
            }
          />

          {count.status === 'REJECTED' && count.rejectedReason && (
            <DocumentNotice tone="refusal" title={t('countDrawer.rejectedReason')}>
              {count.rejectedReason}
            </DocumentNotice>
          )}
          {count.isStale && count.status !== 'SETTLED' && (
            <DocumentNotice tone="warning">{t('countDrawer.stale')}</DocumentNotice>
          )}

          <DetailSection title={t('detail.countResult')}>
            <AmountRows
              rows={[
                { label: t('detail.totalCounted'), value: money(count.totalCounted) },
                { label: t('countDrawer.expected'), value: money(count.expectedCash) },
                {
                  label: t('countDrawer.pendingVouchers'),
                  value: money(count.pendingVoucherTotal),
                },
                { label: t('countDrawer.advances'), value: money(count.outstandingAdvanceTotal) },
                {
                  label: t('countDrawer.variance'),
                  value: <VarianceText type={count.varianceType} amount={count.varianceAmount} />,
                  total: true,
                },
              ]}
            />
          </DetailSection>

          {count.pocketResults.length > 1 && (
            <DetailSection title={t('detail.perPocket')}>
              <LineItems
                items={count.pocketResults.map((result) => ({
                  key: result.pocket,
                  title: result.name,
                  subtitle: t('detail.pocketLine', {
                    book: money(result.expected),
                    counted: money(result.counted),
                  }),
                  amount: (
                    <VarianceText
                      type={
                        result.variance < 0 ? 'SHORT' : result.variance > 0 ? 'OVER' : 'BALANCED'
                      }
                      amount={result.variance}
                    />
                  ),
                }))}
              />
            </DetailSection>
          )}

          <DetailSection title={t('detail.info')}>
            <DetailFacts
              facts={[
                { label: t('countDrawer.counter'), value: count.countedBy?.name },
                { label: t('countDrawer.witness'), value: count.witnessedBy?.name },
                {
                  label: t('countDrawer.countedAt'),
                  value: dateFormatV1(count.countedAt, 'DD MMM YYYY · HH:mm'),
                },
                { label: t('countDrawer.reason'), value: count.reason, wide: true },
                {
                  label: t('detail.settlement'),
                  value: count.status === 'SETTLED' ? t('countDrawer.settled') : null,
                  wide: true,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={t('countDrawer.denominations')}>
            <LineItems
              items={denominationRows(count.denominations).map((row) => ({
                key: `${row.kind}-${row.value}`,
                title: money(row.value),
                subtitle: t('detail.pieces', {
                  kind: t(row.kind === 'note' ? 'countDrawer.banknotes' : 'countDrawer.coins'),
                  count: row.pieces,
                }),
                amount: money(row.subtotal),
              }))}
            />
          </DetailSection>

          <JourneySection steps={countJourney(count)} />
          <AuditTimeline entityType="COUNT" entityId={count.id} />
        </>
      )}
    </DocumentDrawer>
  );
}
