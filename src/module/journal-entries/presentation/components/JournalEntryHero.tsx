import React from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  CopyButton,
  Group,
  Paper,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconCopy, IconNotebook } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/FormatDate';
import type { JournalEntryDetail } from '../../domain/journalEntry';

interface JournalEntryHeroProps {
  entry: JournalEntryDetail;
  isBalanced: boolean;
}

const JournalEntryHero: React.FC<JournalEntryHeroProps> = ({ entry, isBalanced }) => {
  const { t } = useTranslation('journalEntries');
  const numberText = String(entry.transactionNumber ?? '-');

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'xl' }}
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Group gap="lg" align="flex-start">
          <Avatar
            size={84}
            radius="md"
            color="primary"
            variant="light"
            style={{
              border: '2px solid var(--mantine-color-gray-2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <IconNotebook size={40} />
          </Avatar>

          <Box>
            <Group gap="xs" align="center" wrap="wrap">
              <Title order={2} fz={{ base: 22, sm: 26 }} c="primary.9">
                {t('detail.heading', { number: numberText })}
              </Title>

              {entry.transactionNumber && (
                <CopyButton value={numberText}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t('detail.copied') : t('detail.copyNumber')}>
                      <ActionIcon
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        size="sm"
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              )}

              <Badge
                size="md"
                radius="sm"
                color={isBalanced ? 'teal' : 'red'}
                variant="light"
                leftSection={isBalanced ? <IconCheck size={12} /> : <IconAlertTriangle size={12} />}
              >
                {isBalanced ? t('detail.balanced') : t('detail.unbalanced')}
              </Badge>

              <Badge size="md" radius="sm" variant="outline" color="gray">
                {entry.transactionType || 'DEFAULT'}
              </Badge>
            </Group>

            <Group gap="md" mt={8} wrap="wrap">
              <Text size="sm" c="dimmed">
                {t('detail.dateLabel')}{' '}
                <Text span fw={600} c="dark.8">
                  {entry.transactionDate ? dateFormatV1(entry.transactionDate.toString()) : '—'}
                </Text>
              </Text>

              <Text size="sm" c="dimmed">
                {t('detail.siteLabel')}{' '}
                <Text span fw={600} c="dark.8">
                  {entry.site?.name || t('detail.defaultSite')}
                </Text>
              </Text>

              {entry.tags && entry.tags !== '-' && (
                <Text size="sm" c="dimmed">
                  {t('detail.tagLabel')}{' '}
                  <Text span fw={600} c="dark.8">
                    {entry.tags}
                  </Text>
                </Text>
              )}

              <Text size="sm" c="dimmed">
                {t('detail.systemIdLabel')}{' '}
                <Text span fw={500} c="dark.6" ff="monospace">
                  {entry.id}
                </Text>
              </Text>
            </Group>
          </Box>
        </Group>
      </Group>
    </Paper>
  );
};

export default JournalEntryHero;
