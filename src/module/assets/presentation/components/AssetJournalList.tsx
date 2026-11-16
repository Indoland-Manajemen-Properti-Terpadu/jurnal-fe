import {
  Accordion,
  Anchor,
  Badge,
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconArrowUpRight, IconBook2, IconCircleCheck } from '@tabler/icons-react';
import { Link, generatePath } from 'react-router-dom';
import { routes } from '@/router/routes';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { AssetJournal, AssetJournalLine } from '@/module/assets/domain/asset';
import { sumJournalLines } from '@/module/assets/domain/assetRules';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

export type AssetJournalListProps = {
  journals: AssetJournal[];
  loading: boolean;
};

const HEADER_PROPS = { size: 'xs', fw: 700, c: 'dimmed', tt: 'uppercase' } as const;

/** An account as on the journal detail: its number in a muted line above the name. */
function AccountCell({ line }: Readonly<{ line: AssetJournalLine }>) {
  return (
    <Box pl={line.credit > 0 ? 'lg' : 0}>
      {line.accountNumber && (
        <Text fz="xs" c="dimmed" fw={500} className={classes.number} ta="left">
          {line.accountNumber}
        </Text>
      )}
      <Text fz="sm" fw={600} c="dark.9">
        {line.accountName || line.accountNumber}
      </Text>
    </Box>
  );
}

function Amount({ value, precision }: Readonly<{ value: number; precision: number }>) {
  return value > 0 ? (
    <Text fz="sm" fw={600} c="dark.9" className={classes.number}>
      {formatAssetMoney(value, precision)}
    </Text>
  ) : (
    <Text fz="sm" c="dimmed" className={classes.number}>
      —
    </Text>
  );
}

/** Debit and credit lines of one journal in a framed table, closed by the balanced total. */
function JournalLines({ journal }: Readonly<{ journal: AssetJournal }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const totals = sumJournalLines(journal.lines);
  const balanced = totals.debit === totals.credit;

  return (
    <Paper withBorder radius="md" p={0} bg="white" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={480}>
        <Table verticalSpacing="sm" horizontalSpacing="md" fz="sm">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>
                <Text {...HEADER_PROPS}>{t('journalAccount')}</Text>
              </Table.Th>
              <Table.Th ta="right" w="26%">
                <Text {...HEADER_PROPS}>{t('debit')}</Text>
              </Table.Th>
              <Table.Th ta="right" w="26%">
                <Text {...HEADER_PROPS}>{t('credit')}</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {journal.lines.map((line, index) => (
              <Table.Tr key={`${line.accountNumber}-${index}`}>
                <Table.Td>
                  <AccountCell line={line} />
                </Table.Td>
                <Table.Td ta="right">
                  <Amount value={line.debit} precision={precision} />
                </Table.Td>
                <Table.Td ta="right">
                  <Amount value={line.credit} precision={precision} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr bg="gray.0">
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <Text fz="sm" fw={700}>
                    {t('journalTotal')}
                  </Text>
                  {balanced && (
                    <Badge
                      size="sm"
                      variant="light"
                      color="teal"
                      radius="sm"
                      tt="none"
                      leftSection={<IconCircleCheck size={12} />}
                    >
                      {t('journalBalanced')}
                    </Badge>
                  )}
                </Group>
              </Table.Td>
              <Table.Td ta="right" fw={700} className={classes.number}>
                {formatAssetMoney(totals.debit, precision)}
              </Table.Td>
              <Table.Td ta="right" fw={700} className={classes.number}>
                {formatAssetMoney(totals.credit, precision)}
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

/** Journals posted for the asset, each opened on demand to show its debit and credit lines. */
export function AssetJournalList({ journals, loading }: Readonly<AssetJournalListProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');

  return (
    <AssetCard icon={IconBook2} title={t('journalsTitle')} subtitle={t('journalsSub')}>
      {loading ? (
        <Stack gap="xs">
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
        </Stack>
      ) : journals.length === 0 ? (
        <EmptyState
          title={t('journalsEmptyTitle')}
          description={t('journalsEmptyDesc')}
          icon={<IconBook2 size={36} stroke={1.5} />}
          py={32}
        />
      ) : (
        <Accordion
          chevronPosition="right"
          variant="separated"
          radius="md"
          classNames={{ item: classes.journalItem, content: classes.journalContent }}
        >
          {journals.map((journal) => {
            const voided = journal.status !== 'ACTIVE';
            const total = sumJournalLines(journal.lines).debit;
            return (
              <Accordion.Item key={journal.id} value={journal.id}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap" gap="md" pr="xs">
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="dark.9" lineClamp={1}>
                        {journal.notes || t('journalNumber', { number: journal.transactionNumber })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('journalNumber', { number: journal.transactionNumber })} ·{' '}
                        {formatAssetDate(journal.date)}
                      </Text>
                    </Box>
                    <Group gap="md" wrap="nowrap">
                      <Text fz="sm" fw={700} c="dark.9" className={classes.number}>
                        {formatAssetMoney(total, precision)}
                      </Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={voided ? 'gray' : 'teal'}
                        radius="sm"
                        tt="none"
                      >
                        {voided ? t('journalVoid') : t('journalPosted')}
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <JournalLines journal={journal} />
                  <Group justify="flex-end" mt="sm">
                    <Anchor
                      component={Link}
                      to={generatePath(routes.journalEntries.detail, {
                        idTransaction: journal.id,
                      })}
                      fz="xs"
                      fw={600}
                    >
                      <Group gap={4} wrap="nowrap">
                        {t('journalOpen')}
                        <IconArrowUpRight size={14} />
                      </Group>
                    </Anchor>
                  </Group>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </AssetCard>
  );
}

export default AssetJournalList;
