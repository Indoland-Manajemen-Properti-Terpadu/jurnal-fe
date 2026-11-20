import { ActionIcon, Badge, Box, Group, Stack, Switch, Table, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dueTextOf, type PaymentTerm } from '@/module/settings/domain/paymentTerm';

type Props = {
  term: PaymentTerm;
  statusPending: boolean;
  onEdit: (term: PaymentTerm) => void;
  onToggleStatus: (term: PaymentTerm) => void;
  onDelete: (term: PaymentTerm) => void;
};

export function PaymentTermRow({
  term,
  statusPending,
  onEdit,
  onToggleStatus,
  onDelete,
}: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const due = dueTextOf(term);

  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={600} size="sm" c="dark.8">
          {term.name}
        </Text>
        <Text size="xs" c="dimmed">
          {term.usageCount > 0
            ? st('paymentTerm.usageCount', { count: term.usageCount })
            : st('paymentTerm.unused')}
        </Text>
      </Table.Td>
      <Table.Td style={{ whiteSpace: 'nowrap' }}>
        <Badge variant="light" color="gray" size="sm">
          {st(`paymentTerm.appliesTo.${term.appliesTo}`)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{term.summary.paymentLabel}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{term.summary.billingLabel}</Text>
        <Text size="xs" c="dimmed">
          {due ? st(`paymentTerm.${due.key}`, { days: due.days }) : term.summary.dueLabel}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={4} align="flex-start">
          <Switch
            size="sm"
            checked={term.isActive}
            disabled={statusPending}
            aria-label={st('paymentTerm.switchStatus', { name: term.name })}
            onChange={() => onToggleStatus(term)}
          />
          {!term.isActive && (
            <Badge variant="light" color="gray" size="sm">
              {st('paymentTerm.status.inactive')}
            </Badge>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="center" wrap="nowrap">
          <Tooltip label={st('paymentTerm.edit', { name: term.name })}>
            <ActionIcon
              variant="subtle"
              color="primary"
              aria-label={st('paymentTerm.edit', { name: term.name })}
              onClick={() => onEdit(term)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={
              term.canDelete
                ? st('paymentTerm.delete', { name: term.name })
                : st('paymentTerm.deleteBlocked')
            }
            multiline
            w={term.canDelete ? undefined : 220}
          >
            {/* A disabled button gets no pointer events, so the tooltip hangs on its wrapper. */}
            <Box component="span" display="inline-flex">
              <ActionIcon
                variant="subtle"
                color="red"
                disabled={!term.canDelete}
                aria-label={st('paymentTerm.delete', { name: term.name })}
                onClick={() => onDelete(term)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export default PaymentTermRow;
