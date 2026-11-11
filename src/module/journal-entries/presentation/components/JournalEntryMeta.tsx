import React from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { tagNames } from '../../domain/journalTags';
import type { JournalEntryDetail } from '../../domain/journalEntry';

interface JournalEntryMetaProps {
  entry: JournalEntryDetail;
}

const Separator = () => (
  <Text fz="var(--jurnal-text-sm)" c="dimmed" aria-hidden>
    ·
  </Text>
);

/**
 * The line under the page title: the date, a void or reversal marker when it applies, and the tags.
 * Entity, type and balance are on the cards below, so they are not repeated here.
 */
const JournalEntryMeta: React.FC<JournalEntryMetaProps> = ({ entry }) => {
  const { t } = useTranslation('journalEntries');
  const tags = tagNames(entry.tags);
  const marked = entry.status === 'VOID' || entry.status === 'REVERSAL';

  return (
    <Stack gap={6}>
      <Group gap="xs" wrap="wrap" align="center">
        <Text fz="var(--jurnal-text-sm)" fw={600} c="dark.8">
          {entry.transactionDate ? dateFormatV1(entry.transactionDate.toString()) : '—'}
        </Text>
        {marked && (
          <>
            <Separator />
            <Text fz="var(--jurnal-text-sm)" fw={600} c="red.7">
              {t(entry.status === 'VOID' ? 'detail.statusVoid' : 'detail.statusReversal')}
            </Text>
          </>
        )}
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
