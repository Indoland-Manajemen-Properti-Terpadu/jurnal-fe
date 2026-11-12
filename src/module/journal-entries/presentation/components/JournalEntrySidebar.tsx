import React from 'react';
import { ActionIcon, Badge, CopyButton, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconHistory, IconPaperclip } from '@tabler/icons-react';
import { DetailCardHeader } from '@/components/DetailCardHeader/DetailCardHeader';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { tagNames } from '../../domain/journalTags';
import type { JournalEntryDetail } from '../../domain/journalEntry';
import JournalAttachments from './JournalAttachments';

interface JournalEntrySidebarProps {
  entry: JournalEntryDetail;
}

const LABEL_WIDTH = 112;
const STAMP_FORMAT = 'DD/MM/YYYY HH:mm';

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Group gap="sm" wrap="nowrap" align="flex-start">
    <Text fz="var(--jurnal-text-xs)" c="dimmed" w={LABEL_WIDTH} pt={2} style={{ flexShrink: 0 }}>
      {label}
    </Text>
    <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
  </Group>
);

const Value: React.FC<{ children: React.ReactNode; muted?: boolean }> = ({ children, muted }) => (
  <Text
    fz="var(--jurnal-text-sm)"
    fw={500}
    c={muted ? 'dimmed' : 'dark.8'}
    style={{ wordBreak: 'break-word' }}
  >
    {children}
  </Text>
);

/** Right column: the facts of the entry, then its attachments. */
const JournalEntrySidebar: React.FC<JournalEntrySidebarProps> = ({ entry }) => {
  const { t } = useTranslation('journalEntries');
  const tags = tagNames(entry.tags);
  const attachmentCount = (entry.attachments || []).length;

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md" bg="white" shadow="none">
        <DetailCardHeader
          icon={<IconHistory size={19} />}
          title={t('detail.auditTitle')}
          subtitle={t('detail.auditSubtitle')}
        />
        <Stack gap="xs">
          <Row label={t('detail.transactionDate')}>
            <Value>
              {entry.transactionDate ? dateFormatV1(entry.transactionDate.toString()) : '—'}
            </Value>
          </Row>
          <Row label={t('detail.entityProject')}>
            <Value>{entry.site?.name || t('detail.defaultSite')}</Value>
          </Row>
          <Row label={t('detail.transactionType')}>
            <Value muted={!entry.transactionType}>{entry.transactionType || '—'}</Value>
          </Row>
          <Row label={t('detail.transactionTag')}>
            {tags.length > 0 ? (
              <Group gap={6} wrap="wrap">
                {tags.map((name) => (
                  <Badge key={name} variant="light" color="gray" radius="sm" tt="none" fw={500}>
                    {name}
                  </Badge>
                ))}
              </Group>
            ) : (
              <Value muted>—</Value>
            )}
          </Row>
          <Row label={t('detail.createdAt')}>
            <Value>
              {entry.createdAt ? dateFormatV1(entry.createdAt.toString(), STAMP_FORMAT) : '—'}
            </Value>
          </Row>
          {entry.updatedAt && (
            <Row label={t('detail.updatedAt')}>
              <Value>{dateFormatV1(entry.updatedAt.toString(), STAMP_FORMAT)}</Value>
            </Row>
          )}
          {entry.id && (
            <Row label={t('detail.systemIdLabel')}>
              <Group gap={4} wrap="nowrap">
                <Text fz="var(--jurnal-text-xs)" c="dark.6" ff="monospace" title={entry.id}>
                  …{entry.id.slice(-10)}
                </Text>
                <CopyButton value={entry.id}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t('detail.copied') : t('detail.copyId')}>
                      <ActionIcon
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        size="xs"
                        aria-label={t('detail.copyId')}
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Row>
          )}
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md" bg="white" shadow="none">
        <DetailCardHeader
          icon={<IconPaperclip size={19} />}
          title={t('detail.docsTitle')}
          subtitle={t('detail.docsSubtitle')}
          action={
            <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
              {t('detail.docsBadge', { count: attachmentCount })}
            </Text>
          }
        />
        <JournalAttachments attachments={entry.attachments} />
      </Paper>
    </Stack>
  );
};

export default JournalEntrySidebar;
