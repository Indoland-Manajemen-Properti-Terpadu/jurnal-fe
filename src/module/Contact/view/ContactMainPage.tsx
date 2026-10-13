import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAddressBook,
  IconBriefcase,
  IconHome2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTruckDelivery,
  IconUser,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import { ContactStatsGrid } from '../components/ContactStatsGrid';
import { ContactTable } from '../components/ContactTable';
import { ContactFormModal } from '../components/ContactFormModal';
import {
  useAccountOptions,
  useArchiveContact,
  useContacts,
  useSaveContact,
} from '../hooks/useContactQueries';
import type { Contact, ContactFormValues } from '../types/contact';

export function ContactMainPage() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [archiveTarget, setArchiveTarget] = useState<Contact | null>(null);

  // Queries
  const contactsQuery = useContacts({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    contactType: activeTab === 'all' ? undefined : activeTab,
  });

  const accountsQuery = useAccountOptions();

  // Quick lookups
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    (accountsQuery.data ?? []).forEach((acc) => {
      map.set(acc.id, acc.label);
    });
    return map;
  }, [accountsQuery.data]);

  // Mutations
  const saveMutation = useSaveContact(editingContact?.id);
  const archiveMutation = useArchiveContact();

  const handleOpenCreate = () => {
    setEditingContact(undefined);
    setFormModalOpened(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormModalOpened(true);
  };

  const handleOpenDetail = (contact: Contact) => {
    navigate(routes.Contact.DetailContact.replace(':idAccount', contact.id));
  };

  const handleFormSubmit = async (values: ContactFormValues) => {
    await saveMutation.mutateAsync(values);
    setFormModalOpened(false);
    setEditingContact(undefined);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    await archiveMutation.mutateAsync(archiveTarget.id);
    setArchiveTarget(null);
  };

  const handleTabChange = (val: string | null) => {
    setActiveTab(val ?? 'all');
    setPage(1);
  };

  const pagination = contactsQuery.data?.pagination;
  const contactsList = contactsQuery.data?.items ?? [];
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  // Approximate metrics for overview cards
  const stats = useMemo(() => {
    let cust = 0;
    let supp = 0;
    let empl = 0;
    let unit = 0;
    contactsList.forEach((c) => {
      if (c.contactType.includes('Pelanggan')) cust += 1;
      if (c.contactType.includes('Supplier')) supp += 1;
      if (c.contactType.includes('Karyawan')) empl += 1;
      if (c.contactType.includes('Unit')) unit += 1;
    });
    return {
      total,
      customers: cust,
      suppliers: supp,
      employees: empl,
      units: unit,
    };
  }, [contactsList, total]);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Module Header */}
          <ModuleHeader
            icon={IconAddressBook}
            title="Direktori Kontak"
            description="Kelola seluruh profil rekanan bisnis, pelanggan, pemasok, unit properti, dan karyawan. Hubungkan dengan akun piutang dan hutang untuk kemudahan pencatatan transaksi yang konsisten dan akurat."
            actions={
              <Group gap="xs">
                <Tooltip label="Muat ulang data" withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => contactsQuery.refetch()}
                    loading={contactsQuery.isFetching}
                    aria-label="Refresh kontak"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                >
                  Tambah Kontak
                </Button>
              </Group>
            }
          />

          {/* Quick Stats Grid */}
          <ContactStatsGrid
            total={stats.total}
            customers={stats.customers}
            suppliers={stats.suppliers}
            employees={stats.employees}
            units={stats.units}
          />

          {/* Main Content Tabs */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconAddressBook size={16} />}>
                  Semua Kontak
                </Tabs.Tab>
                <Tabs.Tab value="Pelanggan" leftSection={<IconUserCheck size={16} />}>
                  Pelanggan
                </Tabs.Tab>
                <Tabs.Tab value="Supplier" leftSection={<IconTruckDelivery size={16} />}>
                  Pemasok / Vendor
                </Tabs.Tab>
                <Tabs.Tab value="Karyawan" leftSection={<IconBriefcase size={16} />}>
                  Karyawan
                </Tabs.Tab>
                <Tabs.Tab value="Unit" leftSection={<IconHome2 size={16} />}>
                  Unit
                </Tabs.Tab>
                <Tabs.Tab value="Lainnya" leftSection={<IconUser size={16} />}>
                  Lainnya
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                {/* Filter & Search Bar */}
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <TextInput
                    placeholder="Cari nama, perusahaan, nomor kontak, atau email..."
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      searchInput ? (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setSearchInput('')}
                          aria-label="Hapus pencarian"
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      ) : null
                    }
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.currentTarget.value);
                      setPage(1);
                    }}
                    w={{ base: '100%', sm: 360 }}
                  />
                </Group>

                {/* Main Table */}
                <Box pos="relative">
                  <LoadingOverlay
                    visible={contactsQuery.isFetching && !contactsQuery.isLoading}
                    overlayProps={{ blur: 1 }}
                  />
                  <ContactTable
                    contacts={contactsList}
                    isLoading={contactsQuery.isLoading}
                    page={page}
                    limit={limit}
                    total={total}
                    totalPages={totalPages}
                    accountMap={accountMap}
                    onPageChange={(p) => setPage(p)}
                    onLimitChange={(l) => {
                      setLimit(l);
                      setPage(1);
                    }}
                    onView={handleOpenDetail}
                    onEdit={handleOpenEdit}
                    onArchive={(contact) => setArchiveTarget(contact)}
                  />
                </Box>
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Add / Edit Contact Modal */}
      <ContactFormModal
        opened={formModalOpened}
        contact={editingContact}
        isSubmitting={saveMutation.isPending}
        onClose={() => {
          setFormModalOpened(false);
          setEditingContact(undefined);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        opened={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
        title="Arsipkan Kontak Ini?"
        message={`Apakah Anda yakin ingin mengarsipkan kontak "${archiveTarget?.displayName}"? Kontak yang diarsipkan tidak akan muncul dalam pilihan transaksi baru.`}
        confirmLabel="Arsipkan"
        confirmLoading={archiveMutation.isPending}
        confirmButtonProps={{ color: 'red' }}
      />
    </AppShellLayout>
  );
}

export default ContactMainPage;
