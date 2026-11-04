import { Button } from '@mantine/core';
import { IconDeviceFloppy, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  approvalHint,
  attachmentRequired,
  cashCheck,
} from '@/module/petty-cash/domain/voucherForm';
import type { AmountRow } from '@/module/petty-cash/presentation/components/DetailKit';
import { FormSummaryCard } from '@/module/petty-cash/presentation/components/FormSummaryCard';

interface Props {
  fund: PettyCashFund;
  net: number;
  /** A line uses a tax code, so the saved total will be higher than the net shown. */
  hasTax: boolean;
  hasAttachment: boolean;
  pending: boolean;
  showIssues: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

/** Live effect of the voucher on the fund, and the two ways to save it. Server figures stay authoritative. */
export function VoucherFormSummary({
  fund,
  net,
  hasTax,
  hasAttachment,
  pending,
  showIssues,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const cash = cashCheck(net, fund.balance.availableCash);
  const needsReceipt = attachmentRequired(net, fund.settings.attachmentRequiredThreshold);
  const receiptMissing = needsReceipt && !hasAttachment;
  const approval = approvalHint(net, fund.settings.voucherApprovalThreshold, hasTax);

  const rows: AmountRow[] = [
    { label: t('form.fund'), value: `${fund.code} · ${fund.name}` },
    { label: t('form.availableCash'), value: money(fund.balance.availableCash) },
    { label: t('form.net'), value: money(net), total: true },
    ...(net > 0 && !cash.exceeds
      ? [
          {
            label: t(hasTax ? 'form.remainingBeforeTax' : 'form.remaining'),
            value: money(cash.remaining),
          },
        ]
      : []),
  ];

  const notes = [t('form.taxNote')];
  if (cash.exceeds) notes.push(t('form.exceedsBody'));
  if (approval !== 'NONE') {
    notes.push(
      t(approval === 'REQUIRED' ? 'form.approvalNeeded' : 'form.approvalPossible', {
        threshold: money(fund.settings.voucherApprovalThreshold),
      })
    );
  }

  let issuesText: string | undefined;
  if (cash.exceeds) issuesText = t('form.exceedsTitle');
  else if (showIssues) issuesText = t('form.fixIssues');

  return (
    <FormSummaryCard
      title={t('form.summaryTitle')}
      rows={rows}
      notes={notes}
      status={
        receiptMissing
          ? {
              tone: 'warning',
              text: t('form.attachmentNeeded', {
                threshold: money(fund.settings.attachmentRequiredThreshold),
              }),
            }
          : undefined
      }
      issuesText={issuesText}
    >
      <Button
        leftSection={<IconSend size={16} />}
        loading={pending}
        disabled={cash.exceeds || receiptMissing}
        onClick={onSubmit}
        fullWidth
      >
        {t('form.submit')}
      </Button>
      <Button
        variant="default"
        leftSection={<IconDeviceFloppy size={16} />}
        disabled={pending}
        onClick={onSaveDraft}
        fullWidth
      >
        {t('form.saveDraft')}
      </Button>
      <Button variant="subtle" color="gray" disabled={pending} onClick={onCancel} fullWidth>
        {t('form.cancel')}
      </Button>
    </FormSummaryCard>
  );
}
