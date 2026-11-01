import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import {
  archiveContact,
  createContact,
  createContactGroup,
  deleteContactGroup,
  downloadContactTemplate,
  exportContacts,
  exportSalesByCustomer,
  fetchAccountOptions,
  fetchContact,
  fetchContactGroups,
  fetchContacts,
  fetchFilteredAccounts,
  fetchPaymentTerms,
  fetchSalesByCustomer,
  getApiErrorMessage,
  importContacts,
  updateContact,
  updateContactGroup,
  type ContactTransactionParams,
} from '@/module/contacts/infrastructure/contactApi';
import type { ContactFormValues, ContactListParams } from '@/module/contacts/domain/contact';

export const contactKeys = {
  all: ['contacts'] as const,
  list: (params: ContactListParams) => ['contacts', 'list', params] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
  transactions: (id: string, params?: ContactTransactionParams) =>
    ['contacts', 'transactions', id, params] as const,
  groups: ['contacts', 'groups'] as const,
  filteredAccounts: (cat: string) => ['contacts', 'filtered-accounts', cat] as const,
  accounts: ['contact-account-options'] as const,
  paymentTerms: ['contact-payment-terms'] as const,
};

const tr = (key: string, params?: Record<string, string | number>) => t(key, params, 'contacts');

const notifySuccess = (message: string) =>
  notifications.show({ color: 'teal', title: tr('notify.successTitle'), message });

const notifyError = (error: unknown, fallbackKey: string) =>
  notifications.show({
    color: 'red',
    title: tr('notify.errorTitle'),
    message: getApiErrorMessage(error, tr(fallbackKey)),
  });

/* ---------- Queries ---------- */

export const useContacts = (params: ContactListParams) =>
  useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => fetchContacts(params),
    placeholderData: keepPreviousData,
  });

export const useContact = (id: string | undefined) =>
  useQuery({
    queryKey: contactKeys.detail(id ?? ''),
    queryFn: () => fetchContact(id as string),
    enabled: Boolean(id),
  });

export const useAccountOptions = () =>
  useQuery({
    queryKey: contactKeys.accounts,
    queryFn: fetchAccountOptions,
    staleTime: 5 * 60 * 1000,
  });

export const usePaymentTerms = () =>
  useQuery({
    queryKey: contactKeys.paymentTerms,
    queryFn: fetchPaymentTerms,
    staleTime: 10 * 60 * 1000,
  });

/* ---------- Mutations ---------- */

export const useSaveContact = (editingId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ContactFormValues) =>
      editingId ? updateContact(editingId, values) : createContact(values),
    onSuccess: (saved) => {
      notifySuccess(
        tr(editingId ? 'notify.updated' : 'notify.created', { name: saved.displayName })
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => {
      notifyError(error, editingId ? 'notify.updateFailed' : 'notify.createFailed');
    },
  });
};

export const useArchiveContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveContact(id),
    onSuccess: (archived) => {
      notifySuccess(tr('notify.archived', { name: archived.displayName }));
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => {
      notifyError(error, 'notify.archiveFailed');
    },
  });
};

/* ---------- Transactions by Contact Hooks ---------- */

export const useContactTransactions = (
  contactId: string | undefined,
  params: ContactTransactionParams = {}
) =>
  useQuery({
    queryKey: contactKeys.transactions(contactId ?? '', params),
    queryFn: () => fetchSalesByCustomer(contactId as string, params),
    enabled: Boolean(contactId),
    placeholderData: keepPreviousData,
  });

export const useExportContactTransactions = (contactId: string | undefined) =>
  useMutation({
    mutationFn: () => exportSalesByCustomer(contactId as string),
    onSuccess: () => notifySuccess(tr('notify.transactionsExported')),
    onError: (error) => notifyError(error, 'notify.transactionsExportFailed'),
  });

/* ---------- Contact Groups Hooks ---------- */

export const useContactGroups = () =>
  useQuery({
    queryKey: contactKeys.groups,
    queryFn: fetchContactGroups,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateContactGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createContactGroup(name),
    onSuccess: () => {
      notifySuccess(tr('notify.groupCreated'));
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'notify.groupCreateFailed'),
  });
};

export const useUpdateContactGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      updateContactGroup(groupId, name),
    onSuccess: () => {
      notifySuccess(tr('notify.groupUpdated'));
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'notify.groupUpdateFailed'),
  });
};

export const useDeleteContactGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => deleteContactGroup(groupId),
    onSuccess: () => {
      notifySuccess(tr('notify.groupDeleted'));
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'notify.groupDeleteFailed'),
  });
};

/* ---------- Filtered AP / AR Accounts Hooks ---------- */

export const useFilteredAccounts = (category: 'AP' | 'AR') =>
  useQuery({
    queryKey: contactKeys.filteredAccounts(category),
    queryFn: () => fetchFilteredAccounts(category),
    staleTime: 5 * 60 * 1000,
  });

/* ---------- Export & Import Contacts Hooks ---------- */

export const useExportContacts = () =>
  useMutation({
    mutationFn: () => exportContacts(),
    onSuccess: () => notifySuccess(tr('notify.exported')),
    onError: (error) => notifyError(error, 'notify.exportFailed'),
  });

export const useDownloadContactTemplate = () =>
  useMutation({
    mutationFn: () => downloadContactTemplate(),
    onSuccess: () => notifySuccess(tr('notify.templateDownloaded')),
    onError: (error) => notifyError(error, 'notify.templateFailed'),
  });

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importContacts(file),
    onSuccess: (res) => {
      notifySuccess(tr('notify.imported', { count: res.imported ?? 0 }));
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => notifyError(error, 'notify.importFailed'),
  });
};
