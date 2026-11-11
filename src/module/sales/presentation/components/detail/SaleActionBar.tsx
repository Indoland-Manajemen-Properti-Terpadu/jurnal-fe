import { useState, type ReactNode } from 'react';
import { Button, Group, Menu, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconCopy,
  IconDownload,
  IconMailForward,
  IconPencil,
  IconReceipt2,
  IconSend,
  IconTrash,
  IconBan,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales/domain/sale';
import {
  billingEmail,
  headerActions,
  saleActions,
  type HeaderMenuItem,
} from '@/module/sales/domain/saleActions';
import { invoiceFilename } from '@/module/sales/domain/saleFormat';
import {
  useCopyInvoiceLink,
  useDeleteSale,
  useDownloadInvoicePdf,
  useSendSale,
  useVoidSale,
} from '../../hooks/useSaleMutations';
import { ConfirmModal } from '../shared/ConfirmModal';
import { ReasonModal } from '../shared/ReasonModal';

interface SaleActionBarProps {
  sale: Sale;
  onPay: () => void;
}

/**
 * Left to right by how often it is used: the one filled button for the next step, then the quiet
 * buttons, then the menu. Rarely used and destructive actions live in the menu.
 */
export function SaleActionBar({ sale, onPay }: Readonly<SaleActionBarProps>) {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const actions = saleActions(sale);
  // Without an address the invoice is still issued, but nothing is emailed.
  const hasEmail = Boolean(billingEmail(sale));
  const [confirm, setConfirm] = useState<'send' | 'delete' | 'void' | null>(null);

  const sendMutation = useSendSale();
  const voidMutation = useVoidSale();
  const deleteMutation = useDeleteSale();
  const copyLink = useCopyInvoiceLink();
  const downloadPdf = useDownloadInvoicePdf();

  const close = () => setConfirm(null);
  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    try {
      await action();
      after?.();
    } catch {
      // The mutation hook already told the user what went wrong.
    }
    close();
  };

  const layout = headerActions(actions);

  const primaryButton = () => {
    if (layout.primary === 'send') {
      return (
        <Button
          color="primary"
          leftSection={<IconSend size={17} />}
          onClick={() => setConfirm('send')}
        >
          {t('actions.send')}
        </Button>
      );
    }
    if (layout.primary === 'pay') {
      return (
        <Button color="primary" leftSection={<IconReceipt2 size={17} />} onClick={onPay}>
          {t('actions.pay')}
        </Button>
      );
    }
    return null;
  };

  const secondaryButton = (kind: 'edit' | 'pdf') =>
    kind === 'edit' ? (
      <Button
        key="edit"
        variant="default"
        leftSection={<IconPencil size={17} />}
        onClick={() => navigate(routes.sales.edit.replace(':id', sale.id))}
      >
        {t('actions.edit')}
      </Button>
    ) : (
      <Button
        key="pdf"
        variant="default"
        leftSection={<IconDownload size={17} />}
        loading={downloadPdf.isPending}
        onClick={() =>
          downloadPdf.mutate({ id: sale.id, filename: invoiceFilename(sale.transactionNumber) })
        }
      >
        {t('actions.pdf')}
      </Button>
    );

  /** A menu item that can be shown but switched off, with the reason as a tooltip. */
  const guarded = (
    key: HeaderMenuItem,
    state: 'disabled' | 'enabled' | 'hidden',
    reason: string,
    item: { label: string; icon: ReactNode; color?: string; onClick: () => void }
  ) => {
    const base = (
      <Menu.Item
        key={key}
        color={item.color}
        leftSection={item.icon}
        disabled={state === 'disabled'}
        onClick={item.onClick}
      >
        {item.label}
      </Menu.Item>
    );
    if (state !== 'disabled') return base;
    return (
      <Tooltip key={key} label={reason} withArrow position="left" multiline w={220}>
        <div>{base}</div>
      </Tooltip>
    );
  };

  const menuItem = (kind: HeaderMenuItem) => {
    switch (kind) {
      case 'link':
        return (
          <Menu.Item
            key="link"
            leftSection={<IconCopy size={16} />}
            onClick={() => copyLink.mutate(sale.id)}
          >
            {t('actions.link')}
          </Menu.Item>
        );
      case 'resend':
        return guarded('resend', actions.resend, t('actions.resendDisabled'), {
          label: t('actions.resend'),
          icon: <IconMailForward size={16} />,
          onClick: () =>
            run(() => sendMutation.mutateAsync({ id: sale.id, sendEmail: true, resend: true })),
        });
      case 'void':
        return guarded('void', actions.void, t('actions.voidDisabled'), {
          label: t('actions.void'),
          icon: <IconBan size={16} />,
          color: 'red',
          onClick: () => setConfirm('void'),
        });
      default:
        return guarded('remove', actions.remove, t('actions.removeDisabled'), {
          label: t('actions.remove'),
          icon: <IconTrash size={16} />,
          color: 'red',
          onClick: () => setConfirm('delete'),
        });
    }
  };

  // Destructive items sit below a divider, after the everyday ones.
  const everyday = layout.menu.filter((kind) => kind === 'link' || kind === 'resend');
  const destructive = layout.menu.filter((kind) => kind === 'void' || kind === 'remove');

  return (
    <>
      <Group gap="xs" wrap="wrap">
        {primaryButton()}
        {layout.secondary.map(secondaryButton)}
        {layout.menu.length > 0 && (
          <Menu position="bottom-end" shadow="md" width={230}>
            <Menu.Target>
              <Button
                variant="default"
                rightSection={<IconChevronDown size={15} />}
                aria-label={t('view.moreActions')}
              >
                {t('view.moreActions')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {everyday.map(menuItem)}
              {everyday.length > 0 && destructive.length > 0 && <Menu.Divider />}
              {destructive.map(menuItem)}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <ConfirmModal
        opened={confirm === 'send'}
        loading={sendMutation.isPending}
        title={t('confirm.sendTitle', { number: sale.transactionNumber })}
        message={t(hasEmail ? 'confirm.sendMessage' : 'confirm.sendMessageNoEmail')}
        confirmLabel={t(hasEmail ? 'confirm.sendConfirm' : 'confirm.sendConfirmNoEmail')}
        onClose={close}
        onConfirm={() => run(() => sendMutation.mutateAsync({ id: sale.id, sendEmail: hasEmail }))}
      />
      <ConfirmModal
        opened={confirm === 'delete'}
        tone="danger"
        loading={deleteMutation.isPending}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage', { number: sale.transactionNumber })}
        confirmLabel={t('confirm.deleteConfirm')}
        onClose={close}
        onConfirm={() =>
          run(
            () => deleteMutation.mutateAsync(sale.id),
            () => navigate(routes.sales.main)
          )
        }
      />
      <ReasonModal
        opened={confirm === 'void'}
        loading={voidMutation.isPending}
        title={t('confirm.voidTitle', { number: sale.transactionNumber })}
        description={t('confirm.voidMessage')}
        confirmLabel={t('confirm.voidConfirm')}
        onClose={close}
        onConfirm={(reason) => run(() => voidMutation.mutateAsync({ id: sale.id, reason }))}
      />
    </>
  );
}
