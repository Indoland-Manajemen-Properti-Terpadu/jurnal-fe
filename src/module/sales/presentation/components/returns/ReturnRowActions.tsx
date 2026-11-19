import { ActionIcon, Menu } from '@mantine/core';
import {
  IconBan,
  IconCash,
  IconCheck,
  IconCoin,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconReceipt2,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  allowedReturnActions,
  returnActions,
  type ReturnRights,
  type SaleReturn,
} from '@/module/sales/domain/saleReturn';
import type { ReturnHandlers } from '../../hooks/useReturnActions';

/** What a return's row offers, from its status and the user's rights. */
export const ReturnRowActions = ({
  ret,
  handlers,
  rights,
}: Readonly<{ ret: SaleReturn; handlers: ReturnHandlers; rights: ReturnRights }>) => {
  const { t } = useTranslation('salesReturns');
  const actions = allowedReturnActions(returnActions(ret), rights);

  return (
    <Menu position="bottom-end" shadow="md" width={230}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actionsAria')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEye size={16} />} onClick={() => handlers.onView(ret)}>
          {t('actions.view')}
        </Menu.Item>
        {actions.issue && (
          <Menu.Item leftSection={<IconCheck size={16} />} onClick={() => handlers.onIssue(ret)}>
            {t('actions.issue')}
          </Menu.Item>
        )}
        {actions.edit && (
          <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => handlers.onEdit(ret)}>
            {t('actions.edit')}
          </Menu.Item>
        )}
        {actions.applyCredit && (
          <Menu.Item
            leftSection={<IconCoin size={16} />}
            onClick={() => handlers.onApplyCredit(ret)}
          >
            {t('actions.applyCredit')}
          </Menu.Item>
        )}
        {actions.refund && (
          <Menu.Item leftSection={<IconCash size={16} />} onClick={() => handlers.onRefund(ret)}>
            {t('actions.refund')}
          </Menu.Item>
        )}
        <Menu.Item
          leftSection={<IconReceipt2 size={16} />}
          onClick={() => handlers.onViewInvoice(ret)}
        >
          {t('actions.viewInvoice')}
        </Menu.Item>
        {(actions.cancel || actions.remove) && <Menu.Divider />}
        {actions.cancel && (
          <Menu.Item
            color="red"
            disabled={actions.cancelBlocked}
            leftSection={<IconBan size={16} />}
            onClick={() => handlers.onCancel(ret)}
          >
            {t('actions.cancel')}
          </Menu.Item>
        )}
        {actions.remove && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => handlers.onDelete(ret)}
          >
            {t('actions.remove')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
