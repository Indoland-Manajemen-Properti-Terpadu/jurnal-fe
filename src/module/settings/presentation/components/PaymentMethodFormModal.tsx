import {
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconCreditCard,
  IconInfoCircle,
  IconReceipt2,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';

export type PaymentMethodFormValues = {
  name: string;
  adminFee: number;
  defaultAccount: string | null;
  feeAccount: string | null;
};

interface PaymentMethodFormModalProps {
  opened: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: UseFormReturnType<PaymentMethodFormValues>;
  onSubmit: (values: PaymentMethodFormValues) => void | Promise<void>;
  isPending: boolean;
  accounts: Array<{ value: string; label: string }>;
  isAccountsLoading: boolean;
}

export function PaymentMethodFormModal({
  opened,
  onClose,
  isEditing,
  form,
  onSubmit,
  isPending,
  accounts,
  isAccountsLoading,
}: PaymentMethodFormModalProps) {
  const { t: st } = useTranslation('settings');
  const isFeeRequired = form.values.adminFee > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="cyan" variant="light">
            <IconCreditCard size={16} />
          </ThemeIcon>
          <Text fw={700} c="dark.8">
            {isEditing ? st('paymentMethod.modalEdit') : st('paymentMethod.modalAdd')}
          </Text>
        </Group>
      }
      radius="md"
      size="lg"
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={st('paymentMethod.colName')}
            placeholder={st('paymentMethod.namePlaceholder')}
            required
            {...form.getInputProps('name')}
          />

          <Select
            label={st('paymentMethod.defaultAccount')}
            placeholder={st('paymentMethod.defaultAccountPlaceholder')}
            description={st('paymentMethod.defaultAccountHint')}
            data={accounts}
            searchable
            clearable
            disabled={isAccountsLoading}
            leftSection={<IconBuildingBank size={16} />}
            {...form.getInputProps('defaultAccount')}
          />

          <Divider my="xs" />

          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <NumberInput
                label={st('paymentMethod.feeLabel')}
                description={st('paymentMethod.feeHint')}
                placeholder="0"
                thousandSeparator="."
                decimalSeparator=","
                min={0}
                required
                {...form.getInputProps('adminFee')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 7 }}>
              <Select
                label={st('paymentMethod.feeAccountLabel')}
                placeholder={
                  isFeeRequired
                    ? st('paymentMethod.feeAccountRequiredPlaceholder')
                    : st('paymentMethod.feeAccountOptionalPlaceholder')
                }
                description={
                  isFeeRequired
                    ? st('paymentMethod.feeAccountRequiredHint')
                    : st('paymentMethod.feeAccountOptionalHint')
                }
                data={accounts}
                searchable
                clearable
                disabled={isAccountsLoading}
                required={isFeeRequired}
                leftSection={<IconReceipt2 size={16} />}
                {...form.getInputProps('feeAccount')}
              />
            </Grid.Col>
          </Grid>

          {isFeeRequired && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue" radius="md" py="xs">
              <Text size="xs">
                {st('paymentMethod.feeNoticeBefore')}{' '}
                <strong>Rp {form.values.adminFee.toLocaleString('id-ID')}</strong>{' '}
                {st('paymentMethod.feeNoticeAfter')}
              </Text>
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose}>
              {st('common.cancel')}
            </Button>
            <Button type="submit" color="primary" loading={isPending}>
              {isEditing ? st('common.saveChanges') : st('paymentMethod.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default PaymentMethodFormModal;
