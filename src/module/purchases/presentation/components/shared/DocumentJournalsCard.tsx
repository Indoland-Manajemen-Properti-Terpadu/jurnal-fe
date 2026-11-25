import { Anchor, Badge, Box, Group, Table, Text } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import { generatePath, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { DocumentJournal } from '@/module/purchases/domain/documentJournal';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { routes } from '@/router/routes';

const STATUS_COLOR: Record<string, string> = { ACTIVE: 'green', VOID: 'gray', REVERSAL: 'orange' };

const Amount = ({ value }: Readonly<{ value: number }>) =>
  value === 0 ? (
    <Text size="sm" c="dimmed">
      -
    </Text>
  ) : (
    <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatAmount(value)}
    </Text>
  );

/** One journal: what posted it, its number as a link to the entry, its status, and its lines. */
const JournalTable = ({ journal }: Readonly<{ journal: DocumentJournal }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <Box component="section" aria-label={journal.label}>
      <Group justify="space-between" wrap="wrap" gap="xs" px="lg" py="sm">
        <Group gap="sm" wrap="wrap">
          <Text size="sm" fw={700}>
            {journal.label}
          </Text>
          <Anchor
            component={Link}
            to={generatePath(routes.journalEntries.detail, { idTransaction: journal.id })}
            size="sm"
            fw={600}
          >
            {journal.number ? `#${journal.number}` : t('journals.open')}
          </Anchor>
          {journal.date && (
            <Text size="xs" c="dimmed">
              {formatDay(journal.date, currentLanguage)}
            </Text>
          )}
        </Group>
        <Badge variant="light" radius="sm" color={STATUS_COLOR[journal.status] ?? 'gray'}>
          {journal.statusLabel || journal.status}
        </Badge>
      </Group>
      <Table.ScrollContainer type="native" minWidth={560}>
        <Table className={tableClasses.table} verticalSpacing="xs" horizontalSpacing="lg">
          <Table.Thead bg="var(--jurnal-color-surface-muted)">
            <Table.Tr>
              <Table.Th>
                <Text size="xs" fw={700} c="dark.7">
                  {t('journals.account')}
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dark.7">
                  {t('journals.debit')}
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dark.7">
                  {t('journals.credit')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {journal.lines.map((line, index) => (
              <Table.Tr key={`${line.accountNumber}-${index}`}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {[line.accountNumber, line.accountName].filter(Boolean).join(' · ')}
                  </Text>
                  {line.description && (
                    <Text size="xs" c="dimmed">
                      {line.description}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right">
                  <Amount value={line.debit} />
                </Table.Td>
                <Table.Td ta="right">
                  <Amount value={line.credit} />
                </Table.Td>
              </Table.Tr>
            ))}
            <Table.Tr>
              <Table.Td>
                <Text size="sm" fw={700}>
                  {t('journals.total')}
                </Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatAmount(journal.totalDebit)}
                </Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatAmount(journal.totalCredit)}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Box>
  );
};

/** The journals a document posted, one table each, so the books can be checked from the document. */
export const DocumentJournalsCard = ({ journals }: Readonly<{ journals: DocumentJournal[] }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconBook2}
      flush
      title={t('journals.title')}
      subtitle={t('journals.subtitle')}
      count={journals.length > 0 ? t('journals.count', { count: journals.length }) : undefined}
    >
      {journals.length === 0 ? (
        <Box px="lg" py="md">
          <Text size="sm" c="dimmed">
            {t('journals.empty')}
          </Text>
        </Box>
      ) : (
        journals.map((journal, index) => (
          <Box
            key={journal.id}
            style={
              index > 0 ? { borderTop: '1px solid var(--jurnal-color-border-subtle)' } : undefined
            }
          >
            <JournalTable journal={journal} />
          </Box>
        ))
      )}
    </SectionCard>
  );
};
