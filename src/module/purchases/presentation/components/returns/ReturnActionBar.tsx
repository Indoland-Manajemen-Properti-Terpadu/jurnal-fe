import { useState } from 'react';
import { Button, Group, Menu, Modal, Stack, Text } from '@mantine/core';
import { IconCheck, IconDots, IconEdit, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { returnActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseReturn } from '@/module/purchases/domain/purchaseDocuments';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  usePostReturn,
  useVoidReturn,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/** A draft is posted (the only filled button) or edited; a draft or posted return can be voided. */
export const ReturnActionBar = ({ doc }: Readonly<{ doc: PurchaseReturn }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const post = usePostReturn();
  const voidReturn = useVoidReturn();
  const [posting, setPosting] = useState(false);
  const [voiding, setVoiding] = useState(false);

  const actions = returnActions(doc);
  const showEdit = actions.edit && can(PURCHASE_MENU.documents, 'update');
  const showPost = actions.post && can(PURCHASE_MENU.documents, 'update');
  const showVoid = actions.void && can(PURCHASE_MENU.documents, 'delete');

  return (
    <>
      {showEdit && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(routes.purchases.returnEdit.replace(':id', doc.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {showPost && (
        <Button radius="md" leftSection={<IconCheck size={16} />} onClick={() => setPosting(true)}>
          {t('returns.detail.post')}
        </Button>
      )}
      {showVoid && (
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
              onClick={() => setVoiding(true)}
            >
              {t('returns.detail.void')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      <Modal
        opened={posting}
        onClose={() => setPosting(false)}
        title={t('returns.detail.postTitle')}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('returns.detail.postDescription', { amount: formatAmount(doc.finalAmount) })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" disabled={post.isPending} onClick={() => setPosting(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={post.isPending}
              onClick={() => post.mutate({ id: doc.id }, { onSuccess: () => setPosting(false) })}
            >
              {t('returns.detail.postConfirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ReasonModal
        opened={voiding}
        title={t('returns.detail.voidTitle')}
        description={
          doc.status === 'POSTED'
            ? t('returns.detail.voidDescriptionPosted')
            : t('returns.detail.voidDescription')
        }
        confirmLabel={t('returns.detail.void')}
        loading={voidReturn.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidReturn.mutate({ id: doc.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
    </>
  );
};
