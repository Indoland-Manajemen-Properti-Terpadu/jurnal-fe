import { Box, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';

/** Negative balances are shown in parentheses, zero or missing as 0. */
const formatBalance = (amount?: number): string => {
  if (!amount) return formatCurrency(0);
  return amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount);
};

interface ReconciliationBalanceHeaderProps {
  bankBalance?: number;
  bookBalance?: number;
}

const ReconciliationBalanceHeader: React.FC<ReconciliationBalanceHeaderProps> = ({
  bankBalance,
  bookBalance,
}) => {
  const { t } = useTranslation('reconciliation');
  return (
    <SimpleGrid cols={2} spacing={0}>
      <Box bg={themeColors.blue[1]} p="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Text size="xs" fw={500} c={themeColors.blue[6]}>
              {t('header.source')}
            </Text>
            <Text size="sm" fw={600} c={themeColors.black[9]}>
              {t('header.bankStatement')}
            </Text>
          </Stack>
          <Stack gap={0} align="flex-end">
            <Text size="xs" fw={500} c={themeColors.gray[6]}>
              {t('header.balance')}
            </Text>
            <Text size="sm" fw={600} c={themeColors.black[9]}>
              {formatBalance(bankBalance)}
            </Text>
          </Stack>
        </Group>
      </Box>
      <Box
        bg={themeColors.primary[1]}
        p="md"
        style={{ borderLeft: `1px solid ${themeColors.gray[1]}` }}
      >
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Text size="xs" fw={500} c={themeColors.primary[6]}>
              {t('header.bookkeeping')}
            </Text>
            <Text size="sm" fw={600} c={themeColors.black[9]}>
              {t('header.journal')}
            </Text>
          </Stack>
          <Stack gap={0} align="flex-end">
            <Text size="xs" fw={500} c={themeColors.gray[6]}>
              {t('header.balance')}
            </Text>
            <Text size="sm" fw={600} c={themeColors.black[9]}>
              {formatBalance(bookBalance)}
            </Text>
          </Stack>
        </Group>
      </Box>
    </SimpleGrid>
  );
};

export default ReconciliationBalanceHeader;
