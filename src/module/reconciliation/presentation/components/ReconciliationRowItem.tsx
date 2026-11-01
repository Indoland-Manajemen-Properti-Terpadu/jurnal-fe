import { ActionIcon, Box, Checkbox, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { CheckCircle, MagnifyingGlass, Trash } from '@phosphor-icons/react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { BankStatementData, JournalDetail } from '../../domain/reconciliation';
import DirectionBadge from './DirectionBadge';

interface ReconciliationRowItemProps {
  bankStatement: BankStatementData;
  journalTransactions: JournalDetail[];
  selected: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onFind: (bankStatement: BankStatementData) => void;
}

const ReconciliationRowItem: React.FC<ReconciliationRowItemProps> = ({
  bankStatement,
  journalTransactions,
  selected,
  onToggle,
  onRemove,
  onFind,
}) => {
  const { t } = useTranslation('reconciliation');
  const hasJournals = journalTransactions.length > 0;

  return (
    <SimpleGrid cols={2} spacing={0} style={{ borderTop: `1px solid ${themeColors.gray[1]}` }}>
      {/* Left side: bank statement */}
      <Box p="md" bg={themeColors.blue[0]} style={{ position: 'relative' }}>
        <Group wrap="nowrap" align="center" gap="md">
          <Checkbox
            size="xs"
            radius="xs"
            disabled={!hasJournals}
            checked={selected}
            onChange={() => onToggle(bankStatement.id)}
            color={themeColors.primary[6]}
            styles={{
              input: {
                cursor: !hasJournals ? 'not-allowed' : 'pointer',
                '&:not(:checked)': {
                  backgroundColor: 'white',
                },
              },
            }}
          />
          <Paper
            withBorder
            p="sm"
            radius="md"
            flex={1}
            bg="white"
            style={{ borderLeft: `4px solid ${themeColors.blue[6]}` }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Stack gap={0}>
                  <Text size="xs" c={themeColors.gray[6]} fw={400}>
                    {dateFormatV1(bankStatement.date)}
                  </Text>
                  <Text size="sm" fw={600} c={themeColors.black[9]} lineClamp={1}>
                    {bankStatement.description}
                  </Text>
                </Stack>
                <Stack align="flex-end" gap={4}>
                  <DirectionBadge received={bankStatement.amount > 0} capitalize />
                  <Text size="md" fw={700} c={themeColors.black[9]}>
                    {formatCurrency(Math.abs(bankStatement.amount))}
                  </Text>
                </Stack>
              </Group>
              <Group justify="space-between" align="flex-end">
                {hasJournals ? (
                  <Group gap={4}>
                    <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                    <Text size="xs" c={themeColors.green[6]} fw={500}>
                      {t('row.matchedCount', { count: journalTransactions.length })}
                    </Text>
                  </Group>
                ) : (
                  <Group
                    gap={4}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onFind(bankStatement)}
                  >
                    <MagnifyingGlass size={16} color={themeColors.gray[5]} />
                    <Text size="xs" c={themeColors.gray[6]} fw={500}>
                      {t('row.unmatched')}
                    </Text>
                  </Group>
                )}
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => onRemove(bankStatement.id)}
                >
                  <Trash size={18} weight="regular" color={themeColors.gray[5]} />
                </ActionIcon>
              </Group>
            </Stack>
          </Paper>
        </Group>
      </Box>

      {/* Right side: journal match */}
      <Box
        p="md"
        bg={themeColors.primary[0]}
        style={{ borderLeft: `1px solid ${themeColors.gray[1]}` }}
      >
        {hasJournals ? (
          <Stack gap="sm" h="100%" justify="center">
            {journalTransactions.map((jt, idx) => (
              <Paper
                key={idx}
                withBorder
                p="sm"
                radius="md"
                bg="white"
                style={{ borderLeft: `4px solid ${themeColors.primary[6]}` }}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={0}>
                      <Text size="xs" c={themeColors.gray[6]} fw={400}>
                        {dateFormatV1(jt.transactionDate)}
                      </Text>
                      <Text size="sm" fw={600} c={themeColors.black[9]} lineClamp={1}>
                        {jt.transactionNumber
                          ? t('row.journalNumber', { number: jt.transactionNumber })
                          : jt.description}
                      </Text>
                    </Stack>
                    <Stack align="flex-end" gap={4}>
                      <DirectionBadge received={jt.debit > 0} capitalize />
                      <Text size="md" fw={700} c={themeColors.black[9]}>
                        {formatCurrency(jt.credit || jt.debit)}
                      </Text>
                    </Stack>
                  </Group>
                  <Group justify="space-between" align="flex-end">
                    <Group gap={4}>
                      <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                      <Text size="xs" c={themeColors.green[6]} fw={500}>
                        {t('row.matchedWith', { description: bankStatement.description })}
                      </Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => onRemove(bankStatement.id)}
                    >
                      <Trash size={18} weight="regular" color={themeColors.gray[5]} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box
            h="100%"
            style={{
              border: `1px dashed ${themeColors.primary[4]}`,
              borderRadius: '12px',
              backgroundColor: themeColors.primary[0],
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: '110px',
            }}
            onClick={() => onFind(bankStatement)}
          >
            <Group gap={6}>
              <MagnifyingGlass size={20} weight="bold" color={themeColors.primary[5]} />
              <Text size="sm" fw={600} c={themeColors.primary[6]}>
                {t('row.findAndMatch')}
              </Text>
            </Group>
            <Text size="xs" c={themeColors.primary[6]} fw={500}>
              {t('row.pickJournal')}
            </Text>
          </Box>
        )}
      </Box>
    </SimpleGrid>
  );
};

export default ReconciliationRowItem;
