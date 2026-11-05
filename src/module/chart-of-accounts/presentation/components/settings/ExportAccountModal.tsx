import React, { useState } from 'react';
import { Badge, Button, Group, Modal, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import { SettingDoneView } from './SettingDoneView';
import { SettingHero } from './SettingHero';
import { SettingModalHeader } from './SettingModalHeader';

interface ExportAccountModalProps {
  opened: boolean;
  onClose: () => void;
  totalAccounts?: number;
}

const COLUMN_KEYS = ['colCode', 'colName', 'colCategory', 'colSide', 'colBalance'] as const;

export const ExportAccountModal: React.FC<ExportAccountModalProps> = ({
  opened,
  onClose,
  totalAccounts = 0,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const { exportAccounts, isExporting } = useAccountSettings();
  const [done, setDone] = useState(false);

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <SettingModalHeader
          tone="export"
          icon={IconDownload}
          title={t('settings.export.title')}
          subtitle={t('settings.export.subtitle')}
        />
      }
      size="md"
      radius="lg"
      padding="lg"
      centered
    >
      {done ? (
        <SettingDoneView
          title={t('settings.export.doneTitle')}
          description={t('settings.export.doneBody')}
          closeLabel={t('settings.export.doneClose')}
          onClose={handleClose}
        />
      ) : (
        <Stack gap="md" mt="xs">
          <SettingHero tone="export" height={140} />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Group justify="space-between" wrap="nowrap" mb="sm">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={36} radius="md" color="teal" variant="light">
                  <IconFileSpreadsheet size={20} />
                </ThemeIcon>
                <Text fw={700} fz="sm" c="dark.9">
                  {t('settings.export.format')}
                </Text>
              </Group>
              {totalAccounts > 0 && (
                <Badge color="teal" variant="light" size="md">
                  {t('settings.export.count', { count: totalAccounts })}
                </Badge>
              )}
            </Group>

            <Text fz="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>
              {t('settings.export.contentsTitle')}
            </Text>
            <Group gap={6}>
              {COLUMN_KEYS.map((key) => (
                <Badge
                  key={key}
                  color="gray"
                  variant="light"
                  size="md"
                  tt="none"
                  fw={500}
                  leftSection={<IconCheck size={12} />}
                >
                  {t(`settings.export.${key}`)}
                </Badge>
              ))}
            </Group>
          </Paper>

          <Text fz="xs" c="dimmed">
            {t('settings.export.info')}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="default" radius="md" onClick={handleClose} disabled={isExporting}>
              {t('settings.export.close')}
            </Button>
            <Button
              color="teal"
              radius="md"
              leftSection={<IconDownload size={16} />}
              onClick={() => exportAccounts(undefined, { onSuccess: () => setDone(true) })}
              loading={isExporting}
            >
              {t('settings.export.download')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
