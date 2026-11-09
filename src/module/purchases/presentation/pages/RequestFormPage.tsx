import { useState } from 'react';
import { Grid, Group, Stack, Text, TextInput, Textarea } from '@mantine/core';
import {
  IconClipboardText,
  IconListDetails,
  IconRoute,
  IconShoppingCartPlus,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import {
  emptyRequestForm,
  hasRequestErrors,
  requestToForm,
  toRequestInput,
  validateRequestForm,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { RequestItemsEditor } from '@/module/purchases/presentation/components/requests/RequestItemsEditor';
import { RequestModeCards } from '@/module/purchases/presentation/components/requests/RequestModeCards';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCreateRequest,
  useUpdateRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailOf = (id: string) => routes.purchases.requestDetail.replace(':id', id);

interface FormBodyProps {
  existing?: PurchaseRequest;
}

const RequestFormBody = ({ existing }: Readonly<FormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<RequestFormValues>(() =>
    existing ? requestToForm(existing) : emptyRequestForm(todayIso())
  );
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateRequest((doc) => navigate(detailOf(doc.id)));
  const update = useUpdateRequest((doc) => navigate(detailOf(doc.id)));
  const pending = create.isPending || update.isPending;

  const errors = validateRequestForm(values);
  const set = <K extends keyof RequestFormValues>(key: K, value: RequestFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (hasRequestErrors(errors)) {
      setShowErrors(true);
      return;
    }
    const input = toRequestInput(values);
    if (existing) update.mutate({ id: existing.id, input });
    else create.mutate(input);
  };

  return (
    <PageFrame
      icon={IconShoppingCartPlus}
      title={
        existing
          ? t('requests.form.titleEdit', { number: existing.number })
          : t('requests.form.titleCreate')
      }
      description={existing ? t('requests.form.subtitleEdit') : t('requests.form.subtitleCreate')}
      backTo={existing ? detailOf(existing.id) : routes.purchases.requests}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('requests.form.infoTitle')}
              subtitle={t('requests.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('requests.form.date')}
                    value={values.transactionDate}
                    onChange={(value) => set('transactionDate', value)}
                    error={
                      showErrors && errors.transactionDate
                        ? t('requests.form.dateRequired')
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    label={t('requests.form.requiredDate')}
                    value={values.requiredDate}
                    minDate={values.transactionDate || undefined}
                    clearable
                    onChange={(value) => set('requiredDate', value)}
                    error={
                      showErrors && errors.requiredDate
                        ? t('requests.form.requiredBeforeDate')
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('common.department')}
                    placeholder={t('requests.form.departmentPlaceholder')}
                    value={values.department}
                    maxLength={100}
                    onChange={(event) => set('department', event.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('common.purpose')}
                    placeholder={t('requests.form.purposePlaceholder')}
                    value={values.purpose}
                    maxLength={255}
                    onChange={(event) => set('purpose', event.currentTarget.value)}
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
                    onChange={(event) => set('memo', event.currentTarget.value)}
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>

            <SectionCard
              icon={IconRoute}
              title={t('requests.form.modeTitle')}
              subtitle={t('requests.form.modeSubtitle')}
            >
              <RequestModeCards value={values.mode} onChange={(mode) => set('mode', mode)} />
            </SectionCard>

            <SectionCard
              icon={IconListDetails}
              title={t('requests.form.itemsTitle')}
              subtitle={t('requests.form.itemsSubtitle')}
            >
              <RequestItemsEditor
                items={values.items}
                errors={errors}
                showErrors={showErrors}
                onChange={(items) => set('items', items)}
              />
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <SectionCard icon={IconClipboardText} title={t('requests.form.summaryTitle')}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('requests.form.summaryItems')}
                </Text>
                <Text size="sm" fw={600}>
                  {values.items.length}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('requests.form.summaryMode')}
                </Text>
                <Text size="sm" fw={600}>
                  {t(`requests.form.mode.${values.mode}`)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                {t('requests.form.nextStep')}
              </Text>
            </Stack>
            <FormActions
              loading={pending}
              submitLabel={existing ? t('common.save') : t('common.saveDraft')}
              onSubmit={submit}
              onCancel={() =>
                navigate(existing ? detailOf(existing.id) : routes.purchases.requests)
              }
            />
          </SectionCard>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};

export default function RequestFormPage() {
  const { id } = useParams();
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const { t } = useTranslation('purchases');
  const request = useRequest(id);

  if (accessLoading || (id && request.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.documents, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" />;
  }
  if (!id) {
    return <RequestFormBody />;
  }
  if (request.isError) {
    return request.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" />
    ) : (
      <StateFrame
        kind="error"
        onRetry={() => {
          request.refetch();
        }}
      />
    );
  }
  if (!request.data) {
    return <StateFrame kind="loading" />;
  }
  if (!requestActions(request.data).edit) {
    return (
      <StateFrame
        kind="blocked"
        title={t('requests.form.notEditableTitle')}
        description={t('requests.form.notEditableDescription')}
        backTo={detailOf(request.data.id)}
      />
    );
  }
  return <RequestFormBody key={request.data.id} existing={request.data} />;
}
