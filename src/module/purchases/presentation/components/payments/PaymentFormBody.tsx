import { useState } from 'react';
import { Grid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { IconClipboardText, IconListDetails, IconSum, IconWallet } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  emptyPaymentForm,
  hasPaymentErrors,
  toPaymentInput,
  toReadyRequest,
  validatePaymentForm,
  voucherTotal,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { DepositAccountField } from '@/module/purchases/presentation/components/payments/DepositAccountField';
import { PaymentMethodField } from '@/module/purchases/presentation/components/payments/PaymentMethodField';
import { ReadyRequestsTable } from '@/module/purchases/presentation/components/payments/ReadyRequestsTable';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { MoneyRows } from '@/module/purchases/presentation/components/shared/MoneyRows';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { useCreatePayment } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePaymentRequests } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.payments;

/** Issues a voucher from approved Payment Requests that are ready to pay. */
export const PaymentFormBody = ({ initialRequest }: Readonly<{ initialRequest?: string }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<PaymentFormValues>(emptyPaymentForm(todayIso()));
  const [pickedIds, setPickedIds] = useState<string[]>(initialRequest ? [initialRequest] : []);
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreatePayment((doc) => navigate(detailPath('payment', doc.id)));

  const ready = usePaymentRequests({ status: 'APPROVED', ready: true, limit: 100 });
  const requests = (ready.data?.items ?? []).map(toReadyRequest);
  const picked = requests.filter((request) => pickedIds.includes(request.id));
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
    <PageFrame
      icon={IconWallet}
      title={t('payments.form.title')}
      description={t('payments.form.subtitle')}
      backTo={BACK}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconListDetails}
              title={t('payments.form.requestsTitle')}
              subtitle={t('payments.form.requestsSubtitle')}
            >
              {ready.isLoading && (
                <Text size="sm" c="dimmed">
                  {t('payments.form.loading')}
                </Text>
              )}
              {!ready.isLoading && requests.length === 0 && (
                <Text size="sm" c="dimmed">
                  {t('payments.form.none')}
                </Text>
              )}
              {requests.length > 0 && (
                <ReadyRequestsTable
                  requests={requests}
                  picked={pickedIds}
                  onChange={setPickedIds}
                />
              )}
              {showErrors && errors.requests && (
                <Text size="sm" c="red" role="alert">
                  {t('payments.form.noRequests')}
                </Text>
              )}
            </SectionCard>

            <SectionCard
              icon={IconClipboardText}
              title={t('payments.form.infoTitle')}
              subtitle={t('payments.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('payments.form.date')}
                    value={values.date}
                    onChange={(value) => patch({ date: value })}
                    error={showErrors && errors.date ? t('payments.form.dateRequired') : undefined}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('payments.form.reference')}
                    placeholder={t('payments.form.referencePlaceholder')}
                    value={values.referenceNumber}
                    maxLength={100}
                    onChange={(event) => patch({ referenceNumber: event.currentTarget.value })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <PaymentMethodField
                    value={values.paymentMethodId}
                    onChange={(id) => patch({ paymentMethodId: id })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DepositAccountField
                    value={values.depositAccountId}
                    onChange={(id) => patch({ depositAccountId: id })}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    radius="md"
                    label={t('common.memo')}
                    value={values.memo}
                    minRows={2}
                    autosize
                    maxLength={500}
                    onChange={(event) => patch({ memo: event.currentTarget.value })}
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <SectionCard icon={IconSum} title={t('payments.form.summaryTitle')}>
            <Text size="sm">
              {picked.length > 0
                ? t('payments.form.summaryCount', { count: picked.length })
                : t('payments.form.summaryNone')}
            </Text>
            <MoneyRows
              rows={[
                {
                  label: t('payments.form.total'),
                  amount: formatAmount(voucherTotal(picked)),
                  emphasis: 'total',
                },
              ]}
            />
            <Text size="xs" c="dimmed">
              {t('payments.form.draftNote')}
            </Text>
            {showErrors && hasPaymentErrors(errors) && (
              <Text size="xs" c="red" role="alert">
                {t('payments.form.fixErrors')}
              </Text>
            )}
            <FormActions
              loading={create.isPending}
              submitLabel={t('payments.form.save')}
              onSubmit={submit}
              onCancel={() => navigate(BACK)}
            />
          </SectionCard>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};
