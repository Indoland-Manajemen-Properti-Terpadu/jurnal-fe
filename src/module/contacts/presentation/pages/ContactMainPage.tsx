import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Menu,
  Paper,
  Stack,
  Switch,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAddressBook,
  IconBriefcase,
  IconCategory,
  IconDownload,
  IconDots,
  IconHome2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTruckDelivery,
  IconUpload,
  IconUser,
  IconUserCheck,
  IconX,
  type Icon,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import { ContactStatsGrid } from '@/module/contacts/presentation/components/stats/ContactStatsGrid';
import { ContactTable } from '@/module/contacts/presentation/components/tables/ContactTable';
import { ContactFormModal } from '@/module/contacts/presentation/components/form/ContactFormModal';
import { ContactImportModal } from '@/module/contacts/presentation/components/form/ContactImportModal';
import { ContactGroupsModal } from '@/module/contacts/presentation/components/form/ContactGroupsModal';
import {
  useAccountOptions,
  useArchiveContact,
  useContactOverview,
  useContacts,
  useExportContacts,
  useSaveContact,
  useUnarchiveContact,
} from '@/module/contacts/presentation/hooks/useContactQueries';
import {
  CONTACT_TYPES,
  type Contact,
  type ContactFormValues,
  type ContactType,
} from '@/module/contacts/domain/contact';

const TAB_ICONS: Record<ContactType, Icon> = {
  Pelanggan: IconUserCheck,
  Supplier: IconTruckDelivery,
  Karyawan: IconBriefcase,
  Unit: IconHome2,
  Lainnya: IconUser,
};

export function ContactMainPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [archiveTarget, setArchiveTarget] = useState<Contact | null>(null);
  const [importModalOpened, setImportModalOpened] = useState(false);
  const [groupsModalOpened, setGroupsModalOpened] = useState(false);

  // Export Mutation
  const exportContactsMutation = useExportContacts();

  // Queries
  const contactsQuery = useContacts({
    page,
    limit,
    archived: showArchived,
    search: debouncedSearch.trim() || undefined,
    contactType: activeTab === 'all' ? undefined : activeTab,
  });
  const overview = useContactOverview(showArchived);

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
  const unarchiveMutation = useUnarchiveContact();

  const handleOpenCreate = () => {
    setEditingContact(undefined);
    setFormModalOpened(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormModalOpened(true);
  };

  const handleOpenDetail = (contact: Contact) => {
    navigate(routes.contacts.detail.replace(':idAccount', contact.id));
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

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconAddressBook}
            title={t('main.title')}
            description={t('main.description')}
            actions={
              <Group gap="xs" wrap="wrap">
                <Tooltip label={t('main.refreshTooltip')} withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => {
                      contactsQuery.refetch();
                      overview.refetch();
                    }}
                    loading={contactsQuery.isFetching || overview.isFetching}
                    aria-label={t('main.refreshAria')}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Menu position="bottom-end" shadow="none" withArrow>
                  <Menu.Target>
                    <Button variant="default" leftSection={<IconDots size={18} />}>
                      {t('main.moreActions')}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconCategory size={16} />}
                      onClick={() => setGroupsModalOpened(true)}
                    >
                      {t('main.manageGroups')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconDownload size={16} />}
                      disabled={exportContactsMutation.isPending}
                      onClick={() => exportContactsMutation.mutate()}
                    >
                      {t('main.export')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconUpload size={16} />}
                      onClick={() => setImportModalOpened(true)}
                    >
                      {t('main.import')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                >
                  {t('main.add')}
                </Button>
              </Group>
            }
          />

          <ContactStatsGrid
            counts={overview.counts}
            isLoading={overview.isLoading}
            isError={overview.isError}
          />

          {/* Main Content Tabs */}
          <Paper withBorder radius="lg" p="md" bg="white" shadow="none">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconAddressBook size={16} />}>
                  {t('main.tabs.all')}
                </Tabs.Tab>
                {CONTACT_TYPES.map((type) => {
                  const TabIcon = TAB_ICONS[type];
                  return (
                    <Tabs.Tab key={type} value={type} leftSection={<TabIcon size={16} />}>
                      {t(`main.tabs.${type}`)}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>

              <Stack gap="md">
                {/* Filter & Search Bar */}
                <Group justify="flex-start" wrap="wrap" gap="md">
                  <TextInput
                    placeholder={t('main.searchPlaceholder')}
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      searchInput ? (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setSearchInput('')}
                          aria-label={t('main.clearSearch')}
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
                  <Switch
                    checked={showArchived}
                    onChange={(event) => {
                      setShowArchived(event.currentTarget.checked);
                      setPage(1);
                    }}
                    label={t('main.showArchived')}
                    color="primary"
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
                    onUnarchive={(contact) => unarchiveMutation.mutate(contact.id)}
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
        title={t('main.archiveTitle')}
        message={t('main.archiveMessage', { name: archiveTarget?.displayName ?? '' })}
        confirmLabel={t('main.archiveConfirm')}
        confirmLoading={archiveMutation.isPending}
        confirmButtonProps={{ color: 'red' }}
      />

      {/* Import Contacts Modal */}
      <ContactImportModal opened={importModalOpened} onClose={() => setImportModalOpened(false)} />

      {/* Manage Contact Groups Modal */}
      <ContactGroupsModal opened={groupsModalOpened} onClose={() => setGroupsModalOpened(false)} />
    </AppShellLayout>
  );
}

export default ContactMainPage;
