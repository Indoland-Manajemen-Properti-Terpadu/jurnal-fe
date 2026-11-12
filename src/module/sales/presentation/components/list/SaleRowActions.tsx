import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import {
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconMailForward,
  IconPencil,
  IconReceipt2,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { saleActions } from '@/module/sales/domain/saleActions';

export interface SaleRowHandlers {
  onView: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onSend: (sale: Sale) => void;
  onResend: (sale: Sale) => void;
  onPay: (sale: Sale) => void;
  onCopyLink: (sale: Sale) => void;
  onDownloadPdf: (sale: Sale) => void;
}

/** Row menu: what is offered follows the invoice status and the server's edit and delete flags. */
export const SaleRowActions = ({
  sale,
  handlers,
}: Readonly<{ sale: Sale; handlers: SaleRowHandlers }>) => {
  const { t } = useTranslation('sales');
  const actions = saleActions(sale);

  return (
    <Menu position="bottom-end" shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actionsAria')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEye size={16} />} onClick={() => handlers.onView(sale)}>
          {t('actions.view')}
        </Menu.Item>
        {actions.send && (
          <Menu.Item leftSection={<IconSend size={16} />} onClick={() => handlers.onSend(sale)}>
            {t('actions.send')}
          </Menu.Item>
        )}
        {actions.edit && (
          <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => handlers.onEdit(sale)}>
            {t('actions.edit')}
          </Menu.Item>
        )}
        {actions.pay && (
          <Menu.Item leftSection={<IconReceipt2 size={16} />} onClick={() => handlers.onPay(sale)}>
            {t('actions.pay')}
          </Menu.Item>
        )}
        {actions.pdf && (
          <Menu.Item
            leftSection={<IconDownload size={16} />}
            onClick={() => handlers.onDownloadPdf(sale)}
          >
            {t('actions.pdf')}
          </Menu.Item>
        )}
        {actions.link && (
          <Menu.Item leftSection={<IconCopy size={16} />} onClick={() => handlers.onCopyLink(sale)}>
            {t('actions.link')}
          </Menu.Item>
        )}
        {actions.resend === 'enabled' && (
          <Menu.Item
            leftSection={<IconMailForward size={16} />}
            onClick={() => handlers.onResend(sale)}
          >
            {t('actions.resend')}
          </Menu.Item>
        )}
        {actions.resend === 'disabled' && (
          <Tooltip label={t('actions.resendDisabled')} withArrow position="left" multiline w={220}>
            <div>
              <Menu.Item leftSection={<IconMailForward size={16} />} disabled>
                {t('actions.resend')}
              </Menu.Item>
            </div>
          </Tooltip>
        )}
        {actions.remove !== 'hidden' && <Menu.Divider />}
        {actions.remove === 'enabled' && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => handlers.onDelete(sale)}
          >
            {t('actions.remove')}
          </Menu.Item>
        )}
        {actions.remove === 'disabled' && (
          <Tooltip label={t('actions.removeDisabled')} withArrow position="left" multiline w={220}>
            <div>
              <Menu.Item color="red" leftSection={<IconTrash size={16} />} disabled>
                {t('actions.remove')}
              </Menu.Item>
            </div>
          </Tooltip>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
