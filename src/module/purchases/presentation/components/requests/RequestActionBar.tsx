import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import { IconDots, IconEdit, IconSend, IconShoppingCartPlus, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCancelRequest,
  useSubmitRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/** One primary action: the next step of the flow. Everything else is secondary or in the menu. */
export const RequestActionBar = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const submit = useSubmitRequest();
  const cancel = useCancelRequest();
  const [cancelling, setCancelling] = useState(false);

  const actions = requestActions(request);
  const canUpdate = can(PURCHASE_MENU.documents, 'update');
  const showSubmit = actions.submit && canUpdate;
  const showEdit = actions.edit && canUpdate;
  const showOrder = actions.createOrder && can(PURCHASE_MENU.documents, 'create');
  const showCancel = actions.cancel && can(PURCHASE_MENU.documents, 'delete');

  return (
    <>
      {showEdit && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(routes.purchases.requestEdit.replace(':id', request.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {showSubmit && (
        <Button
          radius="md"
          leftSection={<IconSend size={16} />}
          loading={submit.isPending}
          onClick={() => submit.mutate({ id: request.id })}
        >
          {request.status === 'REJECTED' ? t('requests.detail.resubmit') : t('common.submit')}
        </Button>
      )}
      {showOrder && (
        <Button
          radius="md"
          leftSection={<IconShoppingCartPlus size={16} />}
          onClick={() => navigate(`${routes.purchases.orderAdd}?request=${request.id}`)}
        >
          {t('requests.detail.createOrder')}
        </Button>
      )}
      {showCancel && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" radius="md" px="xs" aria-label={t('common.more')}>
              <IconDots size={18} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              color="red"
              leftSection={<IconX size={14} />}
              onClick={() => setCancelling(true)}
            >
              {t('requests.detail.cancel')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      <ReasonModal
        opened={cancelling}
        title={t('requests.detail.cancelTitle')}
        description={t('requests.detail.cancelDescription')}
        confirmLabel={t('requests.detail.cancel')}
        loading={cancel.isPending}
        onClose={() => setCancelling(false)}
        onConfirm={(reason) =>
          cancel.mutate({ id: request.id, reason }, { onSuccess: () => setCancelling(false) })
        }
      />
    </>
  );
};
