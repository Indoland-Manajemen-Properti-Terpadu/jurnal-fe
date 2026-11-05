import { Accordion, Stack, Text } from '@mantine/core';
import { IconBulb, IconSum } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { cashOut } from '@/module/purchases/domain/paymentForm';
import { MoneyRows } from '@/module/purchases/presentation/components/shared/MoneyRows';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface PaymentSummaryCardProps {
  isAdvance: boolean;
  billCount: number;
  total: number;
  adminFee: number;
  submitLabel: string;
  loading: boolean;
  blockedReason: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}

/** What this voucher will move once it is paid; saving only keeps a draft. */
export const PaymentSummaryCard = ({
  isAdvance,
  billCount,
  total,
  adminFee,
  submitLabel,
  loading,
  blockedReason,
  onSubmit,
  onCancel,
}: Readonly<PaymentSummaryCardProps>) => {
  const { t } = useTranslation('purchases');
  const hasAmount = total > 0;

  return (
    <SectionCard icon={IconSum} title={t('payments.form.summaryTitle')}>
      <Stack gap="xs">
        <Text size="sm">
          {!isAdvance && billCount > 0
            ? t('payments.form.summaryBills', { count: billCount })
            : hasAmount
              ? t('payments.form.advanceTitle')
              : t('payments.form.summaryNone')}
        </Text>
        <MoneyRows
          rows={[
            { label: t('payments.form.totalLabel'), amount: formatAmount(total) },
            ...(adminFee > 0
              ? [{ label: t('payments.form.feeLabel'), amount: formatAmount(adminFee) }]
              : []),
            {
              label: t('payments.form.cashOutLabel'),
              amount: formatAmount(cashOut(total, adminFee)),
              emphasis: 'total' as const,
            },
          ]}
        />
      </Stack>

      <Accordion variant="contained" radius="md">
        <Accordion.Item value="impact">
          <Accordion.Control icon={<IconBulb size={16} />}>
            <Text size="sm" fw={600}>
              {t('payments.form.impactTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" c="dimmed" lh={1.55}>
              {isAdvance ? t('payments.form.impactAdvance') : t('payments.form.impactBody')}
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Text size="xs" c="dimmed">
        {t('payments.form.draftNote')}
      </Text>
      {blockedReason && (
        <Text size="xs" c="red" role="alert">
          {blockedReason}
        </Text>
      )}
      <FormActions
        loading={loading}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </SectionCard>
  );
};
