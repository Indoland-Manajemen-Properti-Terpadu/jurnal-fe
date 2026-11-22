import { useEffect } from 'react';
import { Alert, Button, Group, Modal, Stack, Switch, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  DEPARTMENT_LIMITS,
  emptyDepartmentInput,
  toDepartmentInput,
  toDepartmentPayload,
  validateDepartment,
  type Department,
  type DepartmentInput,
} from '@/module/settings/domain/department';
import {
  useCreateDepartment,
  useDepartmentErrorMessage,
  useUpdateDepartment,
} from '@/module/settings/presentation/hooks/useDepartments';

type Props = {
  opened: boolean;
  /** The department being edited; null opens an empty form for a new one. */
  department: Department | null;
  onClose: () => void;
};

export function DepartmentFormModal({ opened, department, onClose }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const describe = useDepartmentErrorMessage();
  const saving = create.isPending || update.isPending;
  const failure = create.error ?? update.error;

  const form = useForm<DepartmentInput>({
    initialValues: emptyDepartmentInput(),
    validate: (values) => {
      const issues = validateDepartment(values);
      const message = (key?: string) => (key ? st(`department.validation.${key}`) : null);
      return {
        name: message(issues.name),
        code: message(issues.code),
        description: message(issues.description),
      };
    },
  });

  useEffect(() => {
    if (!opened) return;
    create.reset();
    update.reset();
    form.setValues(department ? toDepartmentInput(department) : emptyDepartmentInput());
    form.resetDirty();
    form.clearErrors();
  }, [opened, department]);

  const submit = form.onSubmit((values) => {
    const input = toDepartmentPayload(values);
    if (department) update.mutate({ id: department.id, input }, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: onClose });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={st(department ? 'department.modalEdit' : 'department.modalAdd')}
      radius="lg"
      closeOnClickOutside={!saving}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          {failure && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {describe(failure)}
            </Alert>
          )}
          <TextInput
            label={st('department.fieldName')}
            placeholder={st('department.namePlaceholder')}
            required
            data-autofocus
            maxLength={DEPARTMENT_LIMITS.name + 20}
            {...form.getInputProps('name')}
          />
          <TextInput
            label={st('department.fieldCode')}
            description={st('department.codeHint')}
            maxLength={DEPARTMENT_LIMITS.code + 10}
            {...form.getInputProps('code')}
          />
          <Textarea
            label={st('department.fieldDescription')}
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps('description')}
          />
          <Switch
            label={st('department.fieldActive')}
            description={st('department.activeHint')}
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose} disabled={saving}>
              {st('common.cancel')}
            </Button>
            <Button type="submit" color="primary" loading={saving}>
              {st(department ? 'common.saveChanges' : 'department.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default DepartmentFormModal;
