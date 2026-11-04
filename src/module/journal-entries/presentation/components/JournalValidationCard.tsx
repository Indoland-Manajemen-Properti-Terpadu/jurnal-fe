import React from 'react';
import { Divider, Group, Paper, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { validateDraft } from '../../domain/journalRules';
import { useTransactionStore } from '../store/useTransactionStore';

interface JournalValidationCardProps {
  transactionDate: string;
  /** The save button; it sits under the checklist it depends on. */
  action?: React.ReactNode;
}

export const JournalValidationCard: React.FC<JournalValidationCardProps> = ({
  transactionDate,
  action,
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
  const passed = checks.filter((check) => check.pass).length;

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="none">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <div>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('validation.title')}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('validation.subtitle')}
          </Text>
        </div>
        <Text
          fz="var(--jurnal-text-sm)"
          fw={700}
          c={allPassed ? 'teal.7' : 'dimmed'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {passed}/{checks.length}
        </Text>
      </Group>

      <Progress
        value={(passed / checks.length) * 100}
        size="xs"
        radius="xl"
        color={allPassed ? 'teal' : 'primary'}
        mt="sm"
        aria-label={t('validation.title')}
      />
      <Text fz="var(--jurnal-text-xs)" fw={600} c={allPassed ? 'teal.7' : 'dimmed'} mt={6}>
        {allPassed ? t('validation.ready') : t('validation.incomplete')}
      </Text>

      <Stack gap="xs" mt="md">
        {checks.map((check) => (
          <Group key={check.id} gap="sm" wrap="nowrap" align="flex-start">
            <ThemeIcon
              size={18}
              radius="xl"
              color={check.pass ? 'teal' : 'gray'}
              variant={check.pass ? 'filled' : 'light'}
              style={{ flexShrink: 0 }}
            >
              {check.pass ? <IconCheck size={12} stroke={3} /> : null}
            </ThemeIcon>
            <Text fz="var(--jurnal-text-sm)" c={check.pass ? 'dark.8' : 'dimmed'} lh={1.35}>
              {check.label}
            </Text>
          </Group>
        ))}
      </Stack>

      {action && (
        <>
          <Divider my="md" />
          {action}
        </>
      )}
    </Paper>
  );
};
