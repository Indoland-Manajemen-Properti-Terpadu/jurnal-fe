import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
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

const notifySuccess = (message: string) =>
  notifications.show({ color: 'teal', title: 'Berhasil', message });

const notifyError = (error: unknown, fallback: string) =>
  notifications.show({
    color: 'red',
    title: 'Gagal',
    message: getApiErrorMessage(error, fallback),
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
        editingId
          ? `Kontak "${saved.displayName}" berhasil diperbarui.`
          : `Kontak "${saved.displayName}" berhasil ditambahkan.`
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => {
      notifyError(
        error,
        editingId ? 'Gagal memperbarui kontak.' : 'Gagal menambahkan kontak baru.'
      );
    },
  });
};

export const useArchiveContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveContact(id),
    onSuccess: (archived) => {
      notifySuccess(`Kontak "${archived.displayName}" berhasil diarsipkan.`);
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => {
      notifyError(error, 'Gagal mengarsipkan kontak.');
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
    onSuccess: () => notifySuccess('Ekspor transaksi kontak berhasil diunduh.'),
    onError: (error) => notifyError(error, 'Gagal mengekspor transaksi kontak.'),
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
      notifySuccess('Grup kontak baru berhasil dibuat.');
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'Gagal membuat grup kontak.'),
  });
};

export const useUpdateContactGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      updateContactGroup(groupId, name),
    onSuccess: () => {
      notifySuccess('Grup kontak berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'Gagal memperbarui grup kontak.'),
  });
};

export const useDeleteContactGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => deleteContactGroup(groupId),
    onSuccess: () => {
      notifySuccess('Grup kontak berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: contactKeys.groups });
    },
    onError: (error) => notifyError(error, 'Gagal menghapus grup kontak.'),
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
    onSuccess: () => notifySuccess('Data kontak berhasil diekspor.'),
    onError: (error) => notifyError(error, 'Gagal mengekspor data kontak.'),
  });

export const useDownloadContactTemplate = () =>
  useMutation({
    mutationFn: () => downloadContactTemplate(),
    onSuccess: () => notifySuccess('Template impor kontak berhasil diunduh.'),
    onError: (error) => notifyError(error, 'Gagal mengunduh template impor.'),
  });

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importContacts(file),
    onSuccess: (res) => {
      notifySuccess(`Impor selesai. ${res.imported ?? 0} kontak berhasil diproses.`);
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error) => notifyError(error, 'Gagal mengimpor file kontak.'),
  });
};


