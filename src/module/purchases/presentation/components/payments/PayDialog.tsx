import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  hasPayErrors,
  toPayInput,
  validatePayForm,
  type PayFormValues,
} from '@/module/purchases/domain/paymentForm';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { DepositAccountField } from '@/module/purchases/presentation/components/payments/DepositAccountField';
import { PaymentMethodField } from '@/module/purchases/presentation/components/payments/PaymentMethodField';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import {
  formatAmount,
  fromIsoDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';
import { useVoucherMinDate } from '@/module/purchases/presentation/hooks/useVoucherMinDate';
import { usePayVoucher } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

interface PayDialogProps {
  doc: PaymentVoucher;
  opened: boolean;
  onClose: () => void;
}

/** Paying is the one step that moves money, so it asks for the account, the date and the fee. */
export const PayDialog = ({ doc, opened, onClose }: Readonly<PayDialogProps>) => {
  const { t } = useTranslation('purchases');
  const pay = usePayVoucher();
  const [showErrors, setShowErrors] = useState(false);
  const minDate = useVoucherMinDate(doc);
  const [edited, setEdited] = useState(false);
  const earliest = [doc.date, minDate].reduce((a, b) => (b > a ? b : a), '');
  const [values, setValues] = useState<PayFormValues>({
    paidAt: todayIso() > earliest ? todayIso() : earliest,
    depositAccountId: doc.depositAccountId ?? '',
    paymentMethodId: doc.paymentMethod?.id ?? '',
    adminFee: '',
    referenceNumber: doc.referenceNumber,
  });
  const errors = validatePayForm(values);
  const patch = (next: Partial<PayFormValues>) => {
    if (next.paidAt !== undefined) setEdited(true);
    setValues((current) => ({ ...current, ...next }));
  };
  // The bills load after the dialog opens; until the date is touched it follows the latest bill date.
  const paidAt = !edited && values.paidAt < minDate ? minDate : values.paidAt;

  const confirm = () => {
    if (hasPayErrors(errors)) {
      setShowErrors(true);
      return;
    }
    pay.mutate({ id: doc.id, input: toPayInput({ ...values, paidAt }) }, { onSuccess: onClose });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('payments.detail.payTitle')}
      centered
      radius="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('payments.detail.payDescription', { amount: formatAmount(doc.totalAmount) })}
        </Text>
        <DateField
          withAsterisk
          label={t('payments.detail.paidAt2')}
          value={paidAt}
          minDate={minDate ? (fromIsoDay(minDate) ?? undefined) : undefined}
          onChange={(value) => patch({ paidAt: value })}
          error={showErrors && errors.paidAt ? t('payments.detail.paidAtRequired') : undefined}
        />
        <PaymentMethodField
          value={values.paymentMethodId}
          onChange={(id) => patch({ paymentMethodId: id })}
        />
        <DepositAccountField
          withAsterisk
          value={values.depositAccountId}
          onChange={(id) => patch({ depositAccountId: id })}
          error={
            showErrors && errors.depositAccountId ? t('payments.detail.depositRequired') : undefined
          }
        />
        <NumberInput
          radius="md"
          label={t('payments.detail.adminFee')}
          description={t('payments.detail.adminFeeHint')}
          value={values.adminFee}
          min={0}
          hideControls
          allowNegative={false}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          prefix="Rp "
          onChange={(value) => patch({ adminFee: typeof value === 'number' ? value : '' })}
          error={showErrors && errors.adminFee ? t('payments.detail.adminFeeInvalid') : undefined}
        />
        <TextInput
          radius="md"
          label={t('payments.form.reference')}
          placeholder={t('payments.form.referencePlaceholder')}
          value={values.referenceNumber}
          maxLength={100}
          onChange={(event) => patch({ referenceNumber: event.currentTarget.value })}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" disabled={pay.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button loading={pay.isPending} onClick={confirm}>
            {t('payments.detail.payConfirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
