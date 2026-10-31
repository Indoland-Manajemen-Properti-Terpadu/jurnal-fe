import { useMemo, useState } from 'react';
import { Box, Button, Group, Paper, Skeleton, Stack, Tabs, Text, Title } from '@mantine/core';
import {
  IconAddressBook,
  IconArchive,
  IconArrowLeft,
  IconEdit,
  IconInfoCircle,
  IconReceipt2,
  IconUser,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ContactFormModal } from '@/module/contacts/presentation/components/form/ContactFormModal';
import { ContactProfileSections } from '@/module/contacts/presentation/components/ContactProfileSections';
import { ContactDetailHero } from '@/module/contacts/presentation/components/detail/ContactDetailHero';
import { ContactTransactionsPanel } from '@/module/contacts/presentation/components/detail/ContactTransactionsPanel';
import {
  useAccountOptions,
  useArchiveContact,
  useContact,
  useExportContactTransactions,
  useSaveContact,
} from '@/module/contacts/presentation/hooks/useContactQueries';
import { useContactTransactionView } from '@/module/contacts/presentation/hooks/useContactTransactionView';
import type { ContactFormValues } from '@/module/contacts/domain/contact';
import type { TransactionStatusFilter } from '@/module/contacts/domain/contactTransactions';
import classes from './DetailContactPage.module.css';

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
    navigate(routes.contacts.main);
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
                onClick={() => navigate(routes.contacts.main)}
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
                  onClick={() => navigate(routes.contacts.main)}
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

          <ContactDetailHero contact={contact} />

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
              <ContactTransactionsPanel
                contactId={idAccount}
                search={search}
                status={status}
                page={page}
                limit={limit}
                transactions={transactions}
                isExporting={exportMutation.isPending}
                onExport={() => exportMutation.mutate()}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                onStatusChange={changeStatus}
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
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
