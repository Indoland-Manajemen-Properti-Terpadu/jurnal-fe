import React from 'react';
import { Box, Group, Paper, SimpleGrid, Text } from '@mantine/core';

export interface ReportKpiItem {
  key: string;
  label: string;
  value: string;
  hint?: string;
  /** Small picture on the right of the card (a ring or a bar). */
  visual?: React.ReactNode;
}

interface ReportKpiStripProps {
  /** Small caption before the period, for example "Posisi keuangan per". */
  caption: string;
  /** The period or date the figures are for. */
  period: string;
  /** Plain status text on the right of the header (balance check, period lock). */
  status?: React.ReactNode;
  items: ReportKpiItem[];
  /** Title and content of a wide card under the figures, for example a comparison. */
  footer?: { title: string; content: React.ReactNode };
}

/** The headline figures of a report as separate cards, with a calm status line above them. */
export const ReportKpiStrip: React.FC<ReportKpiStripProps> = ({
  caption,
  period,
  status,
  items,
  footer,
}) => (
  <Box>
    <Group justify="space-between" align="center" wrap="wrap" gap="xs" mb="sm">
      <Group gap="xs" align="baseline">
        <Text fz="xs" fw={600} c="dimmed" tt="uppercase">
          {caption}
        </Text>
        <Text fz="sm" fw={700} c="dark.9">
          {period}
        </Text>
      </Group>
      {status && <Group gap="md">{status}</Group>}
    </Group>

    <SimpleGrid cols={{ base: 1, sm: 2, lg: items.length }} spacing="md">
      {items.map((item) => (
        <Paper key={item.key} withBorder radius="lg" p="lg" bg="white">
          <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
            <Box style={{ minWidth: 0 }}>
              <Text fz="sm" c="dimmed">
                {item.label}
              </Text>
              <Text
                fz="xl"
                fw={700}
                c="dark.9"
                mt={4}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {item.value}
              </Text>
              {item.hint && (
                <Text fz="xs" c="dimmed" mt={4}>
                  {item.hint}
                </Text>
              )}
            </Box>
            {item.visual}
          </Group>
        </Paper>
      ))}
    </SimpleGrid>

    {footer && (
      <Paper withBorder radius="lg" p="lg" bg="white" mt="md">
        <Text fz="sm" fw={600} c="dark.9" mb="sm">
          {footer.title}
        </Text>
        {footer.content}
      </Paper>
    )}
  </Box>
);
