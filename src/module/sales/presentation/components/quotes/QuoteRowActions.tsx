import { ActionIcon, Menu } from '@mantine/core';
import {
  IconArrowBackUp,
  IconBan,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconMailForward,
  IconPencil,
  IconSend,
  IconThumbDown,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  allowedQuoteActions,
  quoteActions,
  type QuoteRights,
  type SaleQuote,
} from '@/module/sales/domain/saleQuote';
import type { QuoteHandlers } from '../../hooks/useQuoteActions';

/** What a quote's row offers, from its status. Rights are checked by the caller. */
export const QuoteRowActions = ({
  quote,
  handlers,
  rights,
}: Readonly<{ quote: SaleQuote; handlers: QuoteHandlers; rights: QuoteRights }>) => {
  const { t } = useTranslation('salesQuotes');
  const actions = allowedQuoteActions(quoteActions(quote), rights);

  return (
    <Menu position="bottom-end" shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actionsAria')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEye size={16} />} onClick={() => handlers.onView(quote)}>
          {t('actions.view')}
        </Menu.Item>
        {actions.send && (
          <Menu.Item leftSection={<IconSend size={16} />} onClick={() => handlers.onSend(quote)}>
            {t('actions.send')}
          </Menu.Item>
        )}
        {actions.edit && (
          <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => handlers.onEdit(quote)}>
            {t('actions.edit')}
          </Menu.Item>
        )}
        {actions.accept && (
          <Menu.Item leftSection={<IconCheck size={16} />} onClick={() => handlers.onAccept(quote)}>
            {t('actions.accept')}
          </Menu.Item>
        )}
        {actions.reject && (
          <Menu.Item
            leftSection={<IconThumbDown size={16} />}
            onClick={() => handlers.onReject(quote)}
          >
            {t('actions.reject')}
          </Menu.Item>
        )}
        {actions.revise && (
          <Menu.Item
            leftSection={<IconArrowBackUp size={16} />}
            onClick={() => handlers.onRevise(quote)}
          >
            {t('actions.revise')}
          </Menu.Item>
        )}
        {actions.resend && (
          <Menu.Item
            leftSection={<IconMailForward size={16} />}
            onClick={() => handlers.onResend(quote)}
          >
            {t('actions.resend')}
          </Menu.Item>
        )}
        <Menu.Item leftSection={<IconDownload size={16} />} onClick={() => handlers.onPdf(quote)}>
          {t('actions.pdf')}
        </Menu.Item>
        {actions.duplicate && (
          <Menu.Item
            leftSection={<IconCopy size={16} />}
            onClick={() => handlers.onDuplicate(quote)}
          >
            {t('actions.duplicate')}
          </Menu.Item>
        )}
        {(actions.cancel || actions.remove) && <Menu.Divider />}
        {actions.cancel && (
          <Menu.Item
            color="red"
            leftSection={<IconBan size={16} />}
            onClick={() => handlers.onCancel(quote)}
          >
            {t('actions.cancel')}
          </Menu.Item>
        )}
        {actions.remove && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => handlers.onDelete(quote)}
          >
            {t('actions.remove')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
