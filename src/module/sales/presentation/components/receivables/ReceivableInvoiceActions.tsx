import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { IconBell, IconBook2, IconCash, IconDotsVertical, IconEye, IconLink, IconReceiptTax } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ReceivableInvoiceRow } from '@/module/sales/domain/saleReceivables';

export type InvoiceRowActions = {
  canView: boolean;
  canPay: boolean;
  canRemind: boolean;
  canCopyLink: boolean;
  onView: (row: ReceivableInvoiceRow) => void;
  onCustomer: (id: string) => void;
  onPay: (row: ReceivableInvoiceRow) => void;
  onRemind: (row: ReceivableInvoiceRow) => void;
  onCopyLink: (row: ReceivableInvoiceRow) => void;
  onJournal: (row: ReceivableInvoiceRow) => void;
};

export function InvoiceActions({
  row,
  actions,
}: {
  row: ReceivableInvoiceRow;
  actions: InvoiceRowActions;
}) {
  const { t } = useTranslation('salesReceivables');
  const hasActions = actions.canView || actions.canPay || actions.canRemind || actions.canCopyLink;
  if (!hasActions) return null;

  return (
    <Menu position="bottom-end" shadow="md" width={240}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actions')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.canView && (
          <Menu.Item leftSection={<IconEye size={16} />} onClick={() => actions.onView(row)}>
            {t('actions.viewInvoice')}
          </Menu.Item>
        )}
        {actions.canPay && (
          <Menu.Item leftSection={<IconCash size={16} />} onClick={() => actions.onPay(row)}>
            {t('actions.recordPayment')}
          </Menu.Item>
        )}
        {actions.canRemind && (
          <Menu.Item leftSection={<IconBell size={16} />} onClick={() => actions.onRemind(row)}>
            {t('actions.sendReminder')}
          </Menu.Item>
        )}
        {actions.canCopyLink && (
          <Menu.Item leftSection={<IconLink size={16} />} onClick={() => actions.onCopyLink(row)}>
            {t('actions.copyInvoiceLink')}
          </Menu.Item>
        )}
        {row.daysPastDue > 0 && (
          <Tooltip label={t('actions.lateFeeUnavailable')} withArrow>
            <div>
              <Menu.Item leftSection={<IconReceiptTax size={16} />} disabled>
                {t('actions.createLateFeeInvoice')}
              </Menu.Item>
            </div>
          </Tooltip>
        )}
        {actions.canView && (
          <Menu.Item leftSection={<IconBook2 size={16} />} onClick={() => actions.onJournal(row)}>
            {t('actions.viewJournal')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
