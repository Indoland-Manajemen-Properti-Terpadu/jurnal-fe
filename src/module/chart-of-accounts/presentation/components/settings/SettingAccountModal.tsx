import React, { useState } from 'react';
import { Box, Button, Divider, Grid, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconArrowRight,
  IconDownload,
  IconRotateClockwise,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import ImageImport from '@/assets/images/illustrations/settings-account-import.svg';
import ImageExport from '@/assets/images/illustrations/settings-account-export.svg';
import ImageRestore from '@/assets/images/illustrations/settings-account-restore.svg';
import { SettingAccountAction } from '@/module/chart-of-accounts/domain/settingAccount';
import { SettingActionCard } from './SettingActionCard';
import { SETTING_ACTION_THEMES } from './settingActionThemes';
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
  const [selectedAction, setSelectedAction] = useState<SettingAccountAction>('import');

  // Sub-modal states
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const handleContinue = () => {
    onClose();
    if (selectedAction === 'import') {
      setImportOpen(true);
    } else if (selectedAction === 'export') {
      setExportOpen(true);
    } else if (selectedAction === 'restore') {
      setRestoreOpen(true);
    }
  };

  const handleCardDirectAction = (action: SettingAccountAction) => {
    setSelectedAction(action);
    onClose();
    if (action === 'import') setImportOpen(true);
    if (action === 'export') setExportOpen(true);
    if (action === 'restore') setRestoreOpen(true);
  };

  const cards = [
    {
      action: 'import' as const,
      image: ImageImport,
      imageAlt: t('settings.modal.importAlt'),
      icon: IconUpload,
      title: t('settings.modal.importTitle'),
      description: t('settings.modal.importDesc'),
      buttonLabel: t('settings.modal.importButton'),
    },
    {
      action: 'export' as const,
      image: ImageExport,
      imageAlt: t('settings.modal.exportAlt'),
      icon: IconDownload,
      title: t('settings.modal.exportTitle'),
      description: t('settings.modal.exportDesc'),
      buttonLabel: t('settings.modal.exportButton'),
    },
    {
      action: 'restore' as const,
      image: ImageRestore,
      imageAlt: t('settings.modal.restoreAlt'),
      icon: IconRotateClockwise,
      title: t('settings.modal.restoreTitle'),
      description: t('settings.modal.restoreDesc'),
      buttonLabel: t('settings.modal.restoreButton'),
    },
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm" align="center">
            <ThemeIcon
              size={40}
              radius="md"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            >
              <IconSettings size={22} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="md" c="dark.9" lh={1.2}>
                {t('settings.modal.title')}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                {t('settings.modal.subtitle')}
              </Text>
            </Box>
          </Group>
        }
        size="56rem"
        radius="lg"
        centered
        padding="lg"
      >
        <Stack gap="lg" mt="xs">
          <Grid gutter="md">
            {cards.map((card) => (
              <Grid.Col key={card.action} span={{ base: 12, md: 4 }}>
                <SettingActionCard
                  theme={SETTING_ACTION_THEMES[card.action]}
                  selected={selectedAction === card.action}
                  image={card.image}
                  imageAlt={card.imageAlt}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  buttonLabel={card.buttonLabel}
                  onSelect={() => setSelectedAction(card.action)}
                  onStart={() => handleCardDirectAction(card.action)}
                />
              </Grid.Col>
            ))}
          </Grid>

          <Divider />

          {/* Modal Footer */}
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="xs" c="dimmed">
              {t('settings.modal.tip')}
            </Text>

            <Group gap="sm">
              <Button variant="default" size="sm" radius="md" onClick={onClose}>
                {t('settings.modal.close')}
              </Button>
              <Button
                color="primary"
                size="sm"
                radius="md"
                rightSection={<IconArrowRight size={16} />}
                onClick={handleContinue}
              >
                {t('settings.modal.continue')}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Sub-Modals for each distinct workflow */}
      <ImportAccountWizardModal opened={importOpen} onClose={() => setImportOpen(false)} />

      <ExportAccountModal
        opened={exportOpen}
        onClose={() => setExportOpen(false)}
        totalAccounts={totalAccounts}
      />

      <RestoreAccountModal opened={restoreOpen} onClose={() => setRestoreOpen(false)} />
    </>
  );
};
