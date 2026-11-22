import { useState } from 'react';
import { Box, Button, Group, Paper, Text, Textarea } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import {
  emptyPaymentForm,
  hasPaymentErrors,
  toPaymentInput,
  toReadyRequest,
  validatePaymentForm,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { DepositAccountField } from '@/module/purchases/presentation/components/payments/DepositAccountField';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { formatAmount, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { useCreatePayment } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

interface IssueVoucherDialogProps {
  request: PaymentRequest;
  opened: boolean;
  onClose: () => void;
}

/**
 * "Terbitkan Payment Voucher" from an approved Payment Request, as in the reference web: the amount,
 * who is paid, the voucher date, the account it is paid from. Issuing it only orders the payment; the
 * money moves when the voucher is paid.
 */
export const IssueVoucherDialog = ({
  request,
  opened,
  onClose,
}: Readonly<IssueVoucherDialogProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const create = useCreatePayment((doc) => navigate(detailPath('payment', doc.id)));
  const [showErrors, setShowErrors] = useState(false);
  const [values, setValues] = useState<PaymentFormValues>(emptyPaymentForm(todayIso()));
  const picked = [toReadyRequest(request)];
  const errors = validatePaymentForm(values, picked);
  const patch = (next: Partial<PaymentFormValues>) =>
    setValues((current) => ({ ...current, ...next }));

  const submit = () => {
    if (hasPaymentErrors(errors)) {
      setShowErrors(true);
      return;
    }
    create.mutate(toPaymentInput(values, picked));
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="lg"
      title={t('paymentRequests.issue.title')}
      description={`${request.number} · ${request.vendor?.name ?? ''}`}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={create.isPending}>
            {t('common.cancel')}
          </Button>
          <Button loading={create.isPending} onClick={submit}>
            {t('paymentRequests.issue.confirm')}
          </Button>
        </>
      }
    >
      <Paper radius="md" p="md" bg="primary.0">
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text size="sm" fw={600} c="primary.8">
              {t('paymentRequests.issue.amountLabel')}
            </Text>
            <Text size="xs" c="dimmed">
              {currentKind(request, t)}
            </Text>
          </div>
          <Text fz={24} fw={700} c="primary.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAmount(request.amount)}
          </Text>
        </Group>
      </Paper>
      <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <Box px="md" py="xs" bg="var(--jurnal-color-surface-muted)">
          <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
            {t('paymentRequests.issue.payTo')}
          </Text>
        </Box>
        <Group justify="space-between" px="md" py="sm">
          <Text size="sm" c="dimmed">
            {t('paymentRequests.detail.vendor')}
          </Text>
          <Text size="sm" fw={700}>
            {request.vendor?.name ?? '-'}
          </Text>
        </Group>
        <Group
          justify="space-between"
          px="md"
          py="sm"
          style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
        >
          <Text size="sm" c="dimmed">
            {t('paymentRequests.issue.voucherValue')}
          </Text>
          <Text size="sm" fw={700}>
            {formatAmount(request.amount)}
          </Text>
        </Group>
      </Paper>
      <Group grow align="flex-start">
        <DateField
          withAsterisk
          label={t('paymentRequests.issue.date')}
          value={values.date}
          onChange={(value) => patch({ date: value })}
          error={showErrors && errors.date ? t('payments.form.dateRequired') : undefined}
        />
        <DepositAccountField
          label={t('paymentRequests.issue.paidFrom')}
          value={values.depositAccountId}
          onChange={(id) => patch({ depositAccountId: id })}
        />
      </Group>
      <Textarea
        radius="md"
        label={t('common.memo')}
        placeholder={t('paymentRequests.issue.memoPlaceholder')}
        value={values.memo}
        minRows={3}
        autosize
        maxLength={500}
        onChange={(event) => patch({ memo: event.currentTarget.value })}
      />
      <Paper radius="md" p="md" bg="primary.0">
        <Text size="sm">{t('paymentRequests.issue.note')}</Text>
      </Paper>
    </ModalFrame>
  );
};

const currentKind = (request: PaymentRequest, t: (key: string) => string): string =>
  t(`paymentRequests.kinds.${request.kind}`);
