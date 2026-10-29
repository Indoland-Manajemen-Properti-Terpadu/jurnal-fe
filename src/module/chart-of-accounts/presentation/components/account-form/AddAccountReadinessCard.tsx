import React from 'react';
import { Badge, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCircleDot, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface ReadinessCheck {
  label: string;
  pass: boolean;
}

interface AddAccountReadinessCardProps {
  readinessChecks: ReadinessCheck[];
  passedChecksCount: number;
  isFormValid: boolean;
}

/** Real-time readiness verification card. */
export const AddAccountReadinessCard: React.FC<AddAccountReadinessCardProps> = ({
  readinessChecks,
  passedChecksCount,
  isFormValid,
}) => {
  const { t } = useTranslation('journal');

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={28} radius="md" variant="light" color={isFormValid ? 'teal' : 'blue'}>
            <IconShieldCheck size={16} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={13} c="dark.8">
              {t('validationCardTitle')}
            </Text>
            <Text fz={11} c="dimmed">
              {t('validationCardSubtitle')}
            </Text>
          </div>
        </Group>
        <Badge
          color={isFormValid ? 'teal' : 'gray'}
          variant={isFormValid ? 'filled' : 'light'}
          size="xs"
        >
          {passedChecksCount}/{readinessChecks.length}
        </Badge>
      </Group>

      <Divider my="xs" />

      <Stack gap={8}>
        {readinessChecks.map((check) => (
          <Group key={check.label} justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
              <ThemeIcon
                size={18}
                radius="xl"
                color={check.pass ? 'teal' : 'gray'}
                variant={check.pass ? 'filled' : 'light'}
              >
                {check.pass ? <IconCheck size={12} stroke={2.5} /> : <IconCircleDot size={12} />}
              </ThemeIcon>
              <Text
                fz={12}
                c={check.pass ? 'dark.8' : 'dimmed'}
                fw={check.pass ? 500 : 400}
                truncate
              >
                {check.label}
              </Text>
            </Group>
            <Badge size="xs" variant="light" color={check.pass ? 'teal' : 'gray'}>
              {check.pass ? 'OK' : '—'}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};
