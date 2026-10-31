import React from 'react';
import { Badge, Box, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowDownRight, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';

import type { JournalAccounts } from '@/module/chart-of-accounts';

import { useTranslation } from '@/i18n';

interface ReceiveMoneySummaryPanelProps {
  isFormValid: boolean;
  selectedDepositAccount: JournalAccounts | undefined;
  totalAmount: number;
  itemCount: number;
  isPending: boolean;
}

export const ReceiveMoneySummaryPanel: React.FC<ReceiveMoneySummaryPanelProps> = ({
  isFormValid,
  selectedDepositAccount,
  totalAmount,
  itemCount,
  isPending,
}) => {
  const { t: tb } = useTranslation('bankCash');
  const navigate = useNavigate();

  return (
    <Box pos="sticky" top={20}>
      <Stack gap="md">
        {/* Live Summary Card */}
        <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} size="sm" c="dark.8">
                {tb('receive.summaryTitle')}
              </Text>
              <Badge
                size="sm"
                variant="light"
                color={isFormValid ? 'teal' : 'gray'}
                leftSection={isFormValid ? <IconCheck size={12} /> : undefined}
              >
                {isFormValid ? tb('common.balanced') : tb('common.incomplete')}
              </Badge>
            </Group>

            {/* Rekening Tujuan Box */}
            <Paper withBorder radius="sm" p="xs" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                {tb('receive.receivingAccount')}
              </Text>
              <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                {selectedDepositAccount?.name || tb('common.notSelected')}
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="dimmed">
                  {tb('common.currentBalance')}
                </Text>
                <Text size="xs" fw={600} c="dark.7">
                  {formatCurrency(selectedDepositAccount?.amount || 0)}
                </Text>
              </Group>
              {totalAmount > 0 && selectedDepositAccount && (
                <Group justify="space-between" mt={2}>
                  <Text size="xs" c="teal.7" fw={600}>
                    {tb('receive.estimateAfter')}
                  </Text>
                  <Text size="xs" fw={700} c="teal.7">
                    {formatCurrency((selectedDepositAccount.amount || 0) + totalAmount)}
                  </Text>
                </Group>
              )}
            </Paper>

            {/* Total Kas Masuk Box */}
            <Paper
              withBorder
              radius="sm"
              p="sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--mantine-color-teal-0) 0%, var(--mantine-color-green-0) 100%)',
                borderColor: 'var(--mantine-color-teal-3)',
              }}
            >
              <Text size="xs" c="teal.9" fw={600} tt="uppercase">
                {tb('receive.totalLabel')}
              </Text>
              <Text
                size="xl"
                fw={800}
                c="teal.9"
                mt={2}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(totalAmount)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {tb('receive.allocatedTo', { count: itemCount })}
              </Text>
            </Paper>
          </Stack>
        </Paper>

        {/* Accounting Tips */}
        <Paper withBorder radius="md" p="sm" bg="gray.0">
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <ThemeIcon
              size={22}
              radius="xl"
              variant="light"
              color="blue"
              style={{ flexShrink: 0, marginTop: 2 }}
            >
              <IconInfoCircle size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed" lh={1.5}>
              <b>{tb('common.doubleEntryPrinciple')}</b> {tb('receive.principle')}
            </Text>
          </Group>
        </Paper>

        {/* Actions */}
        <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
          <Stack gap="xs">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'teal.6', to: 'green.6', deg: 135 }}
              size="md"
              radius="md"
              fullWidth
              loading={isPending}
              disabled={!isFormValid}
              leftSection={<IconArrowDownRight size={18} />}
            >
              {tb('receive.submit')}
            </Button>

            <Button
              variant="default"
              size="sm"
              radius="md"
              fullWidth
              onClick={() => navigate(routes.BankAndCash.Main)}
            >
              {tb('common.cancel')}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ReceiveMoneySummaryPanel;
