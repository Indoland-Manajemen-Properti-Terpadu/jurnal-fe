import { Box, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashTypes';

interface Props {
  fund: PettyCashFund;
  labels: {
    available: string;
    ceiling: string;
    unreimbursed: string;
    accountability: string;
    used: string;
    lowBalance: string;
    availableStatus: string;
  };
}

export function PettyCashBalancePanel({ fund, labels }: Props) {
  const usedPercentage =
    fund.pagu > 0 ? Math.round((fund.pendingReimburseAmount / fund.pagu) * 100) : 0;
  const isLow = fund.currentBalance <= fund.minThresholdAlert;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} bg="white">
      <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap">
        <Box>
          <Text size="sm" c="dimmed" fw={600}>
            {labels.available}
          </Text>
          <Text fz={{ base: 30, sm: 38 }} fw={700} lh={1.1} c="dark.9" mt={6}>
            {formatCurrency(fund.currentBalance)}
          </Text>
        </Box>
        <Text size="xs" c={isLow ? 'orange.8' : 'primary.8'} fw={700}>
          {isLow ? labels.lowBalance : labels.availableStatus}
        </Text>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="lg">
        <Stack gap={3}>
          <Text size="xs" c="dimmed">
            {labels.ceiling}
          </Text>
          <Text fw={650}>{formatCurrency(fund.pagu)}</Text>
        </Stack>
        <Stack gap={3}>
          <Text size="xs" c="dimmed">
            {labels.unreimbursed}
          </Text>
          <Text fw={650}>{formatCurrency(fund.pendingReimburseAmount)}</Text>
        </Stack>
        <Stack gap={3}>
          <Text size="xs" c="dimmed">
            {labels.accountability}
          </Text>
          <Text fw={650}>{formatCurrency(fund.currentBalance + fund.pendingReimburseAmount)}</Text>
        </Stack>
      </SimpleGrid>
      <Box mt="lg">
        <Group justify="space-between" mb={6}>
          <Text size="xs" c="dimmed">
            {labels.used}
          </Text>
          <Text size="xs" fw={700}>
            {usedPercentage}%
          </Text>
        </Group>
        <Progress
          value={usedPercentage}
          color={isLow ? 'orange' : 'primary'}
          radius="xl"
          size={7}
        />
      </Box>
    </Paper>
  );
}
