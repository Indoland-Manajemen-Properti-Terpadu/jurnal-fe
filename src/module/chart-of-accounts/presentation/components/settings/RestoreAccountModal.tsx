import React, { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconListDetails,
  IconRotateClockwise,
  IconScale,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import { SettingDoneView } from './SettingDoneView';
import { SettingHero } from './SettingHero';
import { SettingModalHeader } from './SettingModalHeader';

interface RestoreAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const IMPACTS = [
  { key: 'impact1', icon: IconListDetails },
  { key: 'impact2', icon: IconTrash },
  { key: 'impact3', icon: IconScale },
] as const;

export const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const { resetAccounts, isResetting } = useAccountSettings();
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!confirmed) return;
    try {
      await resetAccounts();
      setConfirmed(false);
      setDone(true);
      onSuccess?.();
    } catch {
      // Error handled in hook notification
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setDone(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <SettingModalHeader
          tone="restore"
          icon={IconRotateClockwise}
          title={t('settings.restore.title')}
          subtitle={t('settings.restore.subtitle')}
        />
      }
      size="lg"
      radius="lg"
      padding="lg"
      centered
    >
      {done ? (
        <SettingDoneView
          title={t('settings.restore.doneTitle')}
          description={t('settings.restore.doneBody')}
          closeLabel={t('settings.restore.doneClose')}
          onClose={handleClose}
        />
      ) : (
        <Stack gap="md" mt="xs">
          <SettingHero tone="restore" height={140} />

          <Alert
            icon={<IconAlertTriangle size={18} />}
            color="red"
            variant="light"
            radius="md"
            title={t('settings.restore.warnTitle')}
          >
            {t('settings.restore.warnBody')}
          </Alert>

          <Paper withBorder radius="lg" p="md" bg="white">
            <Text fz="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">
              {t('settings.restore.impactTitle')}
            </Text>
            <Stack gap="xs">
              {IMPACTS.map(({ key, icon: ImpactIcon }) => (
                <Group key={key} gap="sm" wrap="nowrap" align="flex-start">
                  <ThemeIcon size={26} radius="md" color="gray" variant="light">
                    <ImpactIcon size={15} />
                  </ThemeIcon>
                  <Text fz="sm" c="dark.7" lh={1.5}>
                    {t(`settings.restore.${key}`)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Checkbox
            checked={confirmed}
            onChange={(event) => setConfirmed(event.currentTarget.checked)}
            label={t('settings.restore.confirm')}
            color="red"
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" radius="md" onClick={handleClose} disabled={isResetting}>
              {t('settings.restore.cancel')}
            </Button>
            <Button
              color="red"
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
      )}
    </Modal>
  );
};
