import React from 'react';
import { Accordion, Group, List, Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

/** A short refresher that stays closed until it is wanted; the form is the main thing on the page. */
export const JournalDoubleEntryGuide: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const normalBalances = [
    { label: t('guide.assetExpense'), side: t('guide.debitPlus') },
    { label: t('guide.liabilityEquity'), side: t('guide.creditPlus') },
    { label: t('guide.income'), side: t('guide.creditPlus') },
  ];

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="none">
      <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
        {t('guide.title')}
      </Text>
      <Text fz="var(--jurnal-text-xs)" c="dimmed" mb="xs">
        {t('guide.subtitle')}
      </Text>

      <Accordion variant="default" radius="md" chevronPosition="right">
        <Accordion.Item value="double-entry">
          <Accordion.Control>
            <Text fz="var(--jurnal-text-sm)" fw={600}>
              {t('guide.normalTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={6}>
              {normalBalances.map((item) => (
                <Group key={item.label} justify="space-between" wrap="nowrap">
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dark.8">
                    {item.label}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" c="dimmed">
                    {item.side}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="checklist">
          <Accordion.Control>
            <Text fz="var(--jurnal-text-sm)" fw={600}>
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
