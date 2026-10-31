import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchGeneralSettings,
  updateGeneralSettings,
  fetchAccountMappings,
  seedAccountMappings,
  updateAccountMapping,
  updateAccountMappingBatch,
  fetchNumberFormats,
  createNumberFormat,
  updateNumberFormat,
  deleteNumberFormat,
  fetchPaymentTerms,
  createPaymentTerm,
  updatePaymentTerm,
  deletePaymentTerm,
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  fetchTaxes,
  createTax,
  updateTax,
  deleteTax,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/module/settings/infrastructure/settingApi';
import type {
  CreateNumberFormatPayload,
  UpdateNumberFormatPayload,
  CreatePaymentTermPayload,
  UpdatePaymentTermPayload,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  CreateTaxPayload,
  UpdateTaxPayload,
  TagListParams,
} from '@/module/settings/domain/settingTypes';

export const settingKeys = {
  all: ['settings'] as const,
  general: () => [...settingKeys.all, 'general'] as const,
  accountMappings: () => [...settingKeys.all, 'account-mappings'] as const,
  numberFormats: () => [...settingKeys.all, 'number-formats'] as const,
  paymentTerms: () => [...settingKeys.all, 'payment-terms'] as const,
  paymentMethods: () => [...settingKeys.all, 'payment-methods'] as const,
  taxes: () => [...settingKeys.all, 'taxes'] as const,
  tags: (params?: TagListParams) => [...settingKeys.all, 'tags', params] as const,
};

/* General Settings */
export const useGeneralSettings = () => {
  return useQuery({
    queryKey: settingKeys.general(),
    queryFn: fetchGeneralSettings,
  });
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decimalPrecision: number) => updateGeneralSettings(decimalPrecision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.general() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pengaturan umum berhasil disimpan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menyimpan pengaturan umum.',
      });
    },
  });
};

/* Account Mappings */
export const useAccountMappings = () => {
  return useQuery({
    queryKey: settingKeys.accountMappings(),
    queryFn: fetchAccountMappings,
  });
};

export const useSeedAccountMappings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedAccountMappings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pemetaan akun bawaan berhasil di-generate.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal men-generate pemetaan akun bawaan.',
      });
    },
  });
};

export const useUpdateAccountMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      updateAccountMapping(id, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pemetaan akun berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui pemetaan akun.',
      });
    },
  });
};

export const useUpdateAccountMappingBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappings: Array<{ id: string; account: string }>) =>
      updateAccountMappingBatch(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Semua perubahan pemetaan akun berhasil disimpan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menyimpan perubahan pemetaan akun batch.',
      });
    },
  });
};

/* Number Formats */
export const useNumberFormats = () => {
  return useQuery({
    queryKey: settingKeys.numberFormats(),
    queryFn: fetchNumberFormats,
  });
};

export const useCreateNumberFormat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNumberFormatPayload) => createNumberFormat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Format penomoran berhasil ditambahkan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menambahkan format penomoran.',
      });
    },
  });
};

export const useUpdateNumberFormat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNumberFormatPayload }) =>
      updateNumberFormat(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Format penomoran berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui format penomoran.',
      });
    },
  });
};

export const useDeleteNumberFormat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNumberFormat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Format penomoran berhasil dihapus.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menghapus format penomoran.',
      });
    },
  });
};

/* Payment Terms */
export const usePaymentTerms = () => {
  return useQuery({
    queryKey: settingKeys.paymentTerms(),
    queryFn: () => fetchPaymentTerms(),
  });
};

export const useCreatePaymentTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentTermPayload) => createPaymentTerm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Syarat pembayaran berhasil ditambahkan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menambahkan syarat pembayaran.',
      });
    },
  });
};

export const useUpdatePaymentTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentTermPayload }) =>
      updatePaymentTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Syarat pembayaran berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui syarat pembayaran.',
      });
    },
  });
};

export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Syarat pembayaran berhasil dihapus.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menghapus syarat pembayaran.',
      });
    },
  });
};

/* Payment Methods */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: settingKeys.paymentMethods(),
    queryFn: () => fetchPaymentMethods(),
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentMethodPayload) => createPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Metode pembayaran berhasil ditambahkan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menambahkan metode pembayaran.',
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentMethodPayload }) =>
      updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Metode pembayaran berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui metode pembayaran.',
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Metode pembayaran berhasil dihapus.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menghapus metode pembayaran.',
      });
    },
  });
};

/* Taxes */
export const useTaxes = () => {
  return useQuery({
    queryKey: settingKeys.taxes(),
    queryFn: fetchTaxes,
  });
};

export const useCreateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaxPayload) => createTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pajak berhasil ditambahkan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menambahkan pajak.',
      });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pajak berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui pajak.',
      });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Pajak berhasil dihapus.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menghapus pajak.',
      });
    },
  });
};

/* Tags */
export const useTags = (params?: TagListParams) => {
  return useQuery({
    queryKey: settingKeys.tags(params),
    queryFn: () => fetchTags(params),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Tag transaksi berhasil ditambahkan.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menambahkan tag transaksi.',
      });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; color?: string } }) =>
      updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Tag transaksi berhasil diperbarui.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal memperbarui tag transaksi.',
      });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tags'] });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Tag transaksi berhasil dihapus.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: 'Gagal menghapus tag transaksi.',
      });
    },
  });
};
