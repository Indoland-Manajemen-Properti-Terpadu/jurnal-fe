import React from 'react';
import { Badge, Box, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconArrowsExchange, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';

import type { JournalAccounts } from '@/module/chart-of-accounts';

interface TransferMoneySummaryPanelProps {
  isFormValid: boolean;
  selectedFromAccount: JournalAccounts | undefined;
  selectedToAccount: JournalAccounts | undefined;
  amount: number;
  isPending: boolean;
}

export const TransferMoneySummaryPanel: React.FC<TransferMoneySummaryPanelProps> = ({
  isFormValid,
  selectedFromAccount,
  selectedToAccount,
  amount,
  isPending,
}) => {
  const navigate = useNavigate();

  return (
    <Box pos="sticky" top={20}>
      <Stack gap="md">
        {/* Live Preview Card */}
        <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} size="sm" c="dark.8">
                Simulasi Mutasi Saldo
              </Text>
              <Badge
                size="sm"
                variant="light"
                color={isFormValid ? 'teal' : 'gray'}
                leftSection={isFormValid ? <IconCheck size={12} /> : undefined}
              >
                {isFormValid ? 'Siap Dibukukan' : 'Belum Lengkap'}
              </Badge>
            </Group>

            {/* Visual Flow from Account to Account */}
            <Paper withBorder radius="sm" p="xs" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Akun Asal (Keluar / Kredit)
              </Text>
              <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                {selectedFromAccount?.name || '—'}
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="dimmed">
                  Saldo Saat Ini:
                </Text>
                <Text size="xs" fw={600} c="dark.7">
                  {formatCurrency(selectedFromAccount?.amount || 0)}
                </Text>
              </Group>
              {amount > 0 && selectedFromAccount && (
                <Group justify="space-between" mt={2}>
                  <Text size="xs" c="red.7" fw={600}>
                    Setelah Transfer:
                  </Text>
                  <Text size="xs" fw={700} c="red.7">
                    {formatCurrency((selectedFromAccount.amount || 0) - amount)}
                  </Text>
                </Group>
              )}
            </Paper>

            <Group justify="center" my={-4}>
              <ThemeIcon size={26} radius="xl" variant="light" color="primary">
                <IconArrowRight size={14} />
              </ThemeIcon>
            </Group>

            <Paper withBorder radius="sm" p="xs" bg="gray.0">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Akun Tujuan (Masuk / Debit)
              </Text>
              <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                {selectedToAccount?.name || '—'}
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="dimmed">
                  Saldo Saat Ini:
                </Text>
                <Text size="xs" fw={600} c="dark.7">
                  {formatCurrency(selectedToAccount?.amount || 0)}
                </Text>
              </Group>
              {amount > 0 && selectedToAccount && (
                <Group justify="space-between" mt={2}>
                  <Text size="xs" c="teal.7" fw={600}>
                    Setelah Transfer:
                  </Text>
                  <Text size="xs" fw={700} c="teal.7">
                    {formatCurrency((selectedToAccount.amount || 0) + amount)}
                  </Text>
                </Group>
              )}
            </Paper>

            {/* Total Nominal Transfer Box */}
            <Paper
              withBorder
              radius="sm"
              p="sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-secondary-0) 100%)',
                borderColor: 'var(--mantine-color-primary-2)',
              }}
            >
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Total Nominal Ditransfer
              </Text>
              <Text
                size="lg"
                fw={800}
                c="primary.9"
                mt={2}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(amount)}
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
              <b>Prinsip Akuntansi:</b> Pemindahan dana antar rekening mencatat Debit pada kas
              penerima dan Kredit pada kas pengirim dengan nilai seimbang, tanpa menimbulkan beban
              atau pendapatan.
            </Text>
          </Group>
        </Paper>

        {/* Actions */}
        <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
          <Stack gap="xs">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
              size="md"
              radius="md"
              fullWidth
              loading={isPending}
              disabled={!isFormValid}
              leftSection={<IconArrowsExchange size={18} />}
            >
              Proses Transfer Uang
            </Button>

            <Button
              variant="default"
              size="sm"
              radius="md"
              fullWidth
              onClick={() => navigate(routes.BankAndCash.Main)}
            >
              Batal
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default TransferMoneySummaryPanel;
