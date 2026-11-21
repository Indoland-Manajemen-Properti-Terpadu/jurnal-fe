import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { toApiError } from '@/lib/http/apiError';
import type { Department } from '@/module/settings/domain/department';
import {
  useDeleteDepartment,
  useDepartmentErrorMessage,
  useUpdateDepartment,
} from '@/module/settings/presentation/hooks/useDepartments';

type Props = {
  department: Department | null;
  canDeactivate: boolean;
  onClose: () => void;
};

/**
 * Confirms a delete. A department a purchase request already uses cannot be deleted (the service
 * answers 400 in Indonesian); the dialog then shows that answer and offers to deactivate it.
 */
export function DepartmentDeleteDialog({ department, canDeactivate, onClose }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const remove = useDeleteDepartment();
  const deactivate = useUpdateDepartment();
  const describe = useDepartmentErrorMessage();
  const refused = remove.error ? toApiError(remove.error).kind === 'domain' : false;
  const failedOtherwise = remove.error !== null && !refused;

  const close = () => {
    remove.reset();
    deactivate.reset();
    onClose();
  };

  return (
    <Modal
      opened={department !== null}
      onClose={close}
      title={
        <Text fw={700}>{st(refused ? 'department.inUseTitle' : 'department.deleteTitle')}</Text>
      }
      radius="lg"
      size="sm"
    >
      {department && (
        <Stack gap="md">
          {refused && (
            <Alert color="orange" variant="light" icon={<IconInfoCircle size={18} />}>
              <Stack gap={4}>
                <Text size="sm">{describe(remove.error)}</Text>
                {canDeactivate && department.isActive && (
                  <Text size="sm">{st('department.inUseHint')}</Text>
                )}
              </Stack>
            </Alert>
          )}
          {failedOtherwise && (
            <Alert color="red" variant="light">
              {describe(remove.error)}
            </Alert>
          )}
          {!refused && (
            <Text size="sm">
              {st('department.deleteConfirm')} <strong>{department.name}</strong>?
            </Text>
          )}
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={close}>
              {st('common.cancel')}
            </Button>
            {refused ? (
              canDeactivate &&
              department.isActive && (
                <Button
                  color="primary"
                  loading={deactivate.isPending}
                  onClick={() =>
                    deactivate.mutate(
                      { id: department.id, input: { isActive: false } },
                      { onSuccess: close }
                    )
                  }
                >
                  {st('department.deactivate')}
                </Button>
              )
            ) : (
              <Button
                color="red"
                loading={remove.isPending}
                onClick={() => remove.mutate(department.id, { onSuccess: close })}
              >
                {st('common.yesDelete')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

export default DepartmentDeleteDialog;
