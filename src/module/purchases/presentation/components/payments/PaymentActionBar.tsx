import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCash, IconDots, IconPrinter, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { voucherActions } from '@/module/purchases/domain/purchaseActions';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { downloadPaymentPdf } from '@/module/purchases/infrastructure/purchaseApi';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { PayDialog } from '@/module/purchases/presentation/components/payments/PayDialog';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useVoidPayment } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

/** Pay a draft voucher; print or void from the menu. Paying asks for the account and the date. */
export const PaymentActionBar = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t } = useTranslation('purchases');
  const { can } = usePurchaseAccess();
  const voidVoucher = useVoidPayment();
  const [paying, setPaying] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [printing, setPrinting] = useState(false);

  const actions = voucherActions(doc);
  const showPay = actions.pay && can(PURCHASE_MENU.payments, 'update');
  const showVoid = actions.void && can(PURCHASE_MENU.payments, 'delete');
  const showPrint = can(PURCHASE_MENU.payments, 'read');

  const print = async () => {
    setPrinting(true);
    try {
      saveBlob(await downloadPaymentPdf(doc.id), `${doc.number}.pdf`);
    } catch {
      notifications.show({ color: 'orange', message: t('payments.detail.printFailed') });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      {showPay && (
        <Button radius="md" leftSection={<IconCash size={16} />} onClick={() => setPaying(true)}>
          {t('payments.detail.pay')}
        </Button>
      )}
      {(showPrint || showVoid) && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" radius="md" px="xs" aria-label={t('common.more')}>
              <IconDots size={18} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {showPrint && (
              <Menu.Item
                leftSection={<IconPrinter size={14} />}
                disabled={printing}
                onClick={() => {
                  print();
                }}
              >
                {t('payments.detail.print')}
              </Menu.Item>
            )}
            {showVoid && (
              <Menu.Item
                color="red"
                leftSection={<IconX size={14} />}
                onClick={() => setVoiding(true)}
              >
                {t('payments.detail.void')}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
      {paying && <PayDialog doc={doc} opened onClose={() => setPaying(false)} />}
      <ReasonModal
        opened={voiding}
        title={t('payments.detail.voidTitle')}
        description={
          doc.status === 'PAID'
            ? t('payments.detail.voidDescriptionPaid')
            : t('payments.detail.voidDescription')
        }
        confirmLabel={t('payments.detail.void')}
        loading={voidVoucher.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidVoucher.mutate({ id: doc.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
    </>
  );
};
