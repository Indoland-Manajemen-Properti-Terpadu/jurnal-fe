import { ActionIcon, Button, Checkbox, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { BankStatementData, JournalDetail } from '../../domain/reconciliation';
import DirectionText from './DirectionText';
import classes from './ReconciliationRowItem.module.css';

interface ReconciliationRowItemProps {
  bankStatement: BankStatementData;
  journalTransactions: JournalDetail[];
  /** Days between the statement and the top suggestion. */
  dayDifference?: number;
  selected: boolean;
  /** Another selected row already holds the journal line this row suggests. */
  blocked: boolean;
  /** Another row suggests one of the same journal lines. */
  sharesSuggestion: boolean;
  onToggle: (id: string) => void;
  onDismiss: (id: string) => void;
  onFind: (bankStatement: BankStatementData) => void;
}

const amountText = (amount: number) => (
  <Text
    fz="var(--jurnal-text-md)"
    fw={700}
    c="dark.8"
    style={{ fontVariantNumeric: 'tabular-nums' }}
  >
    {formatCurrency(Math.abs(amount))}
  </Text>
);

/** One statement row on the left, its suggested journal lines (or a search) on the right. */
const ReconciliationRowItem: React.FC<ReconciliationRowItemProps> = ({
  bankStatement,
  journalTransactions,
  dayDifference,
  selected,
  blocked,
  sharesSuggestion,
  onToggle,
  onDismiss,
  onFind,
}) => {
  const { t } = useTranslation('reconciliation');
  const hasSuggestion = journalTransactions.length > 0;
  const checkboxDisabled = !hasSuggestion || (blocked && !selected);

  return (
    <div className={classes.row} data-selected={selected}>
      <div className={classes.bank}>
        <Tooltip
          label={blocked ? t('row.blockedHint') : t('row.noSuggestionHint')}
          disabled={!checkboxDisabled}
          openDelay={300}
        >
          <span>
            <Checkbox
              aria-label={t('row.select', { description: bankStatement.description })}
              checked={selected}
              disabled={checkboxDisabled}
              onChange={() => onToggle(bankStatement.id)}
            />
          </span>
        </Tooltip>
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          style={{ flex: 1, minWidth: 0 }}
        >
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {dateFormatV1(bankStatement.date)}
            </Text>
            <Text fz="var(--jurnal-text-sm)" fw={600} c="dark.8" lineClamp={2}>
              {bankStatement.description}
            </Text>
          </Stack>
          <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
            {amountText(bankStatement.amount)}
            <DirectionText received={bankStatement.amount > 0} />
          </Stack>
        </Group>
      </div>

      <div className={classes.journal}>
        {hasSuggestion ? (
          <Stack gap="xs">
            {journalTransactions.map((journal) => (
              <Group key={journal.id} justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text fz="var(--jurnal-text-xs)" c="dimmed">
                    {dateFormatV1(journal.transactionDate)}
                    {dayDifference !== undefined &&
                      ` · ${
                        dayDifference === 0
                          ? t('row.sameDay')
                          : t('row.daysApart', { count: Math.round(dayDifference) })
                      }`}
                  </Text>
                  <Text fz="var(--jurnal-text-sm)" fw={600} c="dark.8" lineClamp={2}>
                    {journal.transactionNumber
                      ? t('row.journalNumber', { number: journal.transactionNumber })
                      : journal.description || '—'}
                  </Text>
                </Stack>
                <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
                  {amountText(journal.credit || journal.debit)}
                  <DirectionText received={journal.debit > 0} />
                </Stack>
              </Group>
            ))}
            {sharesSuggestion && (
              <Group gap={6} wrap="nowrap" align="flex-start">
                <IconAlertTriangle size={14} color="var(--mantine-color-orange-7)" />
                <Text fz="var(--jurnal-text-xs)" c="orange.8">
                  {t('row.sharedWarning')}
                </Text>
              </Group>
            )}
            <Group justify="space-between" gap="xs">
              <Text fz="var(--jurnal-text-xs)" c="dimmed">
                {t('row.suggestion')}
              </Text>
              <Group gap={4}>
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  leftSection={<IconSearch size={12} />}
                  onClick={() => onFind(bankStatement)}
                >
                  {t('row.findOther')}
                </Button>
                <Tooltip label={t('row.dismiss')}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={t('row.dismiss')}
                    onClick={() => onDismiss(bankStatement.id)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Stack>
        ) : (
          <Group justify="space-between" align="center" gap="sm" h="100%">
            <Text fz="var(--jurnal-text-sm)" c="dimmed">
              {t('row.noSuggestion')}
            </Text>
            <Button
              variant="default"
              size="compact-sm"
              leftSection={<IconSearch size={14} />}
              onClick={() => onFind(bankStatement)}
            >
              {t('row.findAndMatch')}
            </Button>
          </Group>
        )}
      </div>
    </div>
  );
};

export default ReconciliationRowItem;
