import React from 'react';
import { Badge, Card, Divider, Group, Stack, Text } from '@mantine/core';
import { IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1, dateFormatTimeZone } from '@/utils/formatDate';
import type { JournalEntryDetail } from '../../domain/journalEntry';
import { absoluteDifference } from '../../domain/journalRules';
import JournalAttachments from './JournalAttachments';

interface JournalEntrySidebarProps {
  entry: JournalEntryDetail;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

const JournalEntrySidebar: React.FC<JournalEntrySidebarProps> = ({
  entry,
  totalDebit,
  totalCredit,
  isBalanced,
}) => {
  const { t } = useTranslation('journalEntries');
  const hasTag = entry.tags && entry.tags !== '-';

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" p="lg" bg="white">
        <Text fw={700} size="md" c="dark.8" mb="sm">
          {t('detail.summaryTitle')}
        </Text>
        <Divider mb="sm" />

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.totalDebit')}
            </Text>
            <Text size="sm" fw={700} c="teal.8" style={tabular}>
              {formatCurrency(totalDebit)}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.totalCredit')}
            </Text>
            <Text size="sm" fw={700} c="red.8" style={tabular}>
              {formatCurrency(totalCredit)}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.balanceGap')}
            </Text>
            <Text size="sm" fw={700} c={isBalanced ? 'teal.7' : 'red.7'} style={tabular}>
              {formatCurrency(absoluteDifference(totalDebit, totalCredit))}
            </Text>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg" bg="white">
        <Text fw={700} size="md" c="dark.8" mb="sm">
          {t('detail.auditTitle')}
        </Text>
        <Divider mb="sm" />

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.entityProject')}
            </Text>
            <Text size="sm" fw={600} c="dark.8">
              {entry.site?.name || t('detail.defaultSite')}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.transactionDate')}
            </Text>
            <Text size="sm" fw={600} c="dark.8">
              {entry.transactionDate ? dateFormatV1(entry.transactionDate.toString()) : '—'}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.transactionTag')}
            </Text>
            <div>
              {hasTag ? (
                <Badge size="xs" variant="light" color="primary">
                  {entry.tags}
                </Badge>
              ) : (
                <Text size="sm" c="dimmed">
                  —
                </Text>
              )}
            </div>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('detail.createdAt')}
            </Text>
            <Text size="xs" c="dark.7">
              {entry.createdAt ? dateFormatTimeZone(entry.createdAt) : '—'}
            </Text>
          </Group>

          {entry.updatedAt && (
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                {t('detail.updatedAt')}
              </Text>
              <Text size="xs" c="dark.7">
                {dateFormatTimeZone(entry.updatedAt)}
              </Text>
            </Group>
          )}
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg" bg="white">
        <Group justify="space-between" align="center" mb="sm">
          <Group gap="xs">
            <IconPaperclip size={18} color="var(--mantine-color-primary-6)" />
            <Text fw={700} size="md" c="dark.8">
              {t('detail.docsTitle')}
            </Text>
          </Group>
          <Badge size="sm" variant="light" color="primary">
            {t('detail.docsBadge', { count: (entry.attachments || []).length })}
          </Badge>
        </Group>
        <Divider mb="sm" />

        <JournalAttachments attachments={entry.attachments} />
      </Card>
    </Stack>
  );
};

export default JournalEntrySidebar;
