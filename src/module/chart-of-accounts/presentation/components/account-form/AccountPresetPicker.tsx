import React from 'react';
import { Button, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface AccountPresetPickerProps {
  onApply: (presetKey: string) => void;
}

/** Quick account templates grid. */
export const AccountPresetPicker: React.FC<AccountPresetPickerProps> = ({ onApply }) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      mb="lg"
      bg="var(--mantine-color-gray-0)"
      style={{ borderStyle: 'dashed' }}
    >
      <Group gap={6} mb={8}>
        <IconSparkles size={15} color={themeColors.primary[6]} />
        <Text fz="var(--jurnal-text-xs)" fw={700} c="dark.7">
          {t('form.presetsTitle')}
        </Text>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
        {[
          { key: 'bank', label: t('form.presetBank'), prefix: '1-1' },
          {
            key: 'pettyCash',
            label: t('form.presetPettyCash'),
            prefix: '1-1',
          },
          {
            key: 'receivable',
            label: t('form.presetReceivable'),
            prefix: '1-2',
          },
          {
            key: 'accumDepr',
            label: t('form.presetAccumDepr'),
            prefix: '1-5',
          },
          { key: 'revenue', label: t('form.presetRevenue'), prefix: '4-1' },
          {
            key: 'expense',
            label: t('form.presetExpense'),
            prefix: '6-1',
          },
        ].map((preset) => (
          <Button
            key={preset.key}
            size="xs"
            variant="white"
            color="dark"
            radius="md"
            justify="flex-start"
            fullWidth
            leftSection={
              <Text fz="var(--jurnal-text-xs)" c="dimmed" ff="monospace">
                {preset.prefix}
              </Text>
            }
            styles={{
              root: {
                border: '1px solid var(--mantine-color-gray-3)',
                height: 32,
              },
              label: {
                fontSize: 'var(--jurnal-text-xs)',
                fontWeight: 600,
              },
            }}
            onClick={() => onApply(preset.key)}
          >
            {preset.label}
          </Button>
        ))}
      </SimpleGrid>
    </Paper>
  );
};
