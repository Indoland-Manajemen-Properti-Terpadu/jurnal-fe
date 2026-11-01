import { useState } from 'react';
import { Box, Button, Divider, Group, Modal, Tabs, Text, ThemeIcon } from '@mantine/core';
import { IconFileDescription, IconFilePlus, IconReceipt2, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CreateSaleFormValues } from '../../domain/sale';
import { useCreateSaleForm } from '../hooks/useCreateSaleForm';
import { CreateSaleAdditionalTab } from './CreateSaleAdditionalTab';
import { CreateSaleGeneralTab } from './CreateSaleGeneralTab';
import { CreateSaleItemsTab } from './CreateSaleItemsTab';
import { CreateSaleSummary } from './CreateSaleSummary';

type CreateSaleModalProps = {
  opened: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSaleFormValues) => Promise<void>;
};

export function CreateSaleModal({
  opened,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<CreateSaleModalProps>) {
  const { t } = useTranslation('sales');
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const sale = useCreateSaleForm();
  const { form } = sale;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" color="primary" variant="light">
            <IconFilePlus size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} c="primary.9">
              {t('create.title')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('create.subtitle')}
            </Text>
          </Box>
        </Group>
      }
      size="xl"
      radius="lg"
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab} color="primary" variant="pills" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="general" leftSection={<IconUser size={15} />}>
              {t('create.tabGeneral')}
            </Tabs.Tab>
            <Tabs.Tab value="items" leftSection={<IconReceipt2 size={15} />}>
              {t('create.tabItems', { count: form.values.items.length })}
            </Tabs.Tab>
            <Tabs.Tab value="additional" leftSection={<IconFileDescription size={15} />}>
              {t('create.tabAdditional')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <CreateSaleGeneralTab
              form={form}
              customerOptions={sale.customerOptions}
              paymentTermOptions={sale.paymentTermOptions}
              onCustomerChange={sale.handleCustomerChange}
            />
          </Tabs.Panel>
          <Tabs.Panel value="items">
            <CreateSaleItemsTab
              form={form}
              productOptions={sale.productOptions}
              taxOptions={sale.taxOptions}
              onProductSelect={sale.handleProductSelect}
              onAddRow={sale.addItemRow}
            />
          </Tabs.Panel>
          <Tabs.Panel value="additional">
            <CreateSaleAdditionalTab form={form} accountOptions={sale.accountOptions} />
          </Tabs.Panel>
        </Tabs>

        <CreateSaleSummary totals={sale.totals} />

        <Divider my="md" />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            {t('create.cancel')}
          </Button>
          <Button type="submit" color="primary" loading={isSubmitting}>
            {t('create.save')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export default CreateSaleModal;
