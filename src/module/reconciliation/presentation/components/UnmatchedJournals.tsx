import { Divider, Paper, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { JournalDetail } from '../../domain/reconciliation';

/**
 * Journal lines of the account that no statement row has matched. Nothing to click here: it is
 * the other half of the reconciliation, so the user can see what the statement still lacks.
 */
const UnmatchedJournals: React.FC<{ journals: JournalDetail[] }> = ({ journals }) => {
  const { t } = useTranslation('reconciliation');
  if (journals.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="none">
      <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
        {t('journals.title', { count: journals.length })}
      </Text>
      <Text fz="var(--jurnal-text-xs)" c="dimmed">
        {t('journals.description')}
      </Text>
      <Divider my="sm" />
      <Table.ScrollContainer minWidth={480}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('journals.date')}</Table.Th>
              <Table.Th>{t('journals.columnDescription')}</Table.Th>
              <Table.Th ta="right">{t('journals.debit')}</Table.Th>
              <Table.Th ta="right">{t('journals.credit')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {journals.map((journal) => (
              <Table.Tr key={journal.id}>
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  {journal.transactionDate ? dateFormatV1(journal.transactionDate) : '—'}
                </Table.Td>
                <Table.Td>{journal.description || '—'}</Table.Td>
                <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {journal.debit ? formatCurrency(journal.debit) : '—'}
                </Table.Td>
                <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {journal.credit ? formatCurrency(journal.credit) : '—'}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};

export default UnmatchedJournals;
