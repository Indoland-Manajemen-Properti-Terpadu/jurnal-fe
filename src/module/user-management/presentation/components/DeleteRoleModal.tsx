import { Button, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

type Props = {
  opened: boolean;
  name: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteRoleModal({ opened, name, isPending, onClose, onConfirm }: Readonly<Props>) {
  const { t } = useTranslation('userManagement');

  return (
    <Modal opened={opened} onClose={onClose} centered title={t('roles.delete.title', { name })}>
      <Stack gap="md">
        <Text size="sm">{t('roles.delete.body')}</Text>
        <Stack gap="xs">
          <Button color="red" onClick={onConfirm} loading={isPending}>
            {t('roles.delete.confirm')}
          </Button>
          <Button variant="default" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
