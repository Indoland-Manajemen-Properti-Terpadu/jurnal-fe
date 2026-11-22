import { useState } from 'react';
import { Button, Grid, Group, Stack, Text } from '@mantine/core';
import {
  IconClipboardText,
  IconDeviceFloppy,
  IconListDetails,
  IconSend,
  IconShoppingCartPlus,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { canCreateRequest, requestRights } from '@/module/purchases/domain/requestAccess';
import {
  emptyRequestForm,
  hasRequestErrors,
  requestToForm,
  toRequestInput,
  validateRequestForm,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';
import { SubmitRequestDialog } from '@/module/purchases/presentation/components/requests/SubmitRequestDialog';
import { RequestInfoSection } from '@/module/purchases/presentation/components/requests/RequestInfoSection';
import { RequestIomSection } from '@/module/purchases/presentation/components/requests/RequestIomSection';
import { RequestItemsEditor } from '@/module/purchases/presentation/components/requests/RequestItemsEditor';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatDay, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCreateRequest,
  useSubmitRequest,
  useUpdateRequest,
  useUploadAttachments,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import {
  useDepartmentOptions,
  useRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailOf = (id: string) => routes.purchases.requestDetail.replace(':id', id);

interface FormBodyProps {
  existing?: PurchaseRequest;
}

const RequestFormBody = ({ existing }: Readonly<FormBodyProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<RequestFormValues>(() =>
    existing ? requestToForm(existing) : emptyRequestForm(todayIso())
  );
  const [iomFiles, setIomFiles] = useState<File[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const create = useCreateRequest();
  const update = useUpdateRequest();
  const submit = useSubmitRequest();
  const upload = useUploadAttachments();
  const departments = useDepartmentOptions();

  // An inactive department a request already uses stays listed, so editing does not blank it.
  const departmentOptions = [...(departments.data ?? [])];
  if (existing?.department && !departmentOptions.some((d) => d.id === existing.department?.id)) {
    departmentOptions.unshift(existing.department);
  }

  const errors = validateRequestForm(values);
  const set = <K extends keyof RequestFormValues>(key: K, value: RequestFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  /** Submitting asks for one last look first; a form with mistakes shows them instead. */
  const askSubmit = () => {
    if (hasRequestErrors(errors)) {
      setShowErrors(true);
      return;
    }
    setConfirming(true);
  };

  /** Saves the request, sends the chosen IOM files, then optionally submits it. */
  const save = async (thenSubmit: boolean) => {
    if (hasRequestErrors(errors)) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    let id = existing?.id;
    try {
      const input = toRequestInput(values);
      const saved = existing
        ? await update.mutateAsync({ id: existing.id, input })
        : await create.mutateAsync(input);
      id = saved.id;
    } catch {
      setSaving(false);
      return;
    }
    if (iomFiles.length > 0) {
      await upload
        .mutateAsync({ target: 'request', id, files: iomFiles, requestFile: 'iom' })
        .catch(() => undefined);
    }
    if (thenSubmit) {
      await submit.mutateAsync({ id }).catch(() => undefined);
    }
    setSaving(false);
    navigate(detailOf(id));
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
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack gap="lg">
            <RequestInfoSection
              values={values}
              errors={errors}
              showErrors={showErrors}
              departments={departmentOptions}
              departmentsLoading={departments.isLoading}
              onChange={set}
            />
            <RequestIomSection
              values={values}
              errors={errors}
              showErrors={showErrors}
              stored={existing?.iom.attachments ?? []}
              files={iomFiles}
              onChange={set}
              onFilesChange={setIomFiles}
            />
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

        <Grid.Col span={{ base: 12, lg: 3 }} pos="sticky" top={20}>
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
                  {t('requests.form.requiredDate')}
                </Text>
                <Text size="sm" fw={600}>
                  {formatDay(values.requiredDate, currentLanguage)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                {t('requests.form.nextStep')}
              </Text>
            </Stack>
            <Stack gap="xs">
              <Button
                fullWidth
                leftSection={<IconSend size={16} />}
                loading={saving}
                onClick={askSubmit}
              >
                {existing?.status === 'RETURNED'
                  ? t('requests.form.saveResubmit')
                  : t('requests.form.saveSubmit')}
              </Button>
              <Button
                fullWidth
                variant="default"
                leftSection={<IconDeviceFloppy size={16} />}
                disabled={saving}
                onClick={() => save(false)}
              >
                {existing ? t('common.save') : t('common.saveDraft')}
              </Button>
              <Button
                fullWidth
                variant="subtle"
                color="gray"
                disabled={saving}
                onClick={() =>
                  navigate(existing ? detailOf(existing.id) : routes.purchases.requests)
                }
              >
                {t('common.cancel')}
              </Button>
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
      <SubmitRequestDialog
        opened={confirming}
        values={values}
        departmentName={departmentOptions.find((d) => d.id === values.departmentId)?.name ?? ''}
        loading={saving}
        onClose={() => setConfirming(false)}
        onConfirm={() => save(true)}
      />
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
  if (!id) {
    return canCreateRequest(can) ? <RequestFormBody /> : <StateFrame kind="noAccess" />;
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
  if (!requestRights(can, request.data.isOwner).edit) {
    return <StateFrame kind="noAccess" backTo={detailOf(request.data.id)} />;
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
