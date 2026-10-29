import React from 'react';
import { Badge, Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconCircleDot,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';

interface JournalValidationCardProps {
  transactionDate: string;
}

export const JournalValidationCard: React.FC<JournalValidationCardProps> = ({
  transactionDate,
}) => {
  const { transactions, totalDebit, totalCredit } = useTransactionStore();

  const hasDate = !!transactionDate;
  const hasMinRows = transactions.length >= 2;
  const allAccountsSelected = transactions.length > 0 && transactions.every((t) => !!t.account);
  const allRowsHaveAmount =
    transactions.length > 0 &&
    transactions.every(
      (t) =>
        (parseFloat(`${t.debit}`) > 0 || parseFloat(`${t.credit}`) > 0) &&
        !(parseFloat(`${t.debit}`) > 0 && parseFloat(`${t.credit}`) > 0)
    );
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalCredit > 0 && diff === 0;

  const allPassed = hasDate && hasMinRows && allAccountsSelected && allRowsHaveAmount && isBalanced;

  const checks = [
    { label: 'Tanggal transaksi telah dipilih', pass: hasDate },
    { label: 'Minimal 2 baris akun terisi', pass: hasMinRows },
    { label: 'Setiap baris telah memilih akun', pass: allAccountsSelected },
    { label: 'Setiap baris terisi nominal debit/kredit', pass: allRowsHaveAmount },
    { label: 'Total Debit & Kredit seimbang', pass: isBalanced },
  ];

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" variant="light" color={allPassed ? 'green' : 'blue'}>
            <IconShieldCheck size={16} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={13} c="dark.8">
              Verifikasi Validitas Jurnal
            </Text>
            <Text fz={11} c="dimmed">
              Pengecekan otomatis kepatuhan sistem
            </Text>
          </div>
        </Group>
        <Badge
          color={allPassed ? 'green' : 'gray'}
          variant={allPassed ? 'filled' : 'light'}
          size="xs"
        >
          {allPassed ? 'Siap Dibukukan' : 'Belum Lengkap'}
        </Badge>
      </Group>

      <Divider my="xs" />

      <Stack gap={8}>
        {checks.map((c, i) => (
          <Group key={i} justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <ThemeIcon
                size={18}
                radius="xl"
                color={c.pass ? 'green' : 'gray'}
                variant={c.pass ? 'filled' : 'light'}
              >
                {c.pass ? <IconCheck size={12} stroke={2.5} /> : <IconCircleDot size={12} />}
              </ThemeIcon>
              <Text fz={12} c={c.pass ? 'dark.8' : 'dimmed'} fw={c.pass ? 500 : 400}>
                {c.label}
              </Text>
            </Group>
            <Badge size="xs" variant="light" color={c.pass ? 'green' : 'gray'}>
              {c.pass ? 'OK' : 'Belum'}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};
