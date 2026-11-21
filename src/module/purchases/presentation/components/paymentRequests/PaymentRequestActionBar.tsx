import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconEdit, IconSend, IconWallet, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  paymentRequestActions,
  type PaymentRequest,
} from '@/module/purchases/domain/paymentRequest';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCancelPaymentRequest,
  useSubmitPaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/** One filled button at a time: submit a draft, or issue the voucher of an approved request. */
export const PaymentRequestActionBar = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const submit = useSubmitPaymentRequest();
  const cancel = useCancelPaymentRequest();
  const [cancelling, setCancelling] = useState(false);

  const actions = paymentRequestActions(doc);
  const canUpdate = can(PURCHASE_MENU.paymentRequests, 'update');
  const showVoucher = actions.createVoucher && can(PURCHASE_MENU.payments, 'create');

  return (
    <>
      {actions.edit && canUpdate && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(routes.purchases.paymentRequestEdit.replace(':id', doc.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {actions.submit && canUpdate && (
        <Button
          radius="md"
          leftSection={<IconSend size={16} />}
          loading={submit.isPending}
          onClick={() => submit.mutate({ id: doc.id })}
        >
          {t('paymentRequests.detail.submit')}
        </Button>
      )}
      {showVoucher && (
        <Button
          radius="md"
          leftSection={<IconWallet size={16} />}
          onClick={() => navigate(`${routes.purchases.paymentAdd}?request=${doc.id}`)}
        >
          {t('paymentRequests.detail.createVoucher')}
        </Button>
      )}
      {actions.cancel && can(PURCHASE_MENU.paymentRequests, 'delete') && (
        <Button
          variant="default"
          color="red"
          radius="md"
          leftSection={<IconX size={16} />}
          onClick={() => setCancelling(true)}
        >
          {t('paymentRequests.detail.cancel')}
        </Button>
      )}
      <ReasonModal
        opened={cancelling}
        title={t('paymentRequests.detail.cancelTitle')}
        description={t('paymentRequests.detail.cancelDescription')}
        confirmLabel={t('paymentRequests.detail.cancel')}
        loading={cancel.isPending}
        onClose={() => setCancelling(false)}
        onConfirm={(reason) =>
          cancel.mutate({ id: doc.id, reason }, { onSuccess: () => setCancelling(false) })
        }
      />
    </>
  );
};
