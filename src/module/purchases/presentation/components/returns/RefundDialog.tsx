import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PurchaseReturn } from '@/module/purchases/domain/purchaseDocuments';
import {
  hasRefundErrors,
  toRefundInput,
  validateRefund,
  type RefundFormValues,
} from '@/module/purchases/domain/returnForm';
import { DepositAccountField } from '@/module/purchases/presentation/components/payments/DepositAccountField';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { formatAmount, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { useRefundReturn } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

interface RefundDialogProps {
  doc: PurchaseReturn;
  opened: boolean;
  onClose: () => void;
}

/** The vendor pays money back: it lands in the chosen account, up to what is still owed on the return. */
export const RefundDialog = ({ doc, opened, onClose }: Readonly<RefundDialogProps>) => {
  const { t } = useTranslation('purchases');
  const refund = useRefundReturn();
  const [showErrors, setShowErrors] = useState(false);
  const [values, setValues] = useState<RefundFormValues>({
    date: todayIso() > doc.date ? todayIso() : doc.date,
    depositAccountId: '',
    amount: doc.creditRemaining,
  });
  const errors = validateRefund(values, doc.creditRemaining);
  const patch = (next: Partial<RefundFormValues>) =>
    setValues((current) => ({ ...current, ...next }));

  const confirm = () => {
    if (hasRefundErrors(errors)) {
      setShowErrors(true);
      return;
    }
    refund.mutate({ id: doc.id, input: toRefundInput(values) }, { onSuccess: onClose });
  };

  let amountError: string | undefined;
  if (showErrors && errors.amount) {
    amountError =
      errors.amount === 'amountTooHigh'
        ? t('returns.detail.refundAmountTooHigh', { max: formatAmount(doc.creditRemaining) })
        : t('returns.detail.refundAmountInvalid');
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('returns.detail.refundTitle')}
      centered
      radius="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('returns.detail.refundDescription', { amount: formatAmount(doc.creditRemaining) })}
        </Text>
        <DateField
          withAsterisk
          label={t('returns.detail.refundDate')}
          value={values.date}
          minDate={undefined}
          onChange={(value) => patch({ date: value })}
          error={showErrors && errors.date ? t('returns.detail.refundDateRequired') : undefined}
        />
        <DepositAccountField
          withAsterisk
          label={t('returns.detail.refundDeposit')}
          value={values.depositAccountId}
          onChange={(id) => patch({ depositAccountId: id })}
          error={
            showErrors && errors.depositAccountId
              ? t('returns.detail.refundDepositRequired')
              : undefined
          }
        />
        <NumberInput
          radius="md"
          withAsterisk
          label={t('returns.detail.refundAmount')}
          value={values.amount}
          min={0}
          hideControls
          allowNegative={false}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          prefix="Rp "
          onChange={(value) => patch({ amount: typeof value === 'number' ? value : '' })}
          error={amountError}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" disabled={refund.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button loading={refund.isPending} onClick={confirm}>
            {t('returns.detail.refundConfirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
