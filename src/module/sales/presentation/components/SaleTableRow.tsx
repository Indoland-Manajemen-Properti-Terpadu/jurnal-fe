import { ActionIcon, Button, CopyButton, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Sale } from '../../domain/sale';
import { formatDate, formatIDR } from '../../domain/saleFormat';
import type { SaleTab } from '../../domain/saleStatus';
import { SaleRowActions, type SaleRowHandlers } from './list/SaleRowActions';
import { SaleStatusBadge } from './shared/SaleStatusBadge';

type SaleTableRowProps = {
  sale: Sale;
  tab: SaleTab;
  handlers: SaleRowHandlers;
};

export function SaleTableRow({ sale, tab, handlers }: Readonly<SaleTableRowProps>) {
  const { t } = useTranslation('sales');
  const isOverdue = sale.displayStatus.code === 'OVERDUE';
  const isDraft = tab === 'draft';

  return (
    <Table.Tr style={{ cursor: 'pointer' }} onClick={() => handlers.onView(sale)}>
      <Table.Td onClick={(event) => event.stopPropagation()}>
        <Group gap={6} wrap="nowrap">
          <Text
            size="sm"
            fw={700}
            c="primary.9"
            style={{ cursor: 'pointer' }}
            onClick={() => handlers.onView(sale)}
          >
            {sale.transactionNumber}
          </Text>
          <CopyButton value={sale.transactionNumber} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t('table.copied') : t('table.copyTooltip')} withArrow>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color={copied ? 'teal' : 'gray'}
                  onClick={copy}
                  aria-label={t('table.copyAria')}
                >
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
        {sale.customerRefNumber && (
          <Text size="xs" c="dimmed">
            {t('table.reference', { value: sale.customerRefNumber })}
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={600} c="dark.8" lineClamp={1}>
          {sale.customer?.displayName || '—'}
        </Text>
        {sale.emails?.[0] && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {sale.emails[0]}
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dark.7" style={{ whiteSpace: 'nowrap' }}>
          {formatDate(sale.transactionDate)}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text
          size="sm"
          fw={isOverdue ? 700 : 400}
          c={isOverdue ? 'red.7' : 'dark.7'}
          style={{ whiteSpace: 'nowrap' }}
        >
          {formatDate(sale.dueDate)}
        </Text>
      </Table.Td>

      <Table.Td ta="right">
        <Text size="sm" fw={700} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatIDR(sale.finalAmount)}
        </Text>
      </Table.Td>

      {!isDraft && (
        <Table.Td ta="right">
          <Text size="sm" fw={700} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatIDR(sale.remainingAmount)}
          </Text>
          {sale.paidAmount > 0 && (
            <Text size="xs" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {t('table.paidAmount', { amount: formatIDR(sale.paidAmount) })}
            </Text>
          )}
        </Table.Td>
      )}

      <Table.Td ta="center">
        <SaleStatusBadge status={sale.displayStatus} />
      </Table.Td>

      <Table.Td ta="center" onClick={(event) => event.stopPropagation()}>
        <Group gap={4} justify="center" wrap="nowrap">
          {isDraft && sale.canEdit && (
            <Button size="compact-sm" variant="light" onClick={() => handlers.onSend(sale)}>
              {t('actions.send')}
            </Button>
          )}
          <SaleRowActions sale={sale} handlers={handlers} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
