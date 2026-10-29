import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PasswordChecks } from '../../domain/profile';

interface PasswordChecklistProps {
  checks: PasswordChecks;
}

export function PasswordChecklist({ checks }: PasswordChecklistProps) {
  const { t } = useTranslation('profile');
  const items = [
    { passed: checks.isMinLength, label: t('security.minLength') },
    { passed: checks.hasLetter, label: t('security.hasLetter') },
    { passed: checks.hasNumber, label: t('security.hasNumber') },
    { passed: checks.isMatch, label: t('security.matches') },
  ];

  return (
    <Paper withBorder radius="md" p="sm" bg="gray.0">
      <Text size="xs" fw={700} mb="xs" c="dimmed">
        {t('security.checklistTitle')}
      </Text>
      <Stack gap={6}>
        {items.map((item) => (
          <Group gap="xs" key={item.label}>
            {item.passed ? (
              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
            ) : (
              <IconX size={14} color="var(--mantine-color-red-6)" />
            )}
            <Text size="xs" c={item.passed ? 'teal.8' : 'dimmed'}>
              {item.label}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
