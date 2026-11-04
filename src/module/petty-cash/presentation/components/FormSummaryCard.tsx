import type { ReactNode } from 'react';
import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { AmountRows, type AmountRow } from '@/module/petty-cash/presentation/components/DetailKit';

interface Props {
  title: string;
  rows: AmountRow[];
  /** One quiet line under the figures: teal check when all is well, orange triangle otherwise. */
  status?: { tone: 'ok' | 'warning'; text: string };
  /** Extra figures under the calculation (a breakdown, server warnings). */
  details?: ReactNode;
  /** Small dimmed remarks about the figures (what is estimated, what the server decides). */
  notes?: string[];
  /** What blocks saving; shown in red below the figures. */
  issuesText?: string;
  /** The action buttons, full width. */
  children: ReactNode;
}

/** The sticky right column of every form page: a calculation, one status line, the actions. */
export function FormSummaryCard({
  title,
  rows,
  status,
  details,
  notes = [],
  issuesText,
  children,
}: Readonly<Props>) {
  const ok = status?.tone === 'ok';
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="sm">
        <Text fw={600} fz={15}>
          {title}
        </Text>
        {rows.length > 0 && <AmountRows rows={rows} />}
        {details}
        {notes.map((note) => (
          <Text key={note} size="xs" c="dimmed">
            {note}
          </Text>
        ))}
        {status && (
          <Group gap={6} wrap="nowrap" align="flex-start">
            {ok ? (
              <IconCircleCheck size={15} color="var(--mantine-color-teal-7)" />
            ) : (
              <IconAlertTriangle size={15} color="var(--mantine-color-orange-7)" />
            )}
            <Text size="xs" c={ok ? 'dimmed' : 'orange.8'} fw={ok ? 400 : 600}>
              {status.text}
            </Text>
          </Group>
        )}
        {issuesText && (
          <Text size="sm" c="red.7" role="alert">
            {issuesText}
          </Text>
        )}
        <Stack gap="xs" mt="xs">
          {children}
        </Stack>
      </Stack>
    </Paper>
  );
}
