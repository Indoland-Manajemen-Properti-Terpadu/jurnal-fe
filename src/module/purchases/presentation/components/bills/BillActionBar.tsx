import { useState } from 'react';
import { Alert, Button, Checkbox, Group, Menu, Modal, Stack, Text } from '@mantine/core';
import {
  IconCash,
  IconDots,
  IconEdit,
  IconReceiptRefund,
  IconRosetteDiscountCheck,
  IconTransferIn,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { billActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { ApplyCreditModal } from '@/module/purchases/presentation/components/bills/ApplyCreditModal';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useVerifyBill,
  useVoidBill,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/** The next step is the only filled button: verify a draft, pay a verified bill. */
export const BillActionBar = ({ bill }: Readonly<{ bill: PurchaseBill }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const verify = useVerifyBill();
  const voidBill = useVoidBill();
  const [verifying, setVerifying] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [applying, setApplying] = useState(false);

  const actions = billActions(bill);
  const hasVariance = bill.variances.length > 0;
  const showEdit = actions.edit && can(PURCHASE_MENU.documents, 'update');
  const showVerify = actions.verify && can(PURCHASE_MENU.documents, 'update');
  const showPay = actions.pay && can(PURCHASE_MENU.payments, 'create');
  const showCredit = actions.applyCredit && can(PURCHASE_MENU.payments, 'create');
  const showReturn = actions.createReturn && can(PURCHASE_MENU.documents, 'create');
  const showVoid = actions.void && can(PURCHASE_MENU.documents, 'delete');
  const hasMenu = showCredit || showReturn || showVoid;

  const closeVerify = () => {
    setVerifying(false);
    setAcknowledged(false);
  };

  return (
    <>
      {showEdit && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(routes.purchases.billEdit.replace(':id', bill.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {showVerify && (
        <Button
          radius="md"
          leftSection={<IconRosetteDiscountCheck size={16} />}
          onClick={() => setVerifying(true)}
        >
          {t('bills.detail.verify')}
        </Button>
      )}
      {showPay && (
        <Button
          radius="md"
          leftSection={<IconCash size={16} />}
          onClick={() => navigate(`${routes.purchases.paymentAdd}?bill=${bill.id}`)}
        >
          {t('bills.detail.pay')}
        </Button>
      )}
      {hasMenu && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" radius="md" px="xs" aria-label={t('common.more')}>
              <IconDots size={18} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {showCredit && (
              <Menu.Item
                leftSection={<IconTransferIn size={14} />}
                onClick={() => setApplying(true)}
              >
                {t('bills.detail.applyCredit')}
              </Menu.Item>
            )}
            {showReturn && (
              <Menu.Item
                leftSection={<IconReceiptRefund size={14} />}
                onClick={() => navigate(`${routes.purchases.returnAdd}?bill=${bill.id}`)}
              >
                {t('bills.detail.createReturn')}
              </Menu.Item>
            )}
            {showVoid && (
              <Menu.Item
                color="red"
                leftSection={<IconX size={14} />}
                onClick={() => setVoiding(true)}
              >
                {t('bills.detail.void')}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}

      <Modal
        opened={verifying}
        onClose={closeVerify}
        title={t('bills.detail.verifyTitle')}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('bills.detail.verifyDescription')}
          </Text>
          {hasVariance && (
            <Alert color="yellow" variant="light" radius="md">
              <Checkbox
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.currentTarget.checked)}
                label={t('bills.detail.verifyAcknowledge')}
              />
            </Alert>
          )}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeVerify} disabled={verify.isPending}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={verify.isPending}
              disabled={hasVariance && !acknowledged}
              onClick={() =>
                verify.mutate(
                  { id: bill.id, acknowledgeVariance: hasVariance && acknowledged },
                  { onSuccess: closeVerify }
                )
              }
            >
              {t('bills.detail.verify')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ReasonModal
        opened={voiding}
        title={t('bills.detail.voidTitle')}
        description={t('bills.detail.voidDescription')}
        confirmLabel={t('bills.detail.void')}
        loading={voidBill.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidBill.mutate({ id: bill.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
      {applying && <ApplyCreditModal bill={bill} opened onClose={() => setApplying(false)} />}
    </>
  );
};
