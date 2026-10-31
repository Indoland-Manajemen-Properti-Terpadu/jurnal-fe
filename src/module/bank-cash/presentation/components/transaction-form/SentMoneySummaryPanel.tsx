import React from 'react';
import { Alert, Badge, Box, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconArrowUpRight, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';

import type { JournalAccounts } from '@/module/chart-of-accounts';

import { useTranslation } from '@/i18n';

interface SentMoneySummaryPanelProps {
  isFormValid: boolean;
  selectedPayAccount: JournalAccounts | undefined;
  totalAmount: number;
  isOverdraft: boolean;
  remainingBalance: number;
  itemCount: number;
  isPending: boolean;
}

export const SentMoneySummaryPanel: React.FC<SentMoneySummaryPanelProps> = ({
  isFormValid,
  selectedPayAccount,
  totalAmount,
  isOverdraft,
  remainingBalance,
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
                {tb('sent.summaryTitle')}
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

            {/* Rekening Pembayar Box */}
            <Paper withBorder radius="sm" p="xs" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                {tb('sent.payingAccount')}
              </Text>
              <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                {selectedPayAccount?.name || tb('common.notSelected')}
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="dimmed">
                  {tb('common.currentBalance')}
                </Text>
                <Text size="xs" fw={600} c="dark.7">
                  {formatCurrency(selectedPayAccount?.amount || 0)}
                </Text>
              </Group>
              {totalAmount > 0 && selectedPayAccount && (
                <Group justify="space-between" mt={2}>
                  <Text size="xs" c={isOverdraft ? 'red.7' : 'dark.7'} fw={600}>
                    {tb('sent.estimateRemaining')}
                  </Text>
                  <Text size="xs" fw={700} c={isOverdraft ? 'red.7' : 'dark.8'}>
                    {formatCurrency(remainingBalance)}
                  </Text>
                </Group>
              )}
            </Paper>

            {/* Total Kas Keluar Box */}
            <Paper
              withBorder
              radius="sm"
              p="sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--mantine-color-orange-0) 0%, var(--mantine-color-red-0) 100%)',
                borderColor: 'var(--mantine-color-orange-3)',
              }}
            >
              <Text size="xs" c="orange.9" fw={600} tt="uppercase">
                {tb('sent.totalLabel')}
              </Text>
              <Text
                size="xl"
                fw={800}
                c="orange.9"
                mt={2}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(totalAmount)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {tb('sent.allocatedTo', { count: itemCount })}
              </Text>
            </Paper>

            {isOverdraft && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="orange"
                variant="light"
                radius="md"
              >
                {tb('sent.overdraft')}
              </Alert>
            )}
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
              <b>{tb('common.doubleEntryPrinciple')}</b> {tb('sent.principle')}
            </Text>
          </Group>
        </Paper>

        {/* Actions */}
        <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
          <Stack gap="xs">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'orange.6', to: 'red.6', deg: 135 }}
              size="md"
              radius="md"
              fullWidth
              loading={isPending}
              disabled={!isFormValid}
              leftSection={<IconArrowUpRight size={18} />}
            >
              {tb('sent.submit')}
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

export default SentMoneySummaryPanel;
