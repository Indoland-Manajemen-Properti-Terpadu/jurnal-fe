import { Box, Group, Text } from '@mantine/core';

export interface SummaryRow {
  label: string;
  /** Already formatted. */
  value: string;
  tone?: 'default' | 'danger' | 'success';
}

interface SummaryRowsProps {
  rows: SummaryRow[];
  /** The figure the card is about, in a light band at the bottom. */
  total?: { label: string; value: string; tone?: 'default' | 'success' };
}

const TONE = { default: undefined, danger: 'red.7', success: 'green.7' } as const;

/**
 * The money of a document as label and amount rows, closed by one highlighted total, as in the
 * reference web. Put it in a `flush` card so the band runs to the edges.
 */
export const SummaryRows = ({ rows, total }: Readonly<SummaryRowsProps>) => (
  <div>
    <Box px="lg" py="md">
      {rows.map((row) => (
        <Group key={row.label} justify="space-between" wrap="nowrap" gap="md" py={4}>
          <Text fz="sm" c="dimmed">
            {row.label}
          </Text>
          <Text
            fz="sm"
            fw={600}
            c={TONE[row.tone ?? 'default']}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {row.value}
          </Text>
        </Group>
      ))}
    </Box>
    {total && (
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="md"
        px="lg"
        py="md"
        bg={total.tone === 'success' ? 'green.0' : 'primary.0'}
        style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
      >
        <Text fz="sm" fw={600} c={total.tone === 'success' ? 'green.8' : 'primary.8'}>
          {total.label}
        </Text>
        <Text
          fz="xl"
          fw={700}
          c={total.tone === 'success' ? 'green.8' : 'primary.8'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {total.value}
        </Text>
      </Group>
    )}
  </div>
);
