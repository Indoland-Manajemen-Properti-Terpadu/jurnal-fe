import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  downloadAccountImportTemplate,
  uploadAccountImportFile,
  commitAccountImport,
  downloadAccountExport,
  resetAccountsToDefault,
} from '../services/accountSettingService';
import { CommitImportPayload, AccountImportParsedData } from '../types/settingAccount';

export const useAccountSettings = () => {
  const queryClient = useQueryClient();

  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['journal_accounts'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    queryClient.invalidateQueries({ queryKey: ['head_accounts'] });
  };

  // Download Import Template
  const downloadTemplateMutation = useMutation({
    mutationFn: downloadAccountImportTemplate,
    onSuccess: () => {
      notifications.show({
        title: 'Unduh Berhasil',
        message: 'Template impor bagan akun berhasil diunduh.',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Unduh Gagal',
        message: error?.message || 'Gagal mengunduh template impor.',
        color: 'red',
      });
    },
  });

  // Upload & Parse File for Validation Preview
  const uploadImportMutation = useMutation<AccountImportParsedData, Error, File>({
    mutationFn: uploadAccountImportFile,
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal Memproses Berkas',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Terjadi kesalahan saat membaca file akun.',
        color: 'red',
      });
    },
  });

  // Commit Import Correct Data
  const commitImportMutation = useMutation({
    mutationFn: (payload: CommitImportPayload) => commitAccountImport(payload),
    onSuccess: (data) => {
      invalidateAccounts();
      notifications.show({
        title: 'Impor Berhasil',
        message: 'Bagan akun baru telah berhasil disimpan ke sistem.',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal Menyimpan Akun',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Terjadi kendala saat menyimpan data impor akun.',
        color: 'red',
      });
    },
  });

  // Export Accounts File
  const exportAccountsMutation = useMutation({
    mutationFn: downloadAccountExport,
    onSuccess: () => {
      notifications.show({
        title: 'Ekspor Berhasil',
        message: 'Data seluruh bagan akun berhasil diunduh.',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ekspor Gagal',
        message: error?.response?.data?.message || error?.message || 'Gagal mengekspor data akun.',
        color: 'red',
      });
    },
  });

  // Reset Accounts to System Defaults
  const resetAccountsMutation = useMutation({
    mutationFn: resetAccountsToDefault,
    onSuccess: () => {
      invalidateAccounts();
      notifications.show({
        title: 'Reset Berhasil',
        message: 'Bagan akun berhasil dipulihkan ke standar bawaan sistem.',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal Reset Akun',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Gagal mengatur ulang akun ke bawaan.',
        color: 'red',
      });
    },
  });

  return {
    downloadTemplate: downloadTemplateMutation.mutate,
    isDownloadingTemplate: downloadTemplateMutation.isPending,

    uploadImport: uploadImportMutation.mutateAsync,
    isUploading: uploadImportMutation.isPending,

    commitImport: commitImportMutation.mutateAsync,
    isCommitting: commitImportMutation.isPending,

    exportAccounts: exportAccountsMutation.mutate,
    isExporting: exportAccountsMutation.isPending,

    resetAccounts: resetAccountsMutation.mutateAsync,
    isResetting: resetAccountsMutation.isPending,
  };
};
