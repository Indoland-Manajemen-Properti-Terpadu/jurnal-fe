import { ActionIcon, Menu } from '@mantine/core';
import {
  IconBan,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconReceipt2,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  allowedOrderActions,
  orderActions,
  type OrderRights,
  type SaleOrder,
} from '@/module/sales/domain/saleOrder';
import type { OrderHandlers } from '../../hooks/useOrderActions';

/** What an order's row offers, from its status. */
export const OrderRowActions = ({
  order,
  handlers,
  rights,
}: Readonly<{ order: SaleOrder; handlers: OrderHandlers; rights: OrderRights }>) => {
  const { t } = useTranslation('salesOrders');
  const actions = allowedOrderActions(orderActions(order), rights);

  return (
    <Menu position="bottom-end" shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actionsAria')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEye size={16} />} onClick={() => handlers.onView(order)}>
          {t('actions.view')}
        </Menu.Item>
        {actions.createInvoice && (
          <Menu.Item
            leftSection={<IconReceipt2 size={16} />}
            onClick={() => handlers.onCreateInvoice(order)}
          >
            {t('actions.createInvoice')}
          </Menu.Item>
        )}
        {actions.viewInvoice && (
          <Menu.Item
            leftSection={<IconReceipt2 size={16} />}
            onClick={() => handlers.onViewInvoice(order)}
          >
            {t('actions.viewInvoice')}
          </Menu.Item>
        )}
        {actions.send && (
          <Menu.Item leftSection={<IconSend size={16} />} onClick={() => handlers.onSend(order)}>
            {t('actions.send')}
          </Menu.Item>
        )}
        {actions.confirm && (
          <Menu.Item
            leftSection={<IconCheck size={16} />}
            onClick={() => handlers.onConfirm(order)}
          >
            {t('actions.confirm')}
          </Menu.Item>
        )}
        {actions.edit && (
          <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => handlers.onEdit(order)}>
            {t('actions.edit')}
          </Menu.Item>
        )}
        {actions.duplicate && (
          <Menu.Item
            leftSection={<IconCopy size={16} />}
            onClick={() => handlers.onDuplicate(order)}
          >
            {t('actions.duplicate')}
          </Menu.Item>
        )}
        {(actions.cancel || actions.remove) && <Menu.Divider />}
        {actions.cancel && (
          <Menu.Item
            color="red"
            leftSection={<IconBan size={16} />}
            onClick={() => handlers.onCancel(order)}
          >
            {t('actions.cancel')}
          </Menu.Item>
        )}
        {actions.remove && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => handlers.onDelete(order)}
          >
            {t('actions.remove')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
