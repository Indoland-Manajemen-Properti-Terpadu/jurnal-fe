import { useState } from 'react';
import { Alert, Anchor, Button, Stack } from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import { IconEdit, IconSend, IconWallet, IconX } from '@tabler/icons-react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import { fetchContact } from '@/module/contacts';
import { useTranslation } from '@/i18n';
import {
  paymentRequestActions,
  hasVendorBankAccount,
  type PaymentRequest,
} from '@/module/purchases/domain/paymentRequest';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { IssueVoucherDialog } from '@/module/purchases/presentation/components/paymentRequests/IssueVoucherDialog';
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
  const [issuing, setIssuing] = useState(false);

  const actions = paymentRequestActions(doc);
  const canUpdate = can(PURCHASE_MENU.paymentRequests, 'update');
  const showVoucher = actions.createVoucher && can(PURCHASE_MENU.payments, 'create');
  const vendorIds = [
    ...new Set(
      doc.vendorTotals.length
        ? doc.vendorTotals.map((item) => item.vendorId)
        : doc.vendor
          ? [doc.vendor.id]
          : []
    ),
  ].filter(Boolean);
  const contacts = useQueries({
    queries: vendorIds.map((id) => ({
      queryKey: ['purchase-vendor-bank', id],
      queryFn: () => fetchContact(id),
      enabled: actions.submit && canUpdate,
      staleTime: 0,
    })),
  });
  const missing = contacts.flatMap((query) =>
    query.data && !hasVendorBankAccount(query.data.bankAccounts) ? [query.data] : []
  );
  const bankCheckIncomplete =
    vendorIds.length === 0 || contacts.some((query) => query.isPending || query.isError);

  return (
    <>
      {actions.submit && canUpdate && missing.length > 0 && (
        <Alert color="orange" title={t('paymentRequests.detail.bankMissing')}>
          <Stack gap={4}>
            {missing.map((vendor) => (
              <Anchor
                key={vendor.id}
                component={Link}
                to={generatePath(routes.contacts.detail, { idAccount: vendor.id })}
              >
                {vendor.displayName}
              </Anchor>
            ))}
          </Stack>
        </Alert>
      )}
      {actions.submit && canUpdate && contacts.some((query) => query.isError) && (
        <Alert color="orange">{t('paymentRequests.detail.bankCheckFailed')}</Alert>
      )}
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
          disabled={bankCheckIncomplete || missing.length > 0}
          onClick={() => submit.mutate({ id: doc.id })}
        >
          {t('paymentRequests.detail.submit')}
        </Button>
      )}
      {showVoucher && (
        <Button radius="md" leftSection={<IconWallet size={16} />} onClick={() => setIssuing(true)}>
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
      {issuing && <IssueVoucherDialog request={doc} opened onClose={() => setIssuing(false)} />}
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
