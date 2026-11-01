import { Box, Group, Pagination, Paper, Select, Table, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Contact } from '@/module/contacts/domain/contact';
import { ContactTableRow } from './ContactTableRow';
import { ContactTableSkeletonRows } from './ContactTableSkeletonRows';

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

const PAGE_SIZES = [10, 25, 50];

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
  const { t } = useTranslation('contacts');

  const columns: Array<{ label: string; style: { width: number; textAlign?: 'right' } }> = [
    { label: t('table.columns.contact'), style: { width: 260 } },
    { label: t('table.columns.type'), style: { width: 140 } },
    { label: t('table.columns.company'), style: { width: 180 } },
    { label: t('table.columns.reach'), style: { width: 190 } },
    { label: t('table.columns.mapping'), style: { width: 180 } },
    { label: t('table.columns.actions'), style: { width: 100, textAlign: 'right' } },
  ];

  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={850}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.label} style={column.style}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {column.label}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <ContactTableSkeletonRows count={Math.min(limit, 5)} />
            ) : (
              contacts.map((contact) => (
                <ContactTableRow
                  key={contact.id}
                  contact={contact}
                  accountMap={accountMap}
                  onView={onView}
                  onEdit={onEdit}
                  onArchive={onArchive}
                />
              ))
            )}
            {!isLoading && contacts.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6} p={0}>
                  <EmptyState
                    icon={<IconUsers size={32} stroke={1.6} />}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                  />
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Footer Pagination */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              {t('table.showing')}
            </Text>
            <Select
              size="xs"
              value={String(limit)}
              onChange={(v) => v && onLimitChange(Number(v))}
              data={PAGE_SIZES.map((size) => ({
                value: String(size),
                label: t('table.perPage', { count: size }),
              }))}
              w={110}
            />
            <Text size="xs" c="dimmed">
              {t('table.of')} <strong>{total}</strong> {t('table.contactsSuffix')}
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
