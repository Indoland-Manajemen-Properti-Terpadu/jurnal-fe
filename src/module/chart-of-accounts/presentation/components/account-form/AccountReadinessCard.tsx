import React from 'react';
import { Divider, Group, Paper, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface ReadinessCheck {
  label: string;
  pass: boolean;
}

interface AccountReadinessCardProps {
  readinessChecks: ReadinessCheck[];
  passedChecksCount: number;
  isFormValid: boolean;
  /** The save button; it sits under the checklist it depends on. */
  action?: React.ReactNode;
}

/** Real-time readiness checklist, shared by the add and edit pages. */
export const AccountReadinessCard: React.FC<AccountReadinessCardProps> = ({
  readinessChecks,
  passedChecksCount,
  isFormValid,
  action,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const total = readinessChecks.length;

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="none">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <div>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('form.validationCardTitle')}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('form.validationCardSubtitle')}
          </Text>
        </div>
        <Text
          fz="var(--jurnal-text-sm)"
          fw={700}
          c={isFormValid ? 'teal.7' : 'dimmed'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {passedChecksCount}/{total}
        </Text>
      </Group>

      <Progress
        value={total ? (passedChecksCount / total) * 100 : 0}
        size="xs"
        radius="xl"
        color={isFormValid ? 'teal' : 'primary'}
        mt="sm"
        aria-label={t('form.validationCardTitle')}
      />

      <Stack gap="xs" mt="md">
        {readinessChecks.map((check) => (
          <Group key={check.label} gap="sm" wrap="nowrap" align="flex-start">
            <ThemeIcon
              size={18}
              radius="xl"
              color={check.pass ? 'teal' : 'gray'}
              variant={check.pass ? 'filled' : 'light'}
              style={{ flexShrink: 0 }}
            >
              {check.pass ? <IconCheck size={12} stroke={3} /> : null}
            </ThemeIcon>
            <Text fz="var(--jurnal-text-sm)" c={check.pass ? 'dark.8' : 'dimmed'} lh={1.35} pt={0}>
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
