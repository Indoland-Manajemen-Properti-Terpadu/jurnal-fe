import { useState } from 'react';
import { Button, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
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

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const PROOF_TYPES = [MIME_TYPES.pdf, MIME_TYPES.png, MIME_TYPES.jpeg];

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
  const [proofFiles, setProofFiles] = useState<File[]>([]);
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
  const errors = validatePayForm(values, doc.attachments.length > 0 || proofFiles.length > 0);
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
    pay.mutate(
      { id: doc.id, input: toPayInput({ ...values, paidAt }), proofFiles },
      { onSuccess: onClose }
    );
  };

  const addProofFiles = (added: File[]) => {
    const existingNames = new Set(doc.attachments.map((file) => file.name));
    const next = [
      ...proofFiles,
      ...added.filter(
        (file) =>
          !existingNames.has(file.name) && !proofFiles.some((item) => item.name === file.name)
      ),
    ];
    if (doc.attachments.length + next.length > MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: MAX_FILES }),
      });
      return;
    }
    if (next.some((file) => file.size > MAX_FILE_BYTES)) {
      notifications.show({ color: 'orange', message: t('attachments.tooLarge') });
      return;
    }
    setProofFiles(next);
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={t('payments.detail.payTitle')}
      description={t('payments.detail.payDescription', { amount: formatAmount(doc.totalAmount) })}
      footer={
        <>
          <Button variant="default" disabled={pay.isPending} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button loading={pay.isPending} onClick={confirm}>
            {t('payments.detail.payConfirm')}
          </Button>
        </>
      }
    >
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
        withAsterisk
        maxLength={100}
        onChange={(event) => patch({ referenceNumber: event.currentTarget.value })}
        error={
          showErrors && errors.referenceNumber ? t('payments.detail.referenceRequired') : undefined
        }
      />
      <Stack gap={6}>
        {doc.attachments.length > 0 && (
          <Text size="xs" c="dimmed">
            {t('payments.detail.existingProof', { count: doc.attachments.length })}
          </Text>
        )}
        <CustomDropzone
          title={`${t('payments.detail.transferProof')} *`}
          description={t('payments.detail.transferProofHint')}
          subDescription={t('attachments.limit')}
          accept={PROOF_TYPES}
          aria-label={t('payments.detail.transferProof')}
          maxSize={MAX_FILE_BYTES}
          files={proofFiles}
          uploadedTitle={t('payments.detail.proofChosen')}
          handleDrop={addProofFiles}
          onReject={() =>
            notifications.show({ color: 'orange', message: t('attachments.tooLarge') })
          }
          onRemoveFile={(name) =>
            setProofFiles((current) => current.filter((file) => file.name !== name))
          }
        />
        {showErrors && errors.attachments && (
          <Text size="xs" c="red" role="alert">
            {t('payments.detail.attachmentRequired')}
          </Text>
        )}
      </Stack>
    </ModalFrame>
  );
};
