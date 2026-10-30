import React from 'react';
import { Box, Button, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface ImportDoneStepProps {
  importedCount: number;
  onClose: () => void;
}

/** Step 3 of the import wizard: success screen. */
export const ImportDoneStep: React.FC<ImportDoneStepProps> = ({ importedCount, onClose }) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={64} radius="xl" color="teal" variant="light">
        <IconCheck size={36} stroke={2.5} />
      </ThemeIcon>

      <Box style={{ textAlign: 'center' }}>
        <Text fw={700} size="lg" c="dark.9">
          {t('settings.import.doneTitle')}
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          {t('settings.import.doneBodyPrefix')}
          <strong>{importedCount}</strong>
          {t('settings.import.doneBodySuffix')}
        </Text>
      </Box>

      <Button color="primary" size="sm" radius="md" onClick={onClose} mt="md">
        {t('settings.import.doneClose')}
      </Button>
    </Stack>
  );
};
