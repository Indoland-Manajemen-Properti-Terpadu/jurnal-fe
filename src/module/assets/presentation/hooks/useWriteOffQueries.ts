import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import type { WriteOffDraft, WriteOffListParams } from '@/module/assets/domain/writeOff';
import { separateDuties } from '@/module/assets/domain/writeOffRules';
import { getApiErrorMessage } from '@/module/assets/infrastructure/assetApi';
import {
  addWriteOffAttachments,
  approveWriteOff,
  createWriteOff,
  downloadWriteOffPdf,
  fetchCurrentUserId,
  fetchWriteOff,
  fetchWriteOffs,
  rejectWriteOff,
  runDepreciation,
} from '@/module/assets/infrastructure/writeOffApi';
import { assetKeys } from '@/module/assets/presentation/hooks/useAssetQueries';

export const writeOffKeys = {
  all: ['asset-write-offs'] as const,
  list: (params: WriteOffListParams) => ['asset-write-offs', 'list', params] as const,
  detail: (id: string) => ['asset-write-offs', 'detail', id] as const,
  pendingForAsset: (assetId: string) => ['asset-write-offs', 'pending', assetId] as const,
  decisions: ['asset-write-offs', 'decisions'] as const,
  me: ['current-user-id'] as const,
};

/** The most reports one decision list asks for; a site rarely has more waiting at once. */
const DECISION_LIMIT = 100;

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'assetWriteOffs');

export const writeOffErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, tr('notifyFailed'));

const notifyError = (error: unknown) =>
  notifications.show({
    color: 'red',
    title: tr('notifyErrorTitle'),
    message: writeOffErrorMessage(error),
  });

export const useWriteOffs = (params: WriteOffListParams, enabled = true) =>
  useQuery({
    queryKey: writeOffKeys.list(params),
    queryFn: () => fetchWriteOffs(params),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useWriteOff = (id: string | undefined) => {
  const me = useCurrentUserId();
  return useQuery({
    queryKey: writeOffKeys.detail(id ?? ''),
    queryFn: () => fetchWriteOff(id as string),
    enabled: Boolean(id),
    retry: false,
    select: (report) => separateDuties(report, me.data),
  });
};

/** The report of an asset that still waits for approval, or null. */
export const usePendingWriteOffForAsset = (assetId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: writeOffKeys.pendingForAsset(assetId ?? ''),
    queryFn: async () => {
      const page = await fetchWriteOffs({
        page: 1,
        limit: 1,
        status: 'PENDING_APPROVAL',
        assetId: assetId as string,
      });
      return page.items[0] ?? null;
    },
    enabled: Boolean(assetId) && enabled,
  });

/** Pending reports, and those the signed-in user can decide (the sidebar badge has its own count). */
export const useWriteOffDecisions = () => {
  const query = useQuery({
    queryKey: writeOffKeys.decisions,
    queryFn: () => fetchWriteOffs({ page: 1, limit: DECISION_LIMIT, status: 'PENDING_APPROVAL' }),
  });
  const me = useCurrentUserId();
  const pending = (query.data?.items ?? []).map((report) => separateDuties(report, me.data));
  const reports = pending.filter((report) => report.canDecide);
  return { reports, pending, count: reports.length, isLoading: query.isLoading, query };
};

export const useCurrentUserId = () =>
  useQuery({ queryKey: writeOffKeys.me, queryFn: fetchCurrentUserId, staleTime: Infinity });

/** A report changes the asset, its list, its totals and the decision count alike. */
const useInvalidateWriteOffs = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: writeOffKeys.all }),
      queryClient.invalidateQueries({ queryKey: assetKeys.all }),
    ]);
};

/**
 * Journals and ledger reports show a posting only once they are asked again. Their keys belong to
 * other modules, which this one may not import, so the prefixes are named here.
 */
const LEDGER_QUERY_KEYS = [
  ['accounts'],
  ['detail_account'],
  ['transaction_by_account'],
  ['detail_transaction'],
  ['journal_history'],
  ['trial-balance'],
  ['profit-loss'],
  ['general-ledger'],
  ['balance-sheet-report'],
  ['income_statement_report'],
  ['equity_change_report'],
] as const;

/** What an approval or a depreciation run changes: the write-offs, the assets and the ledger. */
const useInvalidatePosting = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWriteOffs();
  return () =>
    Promise.all([
      invalidate(),
      ...LEDGER_QUERY_KEYS.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] })
      ),
    ]);
};

export const useCreateWriteOff = (assetId: string) => {
  const invalidate = useInvalidateWriteOffs();
  return useMutation({
    mutationFn: (draft: WriteOffDraft) => createWriteOff(assetId, draft),
    onSuccess: (report) => {
      invalidate();
      notifications.show({
        color: 'teal',
        title: tr('notifySubmittedTitle'),
        message: tr('notifySubmitted', { number: report.number }),
      });
    },
  });
};

export const useApproveWriteOff = (id: string) => {
  const invalidate = useInvalidatePosting();
  return useMutation({
    mutationFn: ({ signature, note }: { signature: Blob; note: string }) =>
      approveWriteOff(id, signature, note),
    onSuccess: (report) => {
      invalidate();
      notifications.show({
        color: 'teal',
        title: tr('notifyApprovedTitle'),
        message: tr('notifyApproved', { number: report.number }),
      });
    },
  });
};

export const useRejectWriteOff = (id: string) => {
  const invalidate = useInvalidateWriteOffs();
  return useMutation({
    mutationFn: (reason: string) => rejectWriteOff(id, reason),
    onSuccess: (report) => {
      invalidate();
      notifications.show({
        color: 'orange',
        title: tr('notifyRejectedTitle'),
        message: tr('notifyRejected', { number: report.number }),
      });
    },
  });
};

export const useAddWriteOffAttachments = (id: string) => {
  const invalidate = useInvalidateWriteOffs();
  return useMutation({
    mutationFn: (files: File[]) => addWriteOffAttachments(id, files),
    onSuccess: () => {
      invalidate();
      notifications.show({ color: 'teal', message: tr('notifyEvidenceAdded') });
    },
    onError: notifyError,
  });
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const useDownloadWriteOffPdf = () =>
  useMutation({
    mutationFn: (id: string) => downloadWriteOffPdf(id),
    onSuccess: ({ blob, fileName }) => saveBlob(blob, fileName),
    onError: notifyError,
  });

export const useRunDepreciation = () => {
  const invalidate = useInvalidatePosting();
  return useMutation({
    mutationFn: (input: { assetId?: string; upTo: string }) => runDepreciation(input),
    onSuccess: () => invalidate(),
    onError: notifyError,
  });
};
