import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconFileInvoice,
  IconMapPin,
  IconPencil,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Contact, ContactFormValues } from '@/module/contacts/domain/contact';
import { useContactForm } from '@/module/contacts/presentation/hooks/useContactForm';
import { ContactAddressTab } from './ContactAddressTab';
import { ContactBankTab } from './ContactBankTab';
import { ContactGeneralTab } from './ContactGeneralTab';
import { ContactMappingTab } from './ContactMappingTab';

type ContactFormModalProps = {
  opened: boolean;
  contact?: Contact;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ContactFormValues) => void;
};

export function ContactFormModal({
  opened,
  contact,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<ContactFormModalProps>) {
  const { t } = useTranslation('contacts');
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const form = useContactForm(opened, contact);

  useEffect(() => {
    if (opened) setActiveTab('general');
  }, [opened, contact]);

  const bankCount = form.values.bankAccounts.length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={38} radius="md" variant="light" color="primary">
            {contact ? <IconPencil size={20} /> : <IconUserPlus size={20} />}
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.8">
              {contact ? t('form.title.edit') : t('form.title.new')}
            </Text>
            <Text size="xs" c="dimmed">
              {contact
                ? t('form.subtitle.edit', { name: contact.displayName })
                : t('form.subtitle.new')}
            </Text>
          </Box>
        </Group>
      }
      size="920px"
      radius="lg"
      centered
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3,
      }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color="primary"
            variant="outline"
            radius="md"
          >
            <Tabs.List mb="md">
              <Tabs.Tab value="general" leftSection={<IconUser size={16} />}>
                {t('form.tabs.general')}
              </Tabs.Tab>
              <Tabs.Tab value="address" leftSection={<IconMapPin size={16} />}>
                {t('form.tabs.address')}
              </Tabs.Tab>
              <Tabs.Tab
                value="banks"
                leftSection={<IconBuildingBank size={16} />}
                rightSection={
                  bankCount > 0 ? (
                    <Badge size="xs" variant="filled" color="primary" circle>
                      {bankCount}
                    </Badge>
                  ) : null
                }
              >
                {t('form.tabs.banks')}
              </Tabs.Tab>
              <Tabs.Tab value="mapping" leftSection={<IconFileInvoice size={16} />}>
                {t('form.tabs.mapping')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <ContactGeneralTab form={form} />
            </Tabs.Panel>
            <Tabs.Panel value="address">
              <ContactAddressTab form={form} />
            </Tabs.Panel>
            <Tabs.Panel value="banks">
              <ContactBankTab form={form} />
            </Tabs.Panel>
            <Tabs.Panel value="mapping" pt="md">
              <ContactMappingTab form={form} />
            </Tabs.Panel>
          </Tabs>

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              {t('form.actions.cancel')}
            </Button>
            <Button type="submit" color="primary" loading={isSubmitting}>
              {contact ? t('form.actions.save') : t('form.actions.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default ContactFormModal;
