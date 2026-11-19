import type { ReactNode } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import { formatIDR } from '@/module/sales/domain/saleFormat';

export interface WizardTotalRow {
  label: string;
  /** Currency units; a negative number is shown with a minus sign. */
  value: number;
  /** Rows with nothing to show are left out. */
  hidden?: boolean;
}

interface WizardTotalsProps {
  rows: WizardTotalRow[];
  totalLabel: string;
  total: number;
  /** Small print under the total, for example that the figure is an estimate. */
  hint?: string;
  /** Left side of the band: a readiness note on the last step. */
  aside?: ReactNode;
}

const signed = (value: number) => (value < 0 ? `− ${formatIDR(-value)}` : formatIDR(value));

/** Subtotal rows and the total in one place, the same on every step and every sales form. */
export function WizardTotals({
  rows,
  totalLabel,
  total,
  hint,
  aside,
}: Readonly<WizardTotalsProps>) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="lg">
      <div style={{ flex: '1 1 260px' }}>{aside}</div>
      <Stack gap={6} w="100%" maw={400}>
        {rows
          .filter((row) => !row.hidden)
          .map((row) => (
            <Group key={row.label} justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                {row.label}
              </Text>
              <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {signed(row.value)}
              </Text>
            </Group>
          ))}
        <Group
          justify="space-between"
          wrap="nowrap"
          pt={8}
          style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
        >
          <Text fw={700} c="primary.9">
            {totalLabel}
          </Text>
          <Text fw={800} fz={22} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatIDR(total)}
          </Text>
        </Group>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
    </Group>
  );
}
