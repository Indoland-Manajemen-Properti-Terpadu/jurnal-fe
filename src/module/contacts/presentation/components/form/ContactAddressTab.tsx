import { Group, Paper, Stack, Switch, Text, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { ContactFormValues } from '@/module/contacts/domain/contact';
import { AddressRegionFields } from './AddressRegionFields';

type Props = { form: UseFormReturnType<ContactFormValues> };

export function ContactAddressTab({ form }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const sameAsBilling = form.values.addresses.shipping.isSameAsBilling;

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md" bg="white">
        <Text fw={700} size="sm" c="primary.9" mb="xs">
          {t('form.address.billingTitle')}
        </Text>
        <Stack gap="sm">
          <Textarea
            label={t('form.address.billingFull.label')}
            placeholder={t('form.address.billingFull.placeholder')}
            rows={2}
            {...form.getInputProps('addresses.billing.general')}
          />
          <AddressRegionFields form={form} kind="billing" />
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="center" mb="xs">
          <Text fw={700} size="sm" c="primary.9">
            {t('form.address.shippingTitle')}
          </Text>
          <Switch
            label={t('form.address.sameAsBilling')}
            checked={sameAsBilling}
            onChange={(e) =>
              form.setFieldValue('addresses.shipping.isSameAsBilling', e.currentTarget.checked)
            }
          />
        </Group>

        {!sameAsBilling ? (
          <Stack gap="sm" mt="sm">
            <Textarea
              label={t('form.address.shippingFull.label')}
              placeholder={t('form.address.shippingFull.placeholder')}
              rows={2}
              {...form.getInputProps('addresses.shipping.general')}
            />
            <AddressRegionFields form={form} kind="shipping" />
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            {t('form.address.sameAsBillingNote')}
          </Text>
        )}
      </Paper>
    </Stack>
  );
}
