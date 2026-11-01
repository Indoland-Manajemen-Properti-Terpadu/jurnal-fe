import React from 'react';
import { Badge, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCircleDot, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { validateDraft } from '../../domain/journalRules';
import { useTransactionStore } from '../store/useTransactionStore';

interface JournalValidationCardProps {
  transactionDate: string;
}

export const JournalValidationCard: React.FC<JournalValidationCardProps> = ({
  transactionDate,
}) => {
  const { t } = useTranslation('journalEntries');
  const transactions = useTransactionStore((state) => state.transactions);
  const result = validateDraft(transactions, transactionDate);
  const allPassed = Object.values(result).every(Boolean);

  const checks = [
    { id: 'hasDate', label: t('validation.hasDate'), pass: result.hasDate },
    { id: 'hasMinRows', label: t('validation.hasMinRows'), pass: result.hasMinRows },
    { id: 'allAccounts', label: t('validation.allAccounts'), pass: result.allAccountsSelected },
    { id: 'allAmounts', label: t('validation.allAmounts'), pass: result.allRowsHaveAmount },
    { id: 'balanced', label: t('validation.balanced'), pass: result.isBalanced },
  ];

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" variant="light" color={allPassed ? 'green' : 'blue'}>
            <IconShieldCheck size={16} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('validation.title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('validation.subtitle')}
            </Text>
          </div>
        </Group>
        <Badge
          color={allPassed ? 'green' : 'gray'}
          variant={allPassed ? 'filled' : 'light'}
          size="xs"
        >
          {allPassed ? t('validation.ready') : t('validation.incomplete')}
        </Badge>
      </Group>

      <Divider my="xs" />

      <Stack gap={8}>
        {checks.map((c) => (
          <Group key={c.id} justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <ThemeIcon
                size={18}
                radius="xl"
                color={c.pass ? 'green' : 'gray'}
                variant={c.pass ? 'filled' : 'light'}
              >
                {c.pass ? <IconCheck size={12} stroke={2.5} /> : <IconCircleDot size={12} />}
              </ThemeIcon>
              <Text
                fz="var(--jurnal-text-xs)"
                c={c.pass ? 'dark.8' : 'dimmed'}
                fw={c.pass ? 500 : 400}
              >
                {c.label}
              </Text>
            </Group>
            <Badge size="xs" variant="light" color={c.pass ? 'green' : 'gray'}>
              {c.pass ? t('validation.ok') : t('validation.pending')}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};
