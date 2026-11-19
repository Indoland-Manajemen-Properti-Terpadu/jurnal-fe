import type { ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

interface WizardCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  /** The grey band under the body: totals, and on the last step a readiness note. */
  summary?: ReactNode;
  /** The action bar; it sits inside the card so form and buttons read as one. */
  footer: ReactNode;
}

/**
 * The one card every sales form step lives in: a header with the step's icon and title, the
 * fields, an optional grey totals band, and the action bar. Same radius and spacing everywhere.
 */
export function WizardCard({
  icon,
  title,
  description,
  children,
  summary,
  footer,
}: Readonly<WizardCardProps>) {
  return (
    <Paper withBorder radius="lg" p={0} bg="white" style={{ overflow: 'hidden' }}>
      <Group gap="md" wrap="nowrap" p="lg">
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
}
