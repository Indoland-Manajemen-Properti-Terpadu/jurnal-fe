import React, { useState } from 'react';
import { Button, Divider, Grid, Group, Modal, Stack, Text } from '@mantine/core';
import { IconDownload, IconRotateClockwise, IconSettings, IconUpload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SettingAccountAction } from '@/module/chart-of-accounts/domain/settingAccount';
import { SettingActionCard } from './SettingActionCard';
import { SettingModalHeader } from './SettingModalHeader';
import { ImportAccountWizardModal } from './ImportAccountWizardModal';
import { ExportAccountModal } from './ExportAccountModal';
import { RestoreAccountModal } from './RestoreAccountModal';

export interface SettingAccountModalProps {
  opened: boolean;
  onClose: () => void;
  totalAccounts?: number;
}

export const SettingAccountModal: React.FC<SettingAccountModalProps> = ({
  opened,
  onClose,
  totalAccounts = 0,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const [openFlow, setOpenFlow] = useState<SettingAccountAction | null>(null);

  const startFlow = (action: SettingAccountAction) => {
    onClose();
    setOpenFlow(action);
  };

  const cards = [
    {
      action: 'import' as const,
      icon: IconUpload,
      title: t('settings.modal.importTitle'),
      description: t('settings.modal.importDesc'),
      meta: t('settings.modal.importMeta'),
      buttonLabel: t('settings.modal.importButton'),
    },
    {
      action: 'export' as const,
      icon: IconDownload,
      title: t('settings.modal.exportTitle'),
      description: t('settings.modal.exportDesc'),
      meta:
        totalAccounts > 0
          ? t('settings.modal.exportMetaCount', { count: totalAccounts })
          : t('settings.modal.exportMeta'),
      buttonLabel: t('settings.modal.exportButton'),
    },
    {
      action: 'restore' as const,
      icon: IconRotateClockwise,
      title: t('settings.modal.restoreTitle'),
      description: t('settings.modal.restoreDesc'),
      meta: t('settings.modal.restoreMeta'),
      buttonLabel: t('settings.modal.restoreButton'),
    },
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <SettingModalHeader
            tone="import"
            icon={IconSettings}
            title={t('settings.modal.title')}
            subtitle={t('settings.modal.subtitle')}
          />
        }
        size="56rem"
        radius="lg"
        centered
        padding="lg"
      >
        <Stack gap="lg" mt="xs">
          <Grid gutter="md">
            {cards.map(({ action, ...card }) => (
              <Grid.Col key={action} span={{ base: 12, md: 4 }}>
                <SettingActionCard tone={action} {...card} onStart={() => startFlow(action)} />
              </Grid.Col>
            ))}
          </Grid>

          <Divider />

          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Text fz="xs" c="dimmed">
              {t('settings.modal.tip')}
            </Text>
            <Button variant="default" radius="md" onClick={onClose}>
              {t('settings.modal.close')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ImportAccountWizardModal opened={openFlow === 'import'} onClose={() => setOpenFlow(null)} />

      <ExportAccountModal
        opened={openFlow === 'export'}
        onClose={() => setOpenFlow(null)}
        totalAccounts={totalAccounts}
      />

      <RestoreAccountModal opened={openFlow === 'restore'} onClose={() => setOpenFlow(null)} />
    </>
  );
};
