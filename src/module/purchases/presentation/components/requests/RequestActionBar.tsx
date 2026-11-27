import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import {
  IconArrowBackUp,
  IconCircleCheck,
  IconDots,
  IconEdit,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { requestRights } from '@/module/purchases/domain/requestAccess';
import { VerifyRequestDialog } from '@/module/purchases/presentation/components/requests/VerifyRequestDialog';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCancelRequest,
  useReturnRequest,
  useSubmitRequest,
  useVerifyRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

type Dialog = 'verify' | 'return' | 'cancel' | null;

/** One primary action: the next step of the flow. Everything else is secondary or in the menu. */
export const RequestActionBar = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const submit = useSubmitRequest();
  const verify = useVerifyRequest();
  const sendBack = useReturnRequest();
  const cancel = useCancelRequest();
  const [dialog, setDialog] = useState<Dialog>(null);

  const actions = requestActions(request);
  const rights = requestRights(can, request.isOwner);
  const showEdit = actions.edit && rights.edit;
  const showSubmit = actions.submit && rights.edit;
  const showVerify = actions.verify && rights.decide && request.requestApproval?.canDecide === true;
  const showReturn = actions.return && rights.decide && request.requestApproval?.canDecide === true;
  const showCancel = actions.cancel && rights.cancel;
  const close = () => setDialog(null);

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
      {showReturn && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconArrowBackUp size={16} />}
          onClick={() => setDialog('return')}
        >
          {t('requests.detail.return')}
        </Button>
      )}
      {showSubmit && (
        <Button
          radius="md"
          leftSection={<IconSend size={16} />}
          loading={submit.isPending}
          onClick={() => submit.mutate({ id: request.id })}
        >
          {request.status === 'RETURNED' ? t('requests.detail.resubmit') : t('common.submit')}
        </Button>
      )}
      {showVerify && (
        <Button
          radius="md"
          leftSection={<IconCircleCheck size={16} />}
          onClick={() => setDialog('verify')}
        >
          {t('requests.detail.verify')}
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
              onClick={() => setDialog('cancel')}
            >
              {t('requests.detail.cancel')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      <VerifyRequestDialog
        opened={dialog === 'verify'}
        loading={verify.isPending}
        onClose={close}
        onConfirm={() => verify.mutate({ id: request.id }, { onSuccess: close })}
      />
      <ReasonModal
        opened={dialog === 'return'}
        title={t('requests.detail.returnTitle')}
        description={t('requests.detail.returnDescription')}
        confirmLabel={t('requests.detail.return')}
        tone="primary"
        label={t('requests.detail.returnNote')}
        placeholder={t('requests.detail.returnNotePlaceholder')}
        loading={sendBack.isPending}
        onClose={close}
        onConfirm={(note) => sendBack.mutate({ id: request.id, note }, { onSuccess: close })}
      />
      <ReasonModal
        opened={dialog === 'cancel'}
        title={t('requests.detail.cancelTitle')}
        description={t('requests.detail.cancelDescription')}
        confirmLabel={t('requests.detail.cancel')}
        loading={cancel.isPending}
        onClose={close}
        onConfirm={(reason) => cancel.mutate({ id: request.id, reason }, { onSuccess: close })}
      />
    </>
  );
};
