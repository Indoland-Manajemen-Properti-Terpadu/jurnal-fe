import { useMemo } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import type { Contact, ContactType } from '../types/contact';
import {
  formatContactName,
  getContactTypeBadgeConfig,
  resolveAccountName,
} from '../utils/contactFormat';

type ContactTableProps = {
  contacts: Contact[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  accountMap: Map<string, string>;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onArchive: (contact: Contact) => void;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function ContactTable({
  contacts,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  accountMap,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onArchive,
}: Readonly<ContactTableProps>) {
  const rows = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${idx}`}>
          <Table.Td>
            <Group gap="sm">
              <Skeleton circle height={38} />
              <Box style={{ flex: 1 }}>
                <Skeleton height={14} width="60%" mb={4} />
                <Skeleton height={10} width="40%" />
              </Box>
            </Group>
          </Table.Td>
          <Table.Td>
            <Skeleton height={18} width={80} radius="xl" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="70%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="60%" mb={4} />
            <Skeleton height={10} width="45%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="50%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={24} width={60} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }

    return contacts.map((contact) => {
      const initials = getInitials(contact.displayName);
      const fullNameStr = formatContactName(contact);
      const email = contact.emails[0];
      const phone = contact.phones?.mobile || contact.phones?.telephone;
      const arLabel = resolveAccountName(contact.mappingAccount?.arAccount, accountMap);
      const apLabel = resolveAccountName(contact.mappingAccount?.apAccount, accountMap);

      return (
        <Table.Tr
          key={contact.id}
          style={{
            cursor: 'pointer',
            transition: 'background-color 120ms ease',
          }}
          onClick={() => onView(contact)}
        >
          {/* 1. Nama & Nomor Kontak */}
          <Table.Td>
            <Group gap="sm" wrap="nowrap">
              <Avatar
                radius="md"
                size={38}
                color="primary"
                variant="light"
                fw={700}
                fz="xs"
              >
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
                contact.contactType.map((t: ContactType) => {
                  const cfg = getContactTypeBadgeConfig(t);
                  return (
                    <Badge
                      key={t}
                      color={cfg.color}
                      variant="light"
                      size="sm"
                      radius="sm"
                    >
                      {cfg.label}
                    </Badge>
                  );
                })
              ) : (
                <Text size="xs" c="dimmed">
                  Lainnya
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
                  Piutang: {arLabel}
                </Text>
              ) : null}
              {contact.mappingAccount?.apAccount ? (
                <Text size="xs" c="blue.8" fw={500} truncate maw={170}>
                  Hutang: {apLabel}
                </Text>
              ) : null}
              {!contact.mappingAccount?.arAccount && !contact.mappingAccount?.apAccount && (
                <Text size="xs" c="dimmed">
                  Standar Sistem
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
              <Tooltip label="Lihat Detail" withArrow position="top">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => onView(contact)}
                  aria-label="Lihat Detail Kontak"
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Ubah Kontak" withArrow position="top">
                <ActionIcon
                  variant="subtle"
                  color="primary"
                  size="sm"
                  onClick={() => onEdit(contact)}
                  aria-label="Ubah Kontak"
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>

              <Menu position="bottom-end" shadow="md" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label="Menu Aksi Kontak"
                  >
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={() => onView(contact)}
                  >
                    Lihat Rincian
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => onEdit(contact)}
                  >
                    Ubah Data
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconArchive size={14} />}
                    onClick={() => onArchive(contact)}
                  >
                    Arsipkan Kontak
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [contacts, isLoading, limit, accountMap, onView, onEdit, onArchive]);

  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={850}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: 260 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Kontak & Nomor
                </Text>
              </Table.Th>
              <Table.Th style={{ width: 140 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Tipe
                </Text>
              </Table.Th>
              <Table.Th style={{ width: 180 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Perusahaan / Nama Lengkap
                </Text>
              </Table.Th>
              <Table.Th style={{ width: 190 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Email & Telepon
                </Text>
              </Table.Th>
              <Table.Th style={{ width: 180 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Pemetaan Akun
                </Text>
              </Table.Th>
              <Table.Th style={{ width: 100, textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Aksi
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        {!isLoading && contacts.length === 0 && (
          <Stack align="center" gap={6} py={56}>
            <ThemeIcon size={56} radius="xl" variant="light" color="primary">
              <IconUsers size={28} />
            </ThemeIcon>
            <Text fw={600} mt="xs" c="dark.8">
              Belum ada kontak yang cocok
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={380}>
              Coba sesuaikan kata kunci pencarian atau filter tipe kontak, atau tambahkan
              kontak baru untuk mulai mencatat transaksi.
            </Text>
          </Stack>
        )}
      </Table.ScrollContainer>

      {/* Footer Pagination */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              Menampilkan
            </Text>
            <Select
              size="xs"
              value={String(limit)}
              onChange={(v) => v && onLimitChange(Number(v))}
              data={[
                { value: '10', label: '10 per hal' },
                { value: '25', label: '25 per hal' },
                { value: '50', label: '50 per hal' },
              ]}
              w={110}
            />
            <Text size="xs" c="dimmed">
              dari <strong>{total}</strong> kontak
            </Text>
          </Group>

          <Pagination
            size="sm"
            value={page}
            onChange={onPageChange}
            total={Math.max(1, totalPages)}
            color="primary"
          />
        </Group>
      </Box>
    </Paper>
  );
}

export default ContactTable;

