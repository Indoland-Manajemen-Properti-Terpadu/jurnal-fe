import type { ReactNode } from 'react';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';

interface LedgerKpiCardProps {
  label: string;
  value: ReactNode;
  hint: string;
  icon: ReactNode;
  iconColor: string;
  valueColor: string;
  monospace?: boolean;
}

/** One figure of the KPI row above the ledger tabs. */
export const LedgerKpiCard: React.FC<LedgerKpiCardProps> = ({
  label,
  value,
  hint,
  icon,
  iconColor,
  valueColor,
  monospace,
}) => (
  <Paper withBorder radius="md" p="md" bg="white">
    <Group justify="space-between" align="flex-start">
      <div>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
          {label}
        </Text>
        <Text
          fz={22}
          fw={800}
          c={valueColor}
          mt={4}
          lh={1.1}
          ff={monospace ? 'monospace' : undefined}
        >
          {value}
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          {hint}
        </Text>
      </div>
      <ThemeIcon size={40} radius="md" variant="light" color={iconColor}>
        {icon}
      </ThemeIcon>
    </Group>
  </Paper>
);
