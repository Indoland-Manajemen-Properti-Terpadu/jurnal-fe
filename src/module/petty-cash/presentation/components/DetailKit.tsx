import { useState, type ReactNode } from 'react';
import {
  Box,
  Collapse,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * Building blocks shared by every petty cash detail drawer, so a voucher, a cash count, a
 * replenishment and an advance read the same way: one summary figure, then plain titled cards.
 */

/** A titled card. Neutral on purpose: the content carries the meaning, not decoration. */
export function DetailSection({
  title,
  aside,
  children,
}: Readonly<{ title: string; aside?: ReactNode; children: ReactNode }>) {
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group justify="space-between" align="center" mb="sm" wrap="nowrap" gap="sm">
        <Text fw={600} fz={14} c="dark.8">
          {title}
        </Text>
        {aside}
      </Group>
      {children}
    </Paper>
  );
}

/** A card whose body stays folded until asked for; used for records kept for review. */
export function CollapsibleSection({
  title,
  count,
  showLabel,
  hideLabel,
  children,
}: Readonly<{
  title: string;
  count?: string;
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <UnstyledButton onClick={() => setOpen((value) => !value)} aria-expanded={open} w="100%">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} fz={14} c="dark.8">
              {title}
            </Text>
            {count && (
              <Text size="xs" c="dimmed">
                {count}
              </Text>
            )}
          </Group>
          <Group gap={4} wrap="nowrap" c="primary.6">
            <Text size="xs" fw={600}>
              {open ? hideLabel : showLabel}
            </Text>
            <IconChevronDown
              size={14}
              style={{
                transform: open ? 'rotate(180deg)' : undefined,
                transition: 'transform 150ms',
              }}
            />
          </Group>
        </Group>
      </UnstyledButton>
      <Collapse in={open}>
        <Box pt="md">{children}</Box>
      </Collapse>
    </Paper>
  );
}

export interface Fact {
  label: string;
  value: ReactNode;
  /** Spans both columns, for long text such as a purpose. */
  wide?: boolean;
}

/** Label above value, two columns on a wide drawer. Empty values are left out. */
export function DetailFacts({ facts }: Readonly<{ facts: Fact[] }>) {
  const shown = facts.filter(
    (fact) => fact.value !== null && fact.value !== undefined && fact.value !== ''
  );
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="sm">
      {shown.map((fact) => (
        <Stack key={fact.label} gap={2} style={fact.wide ? { gridColumn: '1 / -1' } : undefined}>
          <Text size="xs" c="dimmed">
            {fact.label}
          </Text>
          <Text size="sm" fw={500} c="dark.8" component="div">
            {fact.value}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}

export interface AmountRow {
  label: string;
  value: ReactNode;
  /** The result of the rows above it: a rule above, bold text. */
  total?: boolean;
}

/** A small calculation, label left and figure right, ending in its total. */
export function AmountRows({ rows }: Readonly<{ rows: AmountRow[] }>) {
  return (
    <Stack gap={8}>
      {rows.map((row) => (
        <Box key={row.label}>
          {row.total && <Divider mb={8} />}
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Text size="sm" c={row.total ? 'dark.8' : 'dimmed'} fw={row.total ? 600 : 400}>
              {row.label}
            </Text>
            <Text size="sm" c="dark.8" fw={row.total ? 700 : 500} ta="right" component="div">
              {row.value}
            </Text>
          </Group>
        </Box>
      ))}
    </Stack>
  );
}

export interface LineItem {
  key: string;
  title: ReactNode;
  subtitle?: ReactNode;
  amount: ReactNode;
  amountHint?: ReactNode;
}

/** The lines of a document (expense lines, vouchers, denominations), one layout everywhere. */
export function LineItems({ items }: Readonly<{ items: LineItem[] }>) {
  return (
    <Stack gap={0}>
      {items.map((item, index) => (
        <Group
          key={item.key}
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="md"
          py={10}
          style={index > 0 ? { borderTop: '1px solid var(--mantine-color-gray-2)' } : undefined}
        >
          <Box miw={0}>
            <Text size="sm" fw={500} c="dark.8">
              {item.title}
            </Text>
            {item.subtitle && (
              <Text size="xs" c="dimmed" mt={2}>
                {item.subtitle}
              </Text>
            )}
          </Box>
          <Box ta="right" style={{ flexShrink: 0 }}>
            <Text size="sm" fw={600} c="dark.8" component="div">
              {item.amount}
            </Text>
            {item.amountHint && (
              <Text size="xs" c="dimmed" component="div">
                {item.amountHint}
              </Text>
            )}
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

/** The one figure a document is about, with a quiet line of context beneath it. */
export function AmountSummary({
  label,
  amount,
  meta,
}: Readonly<{ label: string; amount: ReactNode; meta?: ReactNode }>) {
  return (
    <Paper radius="md" p="md" bg="gray.0">
      <Text size="xs" c="dimmed" fw={500}>
        {label}
      </Text>
      <Text fz={26} fw={700} lh={1.2} c="dark.9" mt={2} component="div">
        {amount}
      </Text>
      {meta && (
        <Text size="xs" c="dimmed" mt={6} component="div">
          {meta}
        </Text>
      )}
    </Paper>
  );
}
