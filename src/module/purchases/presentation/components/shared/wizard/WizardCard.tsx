import type { ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

interface WizardCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  /** Right of the header: "Belum ada dokumen dipilih". */
  hint?: string;
  /** Bold line above the hint: the vendor the step is about. */
  hintTitle?: string;
  children: ReactNode;
  /** The grey band under the body: totals. */
  summary?: ReactNode;
  /** The action bar; it sits inside the card so form and buttons read as one. */
  footer: ReactNode;
}

/** The one card every form step lives in: header, fields, an optional totals band, the action bar. */
export const WizardCard = ({
  icon,
  title,
  description,
  hint,
  hintTitle,
  children,
  summary,
  footer,
}: Readonly<WizardCardProps>) => (
  <Paper withBorder radius="lg" p={0} bg="white" style={{ overflow: 'hidden' }}>
    <Group gap="md" wrap="nowrap" p="lg" justify="space-between">
      <Group gap="md" wrap="nowrap">
        <ThemeIcon size={40} radius="md" variant="light" color="gray">
          {icon}
        </ThemeIcon>
        <Stack gap={0}>
          <Text fw={700} fz="md">
            {title}
          </Text>
          {description && (
            <Text fz="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
      </Group>
      {(hint || hintTitle) && (
        <Stack gap={0} align="flex-end" visibleFrom="sm">
          {hintTitle && (
            <Text fz="md" fw={700}>
              {hintTitle}
            </Text>
          )}
          {hint && (
            <Text fz="xs" c="dimmed">
              {hint}
            </Text>
          )}
        </Stack>
      )}
    </Group>
    <Divider />
    <Box p="lg">{children}</Box>
    {summary && (
      <>
        <Divider />
        <Box p="lg" bg="gray.0">
          {summary}
        </Box>
      </>
    )}
    <Divider />
    <Box p="md" px="lg">
      {footer}
    </Box>
  </Paper>
);
