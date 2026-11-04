import { Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { voucherJourney } from '@/module/petty-cash/domain/documentJourney';
import { pocketLabel } from '@/module/petty-cash/domain/pockets';
import { voucherBreakdown } from '@/module/petty-cash/domain/pettyCashView';
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
import { VoucherActions } from '@/module/petty-cash/presentation/components/VoucherActions';
import { VoucherAttachmentsPanel } from '@/module/petty-cash/presentation/components/VoucherAttachmentsPanel';
import {
  usePettyCashLookups,
  usePettyCashVoucher,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  fund: PettyCashFund;
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  voucherId: string | null;
  opened: boolean;
  onClose: () => void;
}

const KNOWN_WARNING_CODES = ['DUPLICATE_RECEIPT_NUMBER'];

const money = (amount: number) => formatCurrency(amount, false);

const warningText = (
  warning: { code: string; message: string },
  language: string,
  t: (key: string) => string
) => {
  if (language === 'id' && warning.message) return warning.message;
  return KNOWN_WARNING_CODES.includes(warning.code)
    ? t(`drawer.warningCodes.${warning.code}`)
    : t('drawer.warningGeneric');
};

export function VoucherDetailDrawer({ fund, voucherId, opened, onClose }: Readonly<Props>) {
  const { t, currentLanguage } = useTranslation('pettyCash');
  const query = usePettyCashVoucher(voucherId ?? undefined);
  const voucher = query.data;
  const lookups = usePettyCashLookups();
  const tagNames = (ids: string[]) =>
    ids
      .map((id) => lookups.data?.tags.find((tag) => tag.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  const totals = voucher ? voucherBreakdown(voucher.lines, voucher.totalAmount) : null;

  return (
    <DocumentDrawer
      opened={opened}
      onClose={onClose}
      kindLabel={t('drawer.title')}
      number={voucher?.voucherNumber}
      status={voucher && <PettyCashStatusBadge kind="voucher" status={voucher.status} />}
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      loadFailed={t('drawer.loadFailed')}
      onRetry={() => query.refetch()}
      actions={voucher && <VoucherActions voucher={voucher} fund={fund} onChanged={onClose} />}
    >
      {voucher && totals && (
        <>
          <AmountSummary
            label={t('drawer.total')}
            amount={money(voucher.totalAmount)}
            meta={`${voucher.beneficiary} · ${dateFormatV1(voucher.transactionDate)}`}
          />

          {/* The backend keeps old reasons after a voucher leaves REJECTED or VOID. */}
          {voucher.status === 'REJECTED' && voucher.rejectedReason && (
            <DocumentNotice tone="refusal" title={t('drawer.rejectedReason')}>
              {voucher.rejectedReason}
            </DocumentNotice>
          )}
          {voucher.status === 'VOID' && voucher.voidReason && (
            <DocumentNotice tone="info" title={t('drawer.voidReason')}>
              {voucher.voidReason}
            </DocumentNotice>
          )}
          {voucher.warnings.length > 0 && (
            <DocumentNotice tone="warning" title={t('drawer.warnings')}>
              {voucher.warnings.map((warning) => (
                <Text key={`${warning.code}-${warning.message}`} size="sm">
                  {warningText(warning, currentLanguage, t)}
                </Text>
              ))}
            </DocumentNotice>
          )}

          <DetailSection title={t('detail.info')}>
            <DetailFacts
              facts={[
                { label: t('drawer.beneficiary'), value: voucher.beneficiary },
                { label: t('drawer.date'), value: dateFormatV1(voucher.transactionDate) },
                { label: t('drawer.receipt'), value: voucher.receiptNumber },
                { label: t('detail.pocket'), value: pocketLabel(fund.pockets, voucher.pocket) },
                { label: t('drawer.taxInvoice'), value: voucher.taxInvoiceNumber },
                { label: t('drawer.vendorTaxId'), value: voucher.vendorTaxId },
                { label: t('drawer.description'), value: voucher.description, wide: true },
              ]}
            />
          </DetailSection>

          <DetailSection title={t('drawer.lines')}>
            <Stack gap="sm">
              <LineItems
                items={voucher.lines.map((line) => ({
                  key: String(line.lineNo),
                  title: line.expenseAccount
                    ? `${line.expenseAccount.accountNumber} · ${line.expenseAccount.name}`
                    : line.description,
                  subtitle: [
                    line.expenseAccount ? line.description : null,
                    line.tagIds.length > 0
                      ? t('detail.tagsLine', { names: tagNames(line.tagIds) })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  amount: money(line.amount),
                  amountHint: line.tax
                    ? t('detail.taxOnLine', { name: line.tax.name, amount: money(line.taxAmount) })
                    : undefined,
                }))}
              />
              <AmountRows
                rows={[
                  ...(totals.reconciles
                    ? [
                        { label: t('drawer.net'), value: money(totals.net) },
                        { label: t('drawer.tax'), value: money(totals.tax) },
                      ]
                    : []),
                  { label: t('drawer.total'), value: money(voucher.totalAmount), total: true },
                ]}
              />
            </Stack>
          </DetailSection>

          <VoucherAttachmentsPanel voucher={voucher} fund={fund} />
          <JourneySection steps={voucherJourney(voucher)} />
          <AuditTimeline entityType="VOUCHER" entityId={voucher.id} />
        </>
      )}
    </DocumentDrawer>
  );
}
