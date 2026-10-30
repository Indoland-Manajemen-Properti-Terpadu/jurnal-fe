import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMail,
  IconPhone,
  IconReceipt2,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Contact, ContactType } from '@/module/contacts/domain/contact';
import {
  formatContactName,
  getContactTypeBadgeConfig,
  resolveAccountName,
} from '@/module/contacts/domain/contactFormat';
import { getInitials } from '@/module/contacts/domain/contactTransactions';
import { contactTypeLabel } from '../contactTypeLabel';

type Props = {
  contact: Contact;
  accountMap: Map<string, string>;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onArchive: (contact: Contact) => void;
};

export function ContactTableRow({
  contact,
  accountMap,
  onView,
  onEdit,
  onArchive,
}: Readonly<Props>) {
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');

  const initials = getInitials(contact.displayName);
  const fullNameStr = formatContactName(contact);
  const email = contact.emails[0];
  const phone = contact.phones?.mobile || contact.phones?.telephone;
  const arLabel = resolveAccountName(contact.mappingAccount?.arAccount, accountMap);
  const apLabel = resolveAccountName(contact.mappingAccount?.apAccount, accountMap);

  return (
    <Table.Tr
      style={{
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
      onClick={() => onView(contact)}
    >
      {/* 1. Nama & Nomor Kontak */}
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar radius="md" size={38} color="primary" variant="light" fw={700} fz="xs">
            {initials}
          </Avatar>
          <Box style={{ minWidth: 160 }}>
            <Text fw={600} size="sm" c="primary.9" lh={1.3}>
              {contact.displayName}
            </Text>
            <Text size="xs" ff="monospace" c="dimmed" mt={2}>
              {contact.contactNumber || '—'}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      {/* 2. Tipe Kontak */}
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {contact.contactType && contact.contactType.length > 0 ? (
            contact.contactType.map((type: ContactType) => (
              <Badge
                key={type}
                color={getContactTypeBadgeConfig(type).color}
                variant="light"
                size="sm"
                radius="sm"
              >
                {contactTypeLabel(t, type)}
              </Badge>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              {t('types.Lainnya')}
            </Text>
          )}
        </Group>
      </Table.Td>

      {/* 3. Perusahaan / Nama Lengkap */}
      <Table.Td>
        <Box style={{ minWidth: 140 }}>
          <Text size="sm" fw={500} c="dark.8">
            {contact.companyName || '—'}
          </Text>
          {fullNameStr && fullNameStr !== contact.displayName && (
            <Text size="xs" c="dimmed">
              {fullNameStr}
            </Text>
          )}
        </Box>
      </Table.Td>

      {/* 4. Informasi Kontak (Email & Phone) */}
      <Table.Td>
        <Stack gap={2}>
          {email ? (
            <Group gap={4} wrap="nowrap">
              <IconMail size={13} color="var(--mantine-color-gray-6)" />
              <Text size="xs" c="dark.8" truncate maw={180}>
                {email}
              </Text>
            </Group>
          ) : null}
          {phone ? (
            <Group gap={4} wrap="nowrap">
              <IconPhone size={13} color="var(--mantine-color-gray-6)" />
              <Text size="xs" c="dimmed">
                {phone}
              </Text>
            </Group>
          ) : null}
          {!email && !phone && (
            <Text size="xs" c="dimmed">
              —
            </Text>
          )}
        </Stack>
      </Table.Td>

      {/* 5. Akun Pemetaan */}
      <Table.Td>
        <Stack gap={2}>
          {contact.mappingAccount?.arAccount ? (
            <Text size="xs" c="teal.8" fw={500} truncate maw={170}>
              {t('table.receivable', { account: arLabel })}
            </Text>
          ) : null}
          {contact.mappingAccount?.apAccount ? (
            <Text size="xs" c="blue.8" fw={500} truncate maw={170}>
              {t('table.payable', { account: apLabel })}
            </Text>
          ) : null}
          {!contact.mappingAccount?.arAccount && !contact.mappingAccount?.apAccount && (
            <Text size="xs" c="dimmed">
              {t('table.systemDefault')}
            </Text>
          )}
        </Stack>
      </Table.Td>

      {/* 6. Aksi */}
      <Table.Td
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label={t('table.viewTooltip')} withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => onView(contact)}
              aria-label={t('table.viewAria')}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('table.editTooltip')} withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="primary"
              size="sm"
              onClick={() => onEdit(contact)}
              aria-label={t('table.editAria')}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>

          <Menu position="bottom-end" shadow="md" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={t('table.menuAria')}>
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView(contact)}>
                {t('table.menuView')}
              </Menu.Item>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(contact)}>
                {t('table.menuEdit')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconReceipt2 size={14} />}
                onClick={() =>
                  navigate(
                    routes.Contact.TransactionDetailByContact.replace(':idAccount', contact.id)
                  )
                }
              >
                {t('table.menuHistory')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconArchive size={14} />}
                onClick={() => onArchive(contact)}
              >
                {t('table.menuArchive')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
