import { useState } from 'react';
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
import { saleActions } from '@/module/sales/domain/saleActions';
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

/** One filled button for the next step of this invoice; everything else is quiet or in a menu. */
export function SaleActionBar({ sale, onPay }: Readonly<SaleActionBarProps>) {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const actions = saleActions(sale);
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

  return (
    <>
      <Group gap="xs" wrap="wrap">
        {actions.pdf && (
          <Button
            variant="default"
            leftSection={<IconDownload size={17} />}
            loading={downloadPdf.isPending}
            onClick={() =>
              downloadPdf.mutate({ id: sale.id, filename: invoiceFilename(sale.transactionNumber) })
            }
          >
            {t('actions.pdf')}
          </Button>
        )}
        {actions.link && (
          <Button
            variant="default"
            leftSection={<IconCopy size={17} />}
            loading={copyLink.isPending}
            onClick={() => copyLink.mutate(sale.id)}
          >
            {t('actions.link')}
          </Button>
        )}
        {actions.edit && (
          <Button
            variant="default"
            leftSection={<IconPencil size={17} />}
            onClick={() => navigate(routes.sales.edit.replace(':id', sale.id))}
          >
            {t('actions.edit')}
          </Button>
        )}
        {(actions.resend || actions.void || actions.remove !== 'hidden') && (
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
              {actions.resend && (
                <Menu.Item
                  leftSection={<IconMailForward size={16} />}
                  onClick={() =>
                    run(() =>
                      sendMutation.mutateAsync({ id: sale.id, sendEmail: true, resend: true })
                    )
                  }
                >
                  {t('actions.resend')}
                </Menu.Item>
              )}
              {actions.void && (
                <Menu.Item
                  color="red"
                  leftSection={<IconBan size={16} />}
                  onClick={() => setConfirm('void')}
                >
                  {t('actions.void')}
                </Menu.Item>
              )}
              {actions.remove === 'enabled' && (
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setConfirm('delete')}
                >
                  {t('actions.remove')}
                </Menu.Item>
              )}
              {actions.remove === 'disabled' && (
                <Tooltip
                  label={t('actions.removeDisabled')}
                  withArrow
                  position="left"
                  multiline
                  w={220}
                >
                  <div>
                    <Menu.Item color="red" leftSection={<IconTrash size={16} />} disabled>
                      {t('actions.remove')}
                    </Menu.Item>
                  </div>
                </Tooltip>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
        {actions.send && (
          <Button
            color="primary"
            leftSection={<IconSend size={17} />}
            onClick={() => setConfirm('send')}
          >
            {t('actions.send')}
          </Button>
        )}
        {actions.pay && (
          <Button color="primary" leftSection={<IconReceipt2 size={17} />} onClick={onPay}>
            {t('actions.pay')}
          </Button>
        )}
      </Group>

      <ConfirmModal
        opened={confirm === 'send'}
        loading={sendMutation.isPending}
        title={t('confirm.sendTitle', { number: sale.transactionNumber })}
        message={t('confirm.sendMessage')}
        confirmLabel={t('confirm.sendConfirm')}
        onClose={close}
        onConfirm={() => run(() => sendMutation.mutateAsync({ id: sale.id, sendEmail: true }))}
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
