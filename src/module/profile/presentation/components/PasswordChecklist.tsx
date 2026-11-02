import { List, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PasswordChecks } from '../../domain/profile';

interface PasswordChecklistProps {
  checks: PasswordChecks;
}

export function PasswordChecklist({ checks }: Readonly<PasswordChecklistProps>) {
  const { t } = useTranslation('profile');
  const items = [
    { passed: checks.isMinLength, label: t('security.minLength') },
    { passed: checks.hasLetter, label: t('security.hasLetter') },
    { passed: checks.hasNumber, label: t('security.hasNumber') },
    { passed: checks.isDifferent, label: t('security.different') },
    { passed: checks.isMatch, label: t('security.matches') },
  ];

  return (
    <Paper withBorder shadow="none" radius="md" p="md" bg="gray.0">
      <Text size="xs" fw={700} mb="xs" c="dimmed" tt="uppercase" lts={0.5}>
        {t('security.checklistTitle')}
      </Text>
      <List spacing={8} size="sm" center aria-live="polite">
        {items.map((item) => (
          <List.Item
            key={item.label}
            icon={
              <ThemeIcon
                size={20}
                radius="xl"
                variant="light"
                color={item.passed ? 'teal' : 'gray'}
              >
                {item.passed ? <IconCheck size={12} /> : <IconX size={12} />}
              </ThemeIcon>
            }
          >
            <Text span size="sm" fw={item.passed ? 500 : 400} c={item.passed ? 'teal.8' : 'dimmed'}>
              {item.label}
            </Text>
          </List.Item>
        ))}
      </List>
    </Paper>
  );
}
