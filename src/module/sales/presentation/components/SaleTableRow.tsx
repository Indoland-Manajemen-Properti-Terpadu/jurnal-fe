import { ActionIcon, Badge, CopyButton, Group, Menu, Table, Text, Tooltip } from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconLink,
  IconReceipt2,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Sale } from '../../domain/sale';
import { formatDate, formatIDR, getSaleStatusConfig } from '../../domain/saleFormat';
import { isPastDue } from '../../domain/saleTotals';

type SaleTableRowProps = {
  sale: Sale;
  onViewDetail: (sale: Sale) => void;
  onPaySale: (sale: Sale) => void;
  onGenerateLink?: (sale: Sale) => void;
  onDownloadPdf?: (sale: Sale) => void;
};

export function SaleTableRow({
  sale,
  onViewDetail,
  onPaySale,
  onGenerateLink,
  onDownloadPdf,
}: Readonly<SaleTableRowProps>) {
  const { t } = useTranslation('sales');
  const statusCfg = getSaleStatusConfig(sale.status);
  const isOverdue = isPastDue(sale, Date.now());

  return (
    <Table.Tr style={{ cursor: 'pointer' }} onClick={() => onViewDetail(sale)}>
      <Table.Td onClick={(e) => e.stopPropagation()}>
        <Group gap={6} wrap="nowrap">
          <Text
            size="sm"
            fw={700}
            c="primary.9"
            style={{ cursor: 'pointer' }}
            onClick={() => onViewDetail(sale)}
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
        <Text size="sm" c="dark.7">
          {formatDate(sale.transactionDate)}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={isOverdue ? 700 : 400} c={isOverdue ? 'red.7' : 'dark.7'}>
          {formatDate(sale.dueDate)}
        </Text>
        {isOverdue && (
          <Badge size="xs" color="red" variant="light">
            {t('table.overdueBadge')}
          </Badge>
        )}
      </Table.Td>

      <Table.Td ta="right">
        <Text size="sm" fw={700} c="dark.8">
          {formatIDR(sale.finalAmount)}
        </Text>
        {sale.discountAmount && sale.discountAmount > 0 ? (
          <Text size="xs" c="dimmed">
            {t('table.discount', { amount: formatIDR(sale.discountAmount) })}
          </Text>
        ) : null}
      </Table.Td>

      <Table.Td ta="right">
        <Text size="sm" fw={700} c={sale.remainingAmount > 0 ? 'orange.8' : 'teal.8'}>
          {formatIDR(sale.remainingAmount)}
        </Text>
        {sale.paidAmount > 0 && (
          <Text size="xs" c="teal.7">
            {t('table.paidAmount', { amount: formatIDR(sale.paidAmount) })}
          </Text>
        )}
      </Table.Td>

      <Table.Td ta="center">
        <Badge size="sm" radius="sm" color={statusCfg.color} variant={statusCfg.variant || 'light'}>
          {t(`status.${statusCfg.labelKey}`)}
        </Badge>
      </Table.Td>

      <Table.Td ta="center" onClick={(e) => e.stopPropagation()}>
        <Menu position="bottom-end" shadow="md" width={180}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="md"
              aria-label={t('table.actionsAria')}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEye size={16} />} onClick={() => onViewDetail(sale)}>
              {t('table.view')}
            </Menu.Item>
            {sale.remainingAmount > 0 && (
              <Menu.Item
                leftSection={<IconReceipt2 size={16} />}
                color="primary"
                onClick={() => onPaySale(sale)}
              >
                {t('table.pay')}
              </Menu.Item>
            )}
            {onGenerateLink && (
              <Menu.Item leftSection={<IconLink size={16} />} onClick={() => onGenerateLink(sale)}>
                {t('table.link')}
              </Menu.Item>
            )}
            {onDownloadPdf && (
              <Menu.Item
                leftSection={<IconDownload size={16} />}
                onClick={() => onDownloadPdf(sale)}
              >
                {t('table.pdf')}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}
