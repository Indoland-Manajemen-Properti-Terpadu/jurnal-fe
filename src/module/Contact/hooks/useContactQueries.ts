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
  fetchAccountOptions,
  fetchContact,
  fetchContacts,
  fetchPaymentTerms,
  getApiErrorMessage,
  updateContact,
} from '../infrastructure/contactApi';
import type { ContactFormValues, ContactListParams } from '../types/contact';

export const contactKeys = {
  all: ['contacts'] as const,
  list: (params: ContactListParams) => ['contacts', 'list', params] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
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

