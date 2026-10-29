import { Alert, Badge, Button, Divider, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconSparkles } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type ApproveAllModalProps = {
  opened: boolean;
  type: string | undefined;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ApproveAllModal({
  opened,
  type,
  loading,
  onClose,
  onConfirm,
}: ApproveAllModalProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="primary" variant="light">
            <IconSparkles size={16} />
          </ThemeIcon>
          <Text fw={700} c="dark.8">
            {t('allModalTitle')}
          </Text>
        </Group>
      }
      radius="md"
    >
      <Stack gap="md">
        <Text size="sm">
          {t('allModalPromptPrefix')} <strong>{t('allModalPromptEmphasis')}</strong>{' '}
          {t('allModalPromptSuffix')}{' '}
          {type ? (
            <Badge color="orange" size="sm">
              {type}
            </Badge>
          ) : (
            t('allModalPendingScope')
          )}
          ?
        </Text>

        <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
          {t('allModalAlert')}
        </Alert>

        <Divider />

        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            color="primary"
            leftSection={<IconCheck size={16} />}
            onClick={onConfirm}
            loading={loading}
          >
            {t('confirmApproveAll')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
