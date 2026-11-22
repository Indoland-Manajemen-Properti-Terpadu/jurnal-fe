import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import {
  WAREHOUSE_LIMITS,
  emptyWarehouseInput,
  toWarehouseInput,
  toWarehousePayload,
  validateWarehouse,
  type Warehouse,
  type WarehouseInput,
} from '@/module/inventory/domain/warehouse';
import { WarehouseConfirmDialog } from '@/module/inventory/presentation/components/warehouses/WarehouseActionDialogs';
import {
  usePicOptions,
  useWarehouseErrorMessage,
  useWarehouseMutations,
} from '@/module/inventory/presentation/hooks/useWarehouses';

type Props = {
  opened: boolean;
  /** The warehouse being edited; null opens an empty form for a new one. */
  warehouse: Warehouse | null;
  onClose: () => void;
};

const FORM_ID = 'warehouse-form';

/** The service says which field clashed in its sentence; only these two are fields of the form. */
const clashField = (error: unknown): 'name' | 'code' | null => {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const message = (error.serverMessage ?? '').toLowerCase();
  if (message.includes('nama')) return 'name';
  if (message.includes('kode')) return 'code';
  return null;
};

export function WarehouseFormModal({ opened, warehouse, onClose }: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const describe = useWarehouseErrorMessage();
  const { create, update } = useWarehouseMutations();
  const pic = usePicOptions(opened);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const saving = create.isPending || update.isPending;
  const failure = create.error ?? update.error;
  const clash = clashField(failure);
  const editing = warehouse !== null;
  const alreadyDefault = warehouse?.isDefault === true;

  const form = useForm<WarehouseInput>({
    initialValues: emptyWarehouseInput(),
    validate: (values) => {
      const issues = validateWarehouse(values, { codeOptional: !editing });
      const message = (key?: string) => (key ? t(`validation.${key}`) : null);
      return {
        code: message(issues.code),
        name: message(issues.name),
        phone: message(issues.phone),
      };
    },
  });

  useEffect(() => {
    if (!opened) return;
    create.reset();
    update.reset();
    form.setValues(warehouse ? toWarehouseInput(warehouse) : emptyWarehouseInput());
    form.resetDirty();
    form.clearErrors();
    setConfirmDiscard(false);
  }, [opened, warehouse]);

  useEffect(() => {
    if (clash === 'name') form.setFieldError('name', t('validation.nameTaken'));
    if (clash === 'code') form.setFieldError('code', t('validation.codeTaken'));
  }, [clash]);

  const requestClose = () => {
    if (saving) return;
    if (form.isDirty()) setConfirmDiscard(true);
    else onClose();
  };

  const done = (message: string) => () => {
    notifications.show({ color: 'green', message });
    onClose();
  };

  const submit = form.onSubmit((values) => {
    const input = toWarehousePayload(values);
    if (warehouse) {
      update.mutate({ id: warehouse.id, input }, { onSuccess: done(t('notify.updated')) });
    } else {
      create.mutate(input, {
        onSuccess: done(t('notify.created', { name: input.name })),
      });
    }
  });

  const picData = (pic.data ?? []).map((person) => ({ value: person.id, label: person.name }));
  const section = (label: string) => <Divider label={label} labelPosition="left" />;

  return (
    <>
      <ModalFrame
        opened={opened}
        onClose={requestClose}
        title={t(editing ? 'form.titleEdit' : 'form.titleAdd')}
        description={t(editing ? 'form.descriptionEdit' : 'form.descriptionAdd')}
        size="min(720px, 94vw)"
        scrollBody
        footer={
          <>
            <Button variant="default" onClick={requestClose} disabled={saving}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" form={FORM_ID} loading={saving}>
              {t(editing ? 'form.submitEdit' : 'form.submitAdd')}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={submit} noValidate>
          <Stack gap="md">
            {failure && !clash && (
              <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
                {describe(failure)}
              </Alert>
            )}
            {section(t('form.sectionIdentity'))}
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label={t('form.code')}
                placeholder={t('form.codePlaceholder')}
                readOnly={editing && warehouse?.codeLocked}
                maxLength={WAREHOUSE_LIMITS.code + 10}
                {...form.getInputProps('code')}
              />
              <TextInput
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                required
                data-autofocus
                maxLength={WAREHOUSE_LIMITS.name + 20}
                {...form.getInputProps('name')}
              />
            </SimpleGrid>
            {(!editing || warehouse?.codeLocked) && (
              <Text size="xs" c="dimmed" mt={-8}>
                {t(editing ? 'form.codeLockedHint' : 'form.codeAutoHint')}
              </Text>
            )}
            {section(t('form.sectionLocation'))}
            <TextInput
              label={t('form.address')}
              placeholder={t('form.addressPlaceholder')}
              {...form.getInputProps('address')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label={t('form.city')}
                placeholder={t('form.cityPlaceholder')}
                {...form.getInputProps('city')}
              />
              <TextInput
                label={t('form.postalCode')}
                placeholder={t('form.postalCodePlaceholder')}
                {...form.getInputProps('postalCode')}
              />
            </SimpleGrid>
            {section(t('form.sectionContact'))}
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Select
                label={t('form.pic')}
                placeholder={t('form.picPlaceholder')}
                data={picData}
                searchable
                clearable
                value={form.values.picUserId}
                onChange={(value) => form.setFieldValue('picUserId', value)}
              />
              <TextInput
                label={t('form.phone')}
                placeholder={t('form.phonePlaceholder')}
                {...form.getInputProps('phone')}
              />
            </SimpleGrid>
            {section(t('form.sectionNotes'))}
            <Textarea
              label={t('form.notes')}
              placeholder={t('form.notesPlaceholder')}
              autosize
              minRows={2}
              maxRows={5}
              {...form.getInputProps('notes')}
            />
            <Switch
              label={t('form.isDefault')}
              description={t(alreadyDefault ? 'form.isDefaultCurrent' : 'form.isDefaultHint')}
              disabled={alreadyDefault}
              {...form.getInputProps('isDefault', { type: 'checkbox' })}
            />
          </Stack>
        </form>
      </ModalFrame>
      <WarehouseConfirmDialog
        opened={confirmDiscard}
        title={t('form.discardTitle')}
        body={t('form.discardBody')}
        confirmLabel={t('form.discardConfirm')}
        cancelLabel={t('form.discardKeep')}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onClose={() => setConfirmDiscard(false)}
      />
    </>
  );
}

export default WarehouseFormModal;
