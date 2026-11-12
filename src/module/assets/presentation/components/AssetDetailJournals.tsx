import { Accordion, Box, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { AssetJournal } from '@/module/assets/domain/asset';
import { sumJournalLines } from '@/module/assets/domain/assetRules';
import { AssetSectionCard } from '@/module/assets/presentation/components/AssetSectionCard';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

export type AssetDetailJournalsProps = {
  journals: AssetJournal[];
  loading: boolean;
};

const HEADER_PROPS = { size: 'xs', fw: 700, c: 'dimmed', tt: 'uppercase' } as const;
const amount = (value: number, precision: number) =>
  value > 0 ? formatAssetMoney(value, precision) : '—';

/** Journals posted for the asset, each opened on demand to show its debit and credit lines. */
export function AssetDetailJournals({ journals, loading }: Readonly<AssetDetailJournalsProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');

  return (
    <AssetSectionCard
      icon={IconBook2}
      title={t('journalsTitle')}
      subtitle={t('journalsSub')}
      right={
        journals.length > 0 ? (
          <Text size="xs" c="dimmed" fw={600} style={{ whiteSpace: 'nowrap' }}>
            {t('journalCount', { count: journals.length })}
          </Text>
        ) : undefined
      }
    >
      {loading ? (
        <Stack gap="xs">
          <Skeleton height={48} radius="md" />
          <Skeleton height={48} radius="md" />
        </Stack>
      ) : journals.length === 0 ? (
        <EmptyState
          title={t('journalsEmptyTitle')}
          description={t('journalsEmptyDesc')}
          icon={<IconBook2 size={36} stroke={1.5} />}
          py={32}
        />
      ) : (
        <Accordion chevronPosition="right" variant="default">
          {journals.map((journal) => {
            const totals = sumJournalLines(journal.lines);
            const voided = journal.status !== 'ACTIVE';
            return (
              <Accordion.Item key={journal.id} value={journal.id}>
                <Accordion.Control px={0}>
                  <Group justify="space-between" wrap="nowrap" gap="md" pr="xs">
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} lineClamp={1}>
                        {journal.notes || t('journalNumber', { number: journal.transactionNumber })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('journalNumber', { number: journal.transactionNumber })} ·{' '}
                        {formatAssetDate(journal.date)}
                      </Text>
                    </Box>
                    <Text
                      size="xs"
                      fw={600}
                      c={voided ? 'dimmed' : 'teal.8'}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {voided ? t('journalVoid') : t('journalPosted')}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Table.ScrollContainer minWidth={420}>
                    <Table verticalSpacing="xs" horizontalSpacing="sm" fz="sm">
                      <Table.Thead bg="gray.0">
                        <Table.Tr>
                          <Table.Th>
                            <Text {...HEADER_PROPS}>{t('journalAccount')}</Text>
                          </Table.Th>
                          <Table.Th ta="right">
                            <Text {...HEADER_PROPS}>{t('debit')}</Text>
                          </Table.Th>
                          <Table.Th ta="right">
                            <Text {...HEADER_PROPS}>{t('credit')}</Text>
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {journal.lines.map((line, index) => (
                          <Table.Tr key={`${line.account}-${index}`}>
                            <Table.Td pl={line.credit > 0 ? 'xl' : 'sm'}>{line.account}</Table.Td>
                            <Table.Td className={classes.number}>
                              {amount(line.debit, precision)}
                            </Table.Td>
                            <Table.Td className={classes.number}>
                              {amount(line.credit, precision)}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                      <Table.Tfoot>
                        <Table.Tr bg="gray.0">
                          <Table.Td fw={700}>{t('journalTotal')}</Table.Td>
                          <Table.Td className={classes.number} fw={700}>
                            {formatAssetMoney(totals.debit, precision)}
                          </Table.Td>
                          <Table.Td className={classes.number} fw={700}>
                            {formatAssetMoney(totals.credit, precision)}
                          </Table.Td>
                        </Table.Tr>
                      </Table.Tfoot>
                    </Table>
                  </Table.ScrollContainer>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </AssetSectionCard>
  );
}

export default AssetDetailJournals;
