import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PaymentTerm } from '@/module/settings/domain/paymentTerm';
import {
  isPaymentTermInUseError,
  readPaymentTermError,
} from '@/module/settings/infrastructure/paymentTermApi';
import {
  useDeletePaymentTerm,
  useSetPaymentTermStatus,
} from '@/module/settings/presentation/hooks/usePaymentTermQueries';

type Props = { term: PaymentTerm | null; onClose: () => void };

/**
 * Confirms a delete. When the API says the term is in use (409) the dialog shows its answer and
 * offers to deactivate the term instead.
 */
export function PaymentTermDeleteDialog({ term, onClose }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const remove = useDeletePaymentTerm();
  const deactivate = useSetPaymentTermStatus();
  const inUse = isPaymentTermInUseError(remove.error);

  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Modal
      opened={term !== null}
      onClose={close}
      title={
        <Text fw={700}>{st(inUse ? 'paymentTerm.inUseTitle' : 'paymentTerm.deleteTitle')}</Text>
      }
      radius="md"
      size="sm"
    >
      {term && (
        <Stack gap="md">
          {inUse ? (
            <Alert color="orange" variant="light" icon={<IconInfoCircle size={18} />}>
              <Stack gap={4}>
                {readPaymentTermError(remove.error).message && (
                  <Text size="sm">{readPaymentTermError(remove.error).message}</Text>
                )}
                <Text size="sm">{st('paymentTerm.inUseHint')}</Text>
              </Stack>
            </Alert>
          ) : (
            <Text size="sm">
              {st('paymentTerm.deleteConfirm')} <strong>{term.name}</strong>?
            </Text>
          )}
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={close}>
              {st('common.cancel')}
            </Button>
            {inUse ? (
              <Button
                color="primary"
                loading={deactivate.isPending}
                onClick={() =>
                  deactivate.mutate({ id: term.id, isActive: false }, { onSuccess: close })
                }
              >
                {st('paymentTerm.deactivate')}
              </Button>
            ) : (
              <Button
                color="red"
                loading={remove.isPending}
                onClick={() => remove.mutate(term.id, { onSuccess: close })}
              >
                {st('common.yesDelete')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

export default PaymentTermDeleteDialog;
