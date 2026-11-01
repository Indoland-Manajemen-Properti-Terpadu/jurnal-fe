import React from 'react';
import { Accordion, Badge, Group, List, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBulb, IconChecklist, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';

export const JournalDoubleEntryGuide: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group gap="xs" mb="xs">
        <ThemeIcon size={28} radius="md" variant="light" color="yellow">
          <IconBulb size={16} />
        </ThemeIcon>
        <div>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('guide.title')}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('guide.subtitle')}
          </Text>
        </div>
      </Group>

      <Accordion variant="separated" radius="md" defaultValue="double-entry">
        <Accordion.Item value="double-entry">
          <Accordion.Control icon={<IconScale size={16} color={themeColors.primary[6]} />}>
            <Text fz="var(--jurnal-text-xs)" fw={600}>
              {t('guide.normalTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={6} fz="var(--jurnal-text-xs)">
              <Group justify="space-between">
                <Text fz="var(--jurnal-text-xs)" c="dimmed">
                  <Text span fw={700} c="dark.8">
                    {t('guide.assetExpense')}
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="teal">
                  {t('guide.debitPlus')}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text fz="var(--jurnal-text-xs)" c="dimmed">
                  <Text span fw={700} c="dark.8">
                    {t('guide.liabilityEquity')}
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="red">
                  {t('guide.creditPlus')}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text fz="var(--jurnal-text-xs)" c="dimmed">
                  <Text span fw={700} c="dark.8">
                    {t('guide.income')}
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="red">
                  {t('guide.creditPlus')}
                </Badge>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="checklist">
          <Accordion.Control icon={<IconChecklist size={16} color={themeColors.secondary[6]} />}>
            <Text fz="var(--jurnal-text-xs)" fw={600}>
              {t('guide.rulesTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <List size="xs" spacing={4} c="dimmed">
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.rule1Before')}{' '}
                  <Text span fw={600} c="dark.8">
                    {t('guide.rule1Strong')}
                  </Text>
                  {t('guide.rule1After')}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.rule2Before')}{' '}
                  <Text span fw={600} c="dark.8">
                    {t('guide.rule2Strong')}
                  </Text>{' '}
                  {t('guide.rule2After')}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.rule3')}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.rule4')}
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};
