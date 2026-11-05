import { useState } from 'react';
import { Button, Group, Menu, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCash, IconDots, IconEdit, IconPrinter, IconSend, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { voucherActions } from '@/module/purchases/domain/purchaseActions';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { downloadPaymentPdf } from '@/module/purchases/infrastructure/purchaseApi';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  usePayVoucher,
  useSubmitPayment,
  useVoidPayment,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/**
 * One filled button at a time: submit a draft, then pay an approved voucher. Paying is the only
 * step that moves money, so it asks for a confirmation that says so.
 */
export const PaymentActionBar = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const submit = useSubmitPayment();
  const pay = usePayVoucher();
  const voidVoucher = useVoidPayment();
  const [paying, setPaying] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [printing, setPrinting] = useState(false);

  const actions = voucherActions(doc);
  const canUpdate = can(PURCHASE_MENU.payments, 'update');
  const showEdit = actions.edit && canUpdate;
  const showSubmit = actions.submit && canUpdate;
  const showPay = actions.pay && canUpdate;
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
      {showEdit && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(routes.purchases.paymentEdit.replace(':id', doc.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {showSubmit && (
        <Button
          radius="md"
          leftSection={<IconSend size={16} />}
          loading={submit.isPending}
          onClick={() => submit.mutate({ id: doc.id })}
        >
          {t('payments.detail.submit')}
        </Button>
      )}
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

      <Modal
        opened={paying}
        onClose={() => setPaying(false)}
        title={t('payments.detail.payTitle')}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('payments.detail.payDescription', {
              amount: formatAmount(doc.totalAmount + doc.adminFee),
            })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" disabled={pay.isPending} onClick={() => setPaying(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={pay.isPending}
              onClick={() => pay.mutate({ id: doc.id }, { onSuccess: () => setPaying(false) })}
            >
              {t('payments.detail.payConfirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>

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
