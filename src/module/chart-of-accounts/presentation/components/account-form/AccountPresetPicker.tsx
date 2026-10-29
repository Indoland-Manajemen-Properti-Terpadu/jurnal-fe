import React from 'react';
import { Badge, Button, Grid, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface AccountPresetPickerProps {
  onApply: (presetKey: string) => void;
}

/** Quick account templates grid. */
export const AccountPresetPicker: React.FC<AccountPresetPickerProps> = ({ onApply }) => {
  const { t } = useTranslation('journal');

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
        <Text fz={12} fw={700} c="dark.7">
          {t('presetsTitle')}
        </Text>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
        {[
          { key: 'bank', label: t('presetBank'), color: 'blue', prefix: '1-1' },
          {
            key: 'pettyCash',
            label: t('presetPettyCash'),
            color: 'cyan',
            prefix: '1-1',
          },
          {
            key: 'receivable',
            label: t('presetReceivable'),
            color: 'indigo',
            prefix: '1-2',
          },
          {
            key: 'accumDepr',
            label: t('presetAccumDepr'),
            color: 'orange',
            prefix: '1-5',
          },
          { key: 'revenue', label: t('presetRevenue'), color: 'teal', prefix: '4-1' },
          {
            key: 'expense',
            label: t('presetExpense'),
            color: 'grape',
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
              <Badge size="xs" variant="light" color={preset.color} ff="monospace">
                {preset.prefix}
              </Badge>
            }
            styles={{
              root: {
                border: '1px solid var(--mantine-color-gray-3)',
                height: 32,
              },
              label: {
                fontSize: 11.5,
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
