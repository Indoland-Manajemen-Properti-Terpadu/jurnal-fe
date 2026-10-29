import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAddressBook,
  IconArchive,
  IconArrowLeft,
  IconDownload,
  IconEdit,
  IconInfoCircle,
  IconReceipt2,
  IconSearch,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ContactFormModal } from '../components/ContactFormModal';
import { ContactProfileSections } from '../components/ContactProfileSections';
import { TableTransactionByContact } from '../components/Table/TableTransactionByContact';
import {
  useAccountOptions,
  useArchiveContact,
  useContact,
  useExportContactTransactions,
  useSaveContact,
} from '../hooks/useContactQueries';
import {
  useContactTransactionView,
  TransactionStatusFilter,
} from '../hooks/useContactTransactionView';
import type { ContactFormValues } from '../types/contact';
import { getContactTypeBadgeConfig } from '../utils/contactFormat';
import classes from './DetailContact.module.css';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DetailContactPage() {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('contactDetail');
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('profile');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<TransactionStatusFilter>('all');
  const [search, setSearch] = useState('');

  const contactQuery = useContact(idAccount);
  const accountsQuery = useAccountOptions();
  const transactions = useContactTransactionView(idAccount, search, status, page, limit);
  const exportMutation = useExportContactTransactions(idAccount);
  const saveMutation = useSaveContact(contactQuery.data?.id);
  const archiveMutation = useArchiveContact();
  const contact = contactQuery.data;

  const accountMap = useMemo(
    () => new Map((accountsQuery.data ?? []).map((account) => [account.id, account.label])),
    [accountsQuery.data]
  );

  const handleSave = async (values: ContactFormValues) => {
    await saveMutation.mutateAsync(values);
    setEditOpen(false);
    contactQuery.refetch();
  };

  const handleArchive = async () => {
    if (!contact) return;
    await archiveMutation.mutateAsync(contact.id);
    navigate(routes.Contact.Main);
  };

  const changeStatus = (value: string | null) => {
    setStatus((value ?? 'all') as TransactionStatusFilter);
    setPage(1);
  };

  if (contactQuery.isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg" aria-label={t('loading')}>
            <Skeleton height={56} radius="md" />
            <Skeleton height={220} radius="lg" />
            <Skeleton height={350} radius="lg" />
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  if (contactQuery.isError || !contact) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder radius="lg" p="xl">
            <Stack align="center" gap="sm" ta="center">
              <IconInfoCircle size={36} color="var(--mantine-color-red-6)" />
              <Title order={3}>{t('notFoundTitle')}</Title>
              <Text c="dimmed" fz="sm">
                {t('notFoundDescription')}
              </Text>
              <Button
                mt="sm"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.Contact.Main)}
              >
                {t('backToContacts')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconAddressBook}
            title={t('pageTitle')}
            description={t('pageDescription')}
            actions={
              <Group gap="xs" wrap="wrap">
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate(routes.Contact.Main)}
                >
                  {t('backToContacts')}
                </Button>
                {!contact.deleted && (
                  <Button
                    variant="default"
                    color="red"
                    leftSection={<IconArchive size={16} />}
                    onClick={() => setArchiveOpen(true)}
                  >
                    {t('archive')}
                  </Button>
                )}
                <Button leftSection={<IconEdit size={16} />} onClick={() => setEditOpen(true)}>
                  {t('editContact')}
                </Button>
              </Group>
            }
          />

          <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} className={classes.hero}>
            <Group justify="space-between" align="stretch" gap="xl" className={classes.heroContent}>
              <Group gap="lg" align="flex-start" className={classes.heroIdentity} wrap="nowrap">
                <Avatar
                  size={76}
                  radius="lg"
                  color="primary"
                  variant="light"
                  className={classes.heroAvatar}
                >
                  {getInitials(contact.displayName)}
                </Avatar>
                <Stack gap="xs" className={classes.heroIdentity}>
                  <Text fz="xs" fw={700} tt="uppercase" lts="0.08em" c="primary.7">
                    {t('contactRecord')}
                  </Text>
                  <Title order={2} fz={{ base: 23, sm: 30 }} className={classes.heroTitle}>
                    {contact.displayName}
                  </Title>
                  <Group gap="xs">
                    {contact.contactType.map((type) => {
                      const config = getContactTypeBadgeConfig(type);
                      return (
                        <Badge key={type} color={config.color} variant="light">
                          {t(`type.${type}`)}
                        </Badge>
                      );
                    })}
                    <Badge color={contact.deleted ? 'gray' : 'teal'} variant="light">
                      {contact.deleted ? t('archived') : t('active')}
                    </Badge>
                    {contact.contactGroups?.map((group) => (
                      <Badge key={group} color="gray" variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </Group>
                  <Text fz="sm" c="dimmed">
                    {[contact.companyName, contact.emails?.[0], contact.phones?.mobile]
                      .filter(Boolean)
                      .join(' · ') || t('noPrimaryDetails')}
                  </Text>
                </Stack>
              </Group>
              <div className={classes.heroSummary}>
                <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('contactNumber')}
                </Text>
                <Text fw={750} fz="lg" c="primary.8" mt={4} className={classes.breakValue}>
                  {contact.contactNumber || t('notProvided')}
                </Text>
                {contact.external_id && (
                  <>
                    <Text fz="xs" c="dimmed" mt="md">
                      {t('externalCode')}
                    </Text>
                    <Text fw={600} fz="sm" className={classes.breakValue}>
                      {contact.external_id}
                    </Text>
                  </>
                )}
              </div>
            </Group>
          </Paper>

          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color="primary"
            variant="pills"
            radius="md"
          >
            <Paper withBorder radius="lg" p="sm" mb="lg">
              <Tabs.List className={classes.tabList}>
                <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
                  {t('profileTab')}
                </Tabs.Tab>
                <Tabs.Tab value="transactions" leftSection={<IconReceipt2 size={16} />}>
                  {t('transactionsTab')}
                </Tabs.Tab>
              </Tabs.List>
            </Paper>

            <Tabs.Panel value="profile">
              <ContactProfileSections contact={contact} accountMap={accountMap} />
            </Tabs.Panel>

            <Tabs.Panel value="transactions">
              <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="md">
                    <div>
                      <Text fw={700} fz="lg">
                        {t('transactionsTitle')}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {t('transactionsDescription')}
                      </Text>
                    </div>
                    <Group gap="xs" className={classes.transactionActions}>
                      <Button
                        variant="default"
                        leftSection={<IconDownload size={16} />}
                        loading={exportMutation.isPending}
                        onClick={() => exportMutation.mutate()}
                      >
                        {t('exportTransactions')}
                      </Button>
                      {idAccount && (
                        <Button
                          variant="light"
                          onClick={() =>
                            navigate(
                              routes.Contact.TransactionDetailByContact.replace(
                                ':idAccount',
                                idAccount
                              )
                            )
                          }
                        >
                          {t('allTransactions')}
                        </Button>
                      )}
                    </Group>
                  </Group>
                  {transactions.isLimited && (
                    <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
                      {t('invoiceLimitNote')}
                    </Alert>
                  )}
                  <TextInput
                    aria-label={t('searchInvoices')}
                    placeholder={t('searchInvoices')}
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      search ? (
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          onClick={() => {
                            setSearch('');
                            setPage(1);
                          }}
                          aria-label={t('clearSearch')}
                        >
                          <IconX size={14} />
                        </Button>
                      ) : null
                    }
                    value={search}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value);
                      setPage(1);
                    }}
                  />
                  <Tabs
                    value={status}
                    onChange={changeStatus}
                    variant="pills"
                    radius="md"
                    color="primary"
                  >
                    <Tabs.List className={classes.tabList}>
                      {(['all', 'UNPAID', 'PAID', 'OVERDUE', 'DRAFT'] as const).map((value) => (
                        <Tabs.Tab key={value} value={value}>
                          {t(`status.${value}`)}
                        </Tabs.Tab>
                      ))}
                    </Tabs.List>
                  </Tabs>
                  {transactions.query.isError ? (
                    <Alert
                      color="red"
                      title={t('transactionsError')}
                      icon={<IconInfoCircle size={18} />}
                    >
                      <Button
                        variant="light"
                        size="xs"
                        color="red"
                        mt="xs"
                        onClick={() => transactions.query.refetch()}
                      >
                        {t('retry')}
                      </Button>
                    </Alert>
                  ) : (
                    <TableTransactionByContact
                      transactions={transactions.items}
                      isLoading={transactions.query.isLoading || transactions.query.isFetching}
                      page={page}
                      limit={limit}
                      total={transactions.filteredCount}
                      totalPages={transactions.totalPages}
                      onPageChange={setPage}
                      onLimitChange={(value) => {
                        setLimit(value);
                        setPage(1);
                      }}
                    />
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Box>

      <ContactFormModal
        opened={editOpen}
        contact={contact}
        isSubmitting={saveMutation.isPending}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmModal
        opened={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
        title={t('archiveTitle')}
        message={t('archiveMessage', { name: contact.displayName })}
        confirmLabel={t('archive')}
        confirmLoading={archiveMutation.isPending}
        confirmButtonProps={{ color: 'red' }}
      />
    </AppShellLayout>
  );
}

export default DetailContactPage;
