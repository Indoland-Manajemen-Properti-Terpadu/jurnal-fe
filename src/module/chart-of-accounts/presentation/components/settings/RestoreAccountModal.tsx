import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconRotateClockwise } from '@tabler/icons-react';
import ImageRestore from '@/assets/img/SettingsAccount-Restore.svg';
import { useTranslation } from '@/i18n';
import { useAccountSettings } from '../../hooks/useAccountSettings';

interface RestoreAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const { resetAccounts, isResetting } = useAccountSettings();
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    if (!confirmed) return;
    try {
      await resetAccounts();
      setConfirmed(false);
      onClose();
      onSuccess?.();
    } catch {
      // Error handled in hook notification
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={34} radius="md" color="red" variant="light">
            <IconRotateClockwise size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              {t('settings.restore.title')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('settings.restore.subtitle')}
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      radius="md"
      centered
    >
      <Stack gap="md" mt="xs">
        <Box
          style={{
            height: 124,
            borderRadius: 12,
            background: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(225, 29, 72, 0.15)',
          }}
        >
          <Image src={ImageRestore} alt={t('settings.restore.alt')} h={88} fit="contain" />
        </Box>

        <Alert
          icon={<IconAlertTriangle size={18} />}
          color="red"
          variant="light"
          radius="md"
          title={t('settings.restore.warnTitle')}
        >
          {t('settings.restore.warnBody')}
        </Alert>

        <Paper withBorder radius="md" p="md" bg="gray.0">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              {t('settings.restore.impactTitle')}
            </Text>
            <Text size="xs" c="dark.7">
              {t('settings.restore.impact1')}
            </Text>
            <Text size="xs" c="dark.7">
              {t('settings.restore.impact2')}
            </Text>
            <Text size="xs" c="dark.7">
              {t('settings.restore.impact3')}
            </Text>
          </Stack>
        </Paper>

        <Checkbox
          checked={confirmed}
          onChange={(e) => setConfirmed(e.currentTarget.checked)}
          label={t('settings.restore.confirm')}
          color="red"
          size="sm"
        />

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button
            variant="default"
            size="sm"
            radius="md"
            onClick={handleClose}
            disabled={isResetting}
          >
            {t('settings.restore.cancel')}
          </Button>
          <Button
            color="red"
            size="sm"
            radius="md"
            leftSection={<IconRotateClockwise size={16} />}
            onClick={handleReset}
            disabled={!confirmed}
            loading={isResetting}
          >
            {t('settings.restore.reset')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
