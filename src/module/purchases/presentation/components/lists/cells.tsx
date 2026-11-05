import { Anchor, Group, Table, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  detailPath,
  type DocumentKind,
} from '@/module/purchases/presentation/components/hub/documentPaths';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

/** Document number as the row's main link; the whole row also opens the document. */
export const NumberCell = ({
  kind,
  id,
  number,
  sub,
}: Readonly<{ kind: DocumentKind; id: string; number: string; sub?: string }>) => (
  <Table.Td style={{ whiteSpace: 'nowrap' }}>
    <Anchor
      component={Link}
      to={detailPath(kind, id)}
      size="sm"
      fw={500}
      c="primary.7"
      onClick={(event) => event.stopPropagation()}
    >
      {number}
    </Anchor>
    {sub && (
      <Text size="xs" c="dimmed">
        {sub}
      </Text>
    )}
  </Table.Td>
);

/** The vendor as the main line, with an optional dimmed second line. */
export const PartyCell = ({
  name,
  sub,
  maxWidth = 260,
}: Readonly<{ name: string; sub?: string; maxWidth?: number }>) => (
  <Table.Td style={{ whiteSpace: 'nowrap', maxWidth }}>
    <Text size="sm" truncate>
      {name || '-'}
    </Text>
    {sub && (
      <Text size="xs" c="dimmed" truncate>
        {sub}
      </Text>
    )}
  </Table.Td>
);

/** A due date; red with an alert icon only when the bill is really late. */
export const DueCell = ({ label, overdue }: Readonly<{ label: string; overdue: boolean }>) => (
  <Table.Td style={{ whiteSpace: 'nowrap' }}>
    <Group gap={6} wrap="nowrap">
      {overdue && <IconAlertCircle size={14} color="var(--mantine-color-red-7)" aria-hidden />}
      <Text size="sm" c={overdue ? 'red.7' : 'dimmed'} fw={overdue ? 500 : 400}>
        {label}
      </Text>
    </Group>
  </Table.Td>
);

export const TextCell = ({
  value,
  dimmed,
  maxWidth,
}: Readonly<{ value: string; dimmed?: boolean; maxWidth?: number }>) => (
  <Table.Td style={{ whiteSpace: 'nowrap', maxWidth }}>
    <Text size="sm" c={dimmed ? 'dimmed' : undefined} truncate>
      {value || '-'}
    </Text>
  </Table.Td>
);

export const AmountCell = ({ value, dimmed }: Readonly<{ value: number; dimmed?: boolean }>) => (
  <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
    <Text size="sm" fw={dimmed ? 400 : 500} c={dimmed ? 'dimmed' : undefined}>
      {formatAmount(value)}
    </Text>
  </Table.Td>
);
