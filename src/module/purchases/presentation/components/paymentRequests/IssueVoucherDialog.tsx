import { useState } from 'react';
import { Alert, Box, Button, Group, Paper, Radio, Stack, Text, Textarea } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { toApiError } from '@/lib/http/apiError';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import {
  emptyPaymentForm,
  hasPaymentErrors,
  issueOptions,
  scopeAmount,
  toPaymentInput,
  toReadyRequest,
  validatePaymentForm,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import { vendorLabel, type PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { DepositAccountField } from '@/module/purchases/presentation/components/payments/DepositAccountField';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { formatAmount, todayIso } from '@/module/purchases/presentation/components/shared/format';
import {
  useCreatePayment,
  useCreatePaymentsByVendor,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';

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
  // A request with several vendors gets a voucher per vendor, so the page to see is the request.
  const here = request.isMultiVendor ? detailPath('paymentRequest', request.id) : undefined;
  // A refusal is shown in the dialog, in the service's own words, so it can be fixed from here.
  const shown = () => true;
  const create = useCreatePayment((doc) => navigate(here ?? detailPath('payment', doc.id)), shown);
  const createByVendor = useCreatePaymentsByVendor(() => navigate(here ?? '/'), shown);
  const describe = usePurchaseErrorMessage();
  const failure = create.error ?? createByVendor.error;
  const { allAtOnce, pending } = issueOptions(request);
  const [scope, setScope] = useState<string>(allAtOnce ? 'all' : (pending[0]?.vendorId ?? 'all'));
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
    if (!request.isMultiVendor) {
      create.mutate(toPaymentInput(values, picked));
    } else if (scope === 'all') {
      createByVendor.mutate(toPaymentInput(values, picked));
    } else {
      create.mutate(toPaymentInput(values, picked, scope));
    }
  };
  const busy = create.isPending || createByVendor.isPending;
  const amount = request.isMultiVendor ? scopeAmount(request, scope) : request.amount;

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="lg"
      title={t('paymentRequests.issue.title')}
      description={`${request.number} · ${vendorLabel(request)}`}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button loading={busy} onClick={submit}>
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
            {formatAmount(amount)}
          </Text>
        </Group>
      </Paper>
      {request.isMultiVendor && (
        <Radio.Group
          label={t('paymentRequests.issue.scope')}
          description={t('paymentRequests.issue.scopeHint')}
          value={scope}
          onChange={(next) => {
            setScope(next);
            create.reset();
            createByVendor.reset();
          }}
        >
          <Stack gap="xs" mt="xs">
            {allAtOnce && (
              <Radio
                value="all"
                label={t('paymentRequests.issue.scopeAll', { count: pending.length })}
              />
            )}
            {pending.map((vendor) => (
              <Radio
                key={vendor.vendorId}
                value={vendor.vendorId}
                label={t('paymentRequests.issue.scopeOne', {
                  name: vendor.vendorName,
                  amount: formatAmount(vendor.amount),
                })}
              />
            ))}
          </Stack>
        </Radio.Group>
      )}
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
            {vendorLabel(request) || '-'}
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
            {formatAmount(amount)}
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
      {Boolean(failure) && (
        <Alert color="red" variant="light" radius="md" role="alert">
          {toApiError(failure).validationMessage ?? describe(failure)}
        </Alert>
      )}
      <Paper radius="md" p="md" bg="primary.0">
        <Text size="sm">{t('paymentRequests.issue.note')}</Text>
      </Paper>
    </ModalFrame>
  );
};

const currentKind = (request: PaymentRequest, t: (key: string) => string): string =>
  t(`paymentRequests.kinds.${request.kind}`);
