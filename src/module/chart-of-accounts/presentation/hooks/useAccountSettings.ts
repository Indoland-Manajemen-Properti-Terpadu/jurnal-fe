import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import {
  downloadAccountImportTemplate,
  uploadAccountImportFile,
  commitAccountImport,
  downloadAccountExport,
  resetAccountsToDefault,
} from '../../infrastructure/accountSettingApi';
import { CommitImportPayload, AccountImportParsedData } from '../../domain/settingAccount';

const NS = 'chartOfAccounts';

export const useAccountSettings = () => {
  const queryClient = useQueryClient();

  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  // Download Import Template
  const downloadTemplateMutation = useMutation({
    mutationFn: downloadAccountImportTemplate,
    onSuccess: () => {
      notifications.show({
        title: t('settings.toast.templateOkTitle', undefined, NS),
        message: t('settings.toast.templateOkMsg', undefined, NS),
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('settings.toast.templateFailTitle', undefined, NS),
        message: error?.message || t('settings.toast.templateFailMsg', undefined, NS),
        color: 'red',
      });
    },
  });

  // Upload & Parse File for Validation Preview
  const uploadImportMutation = useMutation<AccountImportParsedData, Error, File>({
    mutationFn: uploadAccountImportFile,
    onError: (error: any) => {
      notifications.show({
        title: t('settings.toast.uploadFailTitle', undefined, NS),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('settings.toast.uploadFailMsg', undefined, NS),
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
        title: t('settings.toast.commitOkTitle', undefined, NS),
        message: t('settings.toast.commitOkMsg', undefined, NS),
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('settings.toast.commitFailTitle', undefined, NS),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('settings.toast.commitFailMsg', undefined, NS),
        color: 'red',
      });
    },
  });

  // Export Accounts File
  const exportAccountsMutation = useMutation({
    mutationFn: downloadAccountExport,
    onSuccess: () => {
      notifications.show({
        title: t('settings.toast.exportOkTitle', undefined, NS),
        message: t('settings.toast.exportOkMsg', undefined, NS),
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('settings.toast.exportFailTitle', undefined, NS),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('settings.toast.exportFailMsg', undefined, NS),
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
        title: t('settings.toast.resetOkTitle', undefined, NS),
        message: t('settings.toast.resetOkMsg', undefined, NS),
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('settings.toast.resetFailTitle', undefined, NS),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('settings.toast.resetFailMsg', undefined, NS),
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
