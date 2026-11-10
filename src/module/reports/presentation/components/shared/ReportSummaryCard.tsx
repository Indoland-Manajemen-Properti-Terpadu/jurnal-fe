import React from 'react';
import { Box, Divider, Group, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/module/reports/domain/reportFormat';

export interface ReportSummaryLine {
  key: string;
  label: string;
  /** `null` draws the label alone, for a note such as "3 more accounts". */
  value: number | null;
  /** Width of the bar, 0 to 100. */
  share: number;
  /** Colour of the bar, a theme colour variable. */
  tone: string;
}

interface ReportSummaryCardProps {
  title: string;
  caption: string;
  /** Read out by assistive technology and shown as the hover title. */
  ariaLabel: string;
  lines: ReportSummaryLine[];
  /** The one closing line under the rule; `alert` draws it red. */
  closing: { label: string; value: number; alert?: boolean };
}

/**
 * The one anatomy every report summary card shares: the name and what it is, a few lines each with
 * a figure and a bar, a rule, and one closing line. Pass it to `ReportKpiStrip` as `content`.
 */
export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  title,
  caption,
  ariaLabel,
  lines,
  closing,
}) => (
  <Stack gap="sm" role="group" aria-label={ariaLabel} title={ariaLabel}>
    <Box>
      <Text fz="sm" fw={600} c="dark.9">
        {title}
      </Text>
      <Text fz="xs" c="dimmed">
        {caption}
      </Text>
    </Box>

    {lines.map((line) =>
      line.value === null ? (
        <Text key={line.key} fz="xs" c="dimmed">
          {line.label}
        </Text>
      ) : (
        <Box key={line.key}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fz="xs" c="dimmed">
              {line.label}
            </Text>
            <Text fz="sm" fw={600} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(line.value)}
            </Text>
          </Group>
          <Box
            mt={4}
            style={{
              height: 6,
              overflow: 'hidden',
              background: 'var(--mantine-color-gray-1)',
              borderRadius: 999,
            }}
          >
            <Box
              style={{
                width: `${Math.min(100, Math.max(0, line.share))}%`,
                height: '100%',
                background: line.tone,
                borderRadius: 999,
              }}
            />
          </Box>
        </Box>
      )
    )}

    <Divider />
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text fz="xs" c="dimmed">
        {closing.label}
      </Text>
      <Text
        fz="sm"
        fw={700}
        c={closing.alert ? 'red.7' : 'dark.9'}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatMoney(closing.value)}
      </Text>
    </Group>
  </Stack>
);
