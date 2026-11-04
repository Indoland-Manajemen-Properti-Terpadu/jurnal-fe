import React from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { tagNames } from '../../domain/journalTags';
import type { JournalEntryDetail } from '../../domain/journalEntry';

interface JournalEntryMetaProps {
  entry: JournalEntryDetail;
  isBalanced: boolean;
}

const Separator = () => (
  <Text fz="var(--jurnal-text-sm)" c="dimmed" aria-hidden>
    ·
  </Text>
);

/** The line under the page title: date, entity, type, whether the entry balances, and its tags. */
const JournalEntryMeta: React.FC<JournalEntryMetaProps> = ({ entry, isBalanced }) => {
  const { t } = useTranslation('journalEntries');
  const tags = tagNames(entry.tags);

  return (
    <Stack gap={6}>
      <Group gap="xs" wrap="wrap" align="center">
        <Text fz="var(--jurnal-text-sm)" fw={600} c="dark.8">
          {entry.transactionDate ? dateFormatV1(entry.transactionDate.toString()) : '—'}
        </Text>
        <Separator />
        <Text fz="var(--jurnal-text-sm)" c="dimmed">
          {entry.site?.name || t('detail.defaultSite')}
        </Text>
        {(entry.status === 'VOID' || entry.status === 'REVERSAL') && (
          <>
            <Separator />
            <Text fz="var(--jurnal-text-sm)" fw={600} c="red.7">
              {t(entry.status === 'VOID' ? 'detail.statusVoid' : 'detail.statusReversal')}
            </Text>
          </>
        )}
        {entry.transactionType && (
          <>
            <Separator />
            <Text fz="var(--jurnal-text-sm)" c="dimmed">
              {entry.transactionType}
            </Text>
          </>
        )}
        <Separator />
        <Group gap={6} wrap="nowrap">
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isBalanced ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-red-6)',
            }}
          />
          <Text fz="var(--jurnal-text-sm)" fw={600} c={isBalanced ? 'teal.8' : 'red.7'}>
            {isBalanced ? t('detail.balanced') : t('detail.unbalanced')}
          </Text>
        </Group>
      </Group>

      {tags.length > 0 && (
        <Group gap={6} wrap="wrap">
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('detail.tagLabel')}
          </Text>
          {tags.map((name) => (
            <Badge key={name} variant="light" color="gray" radius="sm" tt="none" fw={500}>
              {name}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
};

export default JournalEntryMeta;
