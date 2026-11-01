import { Alert, Button, Modal, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DeactivateBlock } from '@/module/user-management/domain/userRules';

type Props = {
  opened: boolean;
  name: string;
  /** When set the action is not allowed and the reason is shown instead of a confirm button. */
  blocked: DeactivateBlock | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeactivateUserModal({
  opened,
  name,
  blocked,
  isPending,
  onClose,
  onConfirm,
}: Readonly<Props>) {
  const { t } = useTranslation('userManagement');

  return (
    <Modal opened={opened} onClose={onClose} centered title={t('users.deactivate.title', { name })}>
      <Stack gap="md">
        {blocked ? (
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
            {t(`users.blocked.${blocked}`)}
          </Alert>
        ) : (
          <Text size="sm">{t('users.deactivate.body')}</Text>
        )}
        <Stack gap="xs">
          {!blocked && (
            <Button color="red" onClick={onConfirm} loading={isPending}>
              {t('users.deactivate.confirm')}
            </Button>
          )}
          <Button variant="default" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
