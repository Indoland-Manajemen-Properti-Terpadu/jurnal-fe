import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  approveAllPendingChanges,
  approvePendingChange,
  fetchPendingChanges,
  fetchPendingChangesCount,
} from '@/module/pending-changes/infrastructure/pendingChangesApi';
import type { PendingChangeListParams } from '@/module/pending-changes/domain/pendingChange';

export const pendingChangesKeys = {
  all: ['pending-changes'] as const,
  lists: () => [...pendingChangesKeys.all, 'list'] as const,
  list: (params?: PendingChangeListParams) => [...pendingChangesKeys.lists(), params] as const,
  count: () => [...pendingChangesKeys.all, 'count'] as const,
};

export const usePendingChanges = (params?: PendingChangeListParams) => {
  return useQuery({
    queryKey: pendingChangesKeys.list(params),
    queryFn: () => fetchPendingChanges(params),
  });
};

export const usePendingChangesCount = () => {
  return useQuery({
    queryKey: pendingChangesKeys.count(),
    queryFn: fetchPendingChangesCount,
    refetchInterval: 30_000, // Background poll every 30s
  });
};

export const useApprovePendingChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeId: string) => approvePendingChange(changeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingChangesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notifications.show({
        color: 'teal',
        title: 'Perubahan Disetujui',
        message: 'Perubahan data berhasil disetujui dan disinkronkan ke pembukuan.',
      });
    },
    onError: (err: any) => {
      notifications.show({
        color: 'red',
        title: 'Gagal Menyetujui',
        message: err?.response?.data?.message || 'Terjadi kesalahan saat memproses persetujuan.',
      });
    },
  });
};

export const useApproveAllPendingChanges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: string) => approveAllPendingChanges(type),
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: pendingChangesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notifications.show({
        color: 'teal',
        title: 'Semua Perubahan Disetujui',
        message: type
          ? `Seluruh antrean ${type} berhasil disetujui.`
          : 'Seluruh antrean perubahan berhasil disetujui.',
      });
    },
    onError: (err: any) => {
      notifications.show({
        color: 'red',
        title: 'Gagal Menyetujui Massal',
        message: err?.response?.data?.message || 'Terjadi kesalahan saat persetujuan massal.',
      });
    },
  });
};

