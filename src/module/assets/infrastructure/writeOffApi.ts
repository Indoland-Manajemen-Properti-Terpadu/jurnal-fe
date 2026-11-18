import apiClient from '@/lib/http/apiClient';
import type {
  DepreciationRunResult,
  WriteOffDraft,
  WriteOffListParams,
  WriteOffPage,
  WriteOffReport,
} from '@/module/assets/domain/writeOff';
import { proceedsAllowed, receivedAmount } from '@/module/assets/domain/writeOffRules';
import type { ApiEnvelope, PaginatedDto } from './assetDto';
import type { DepreciationRunDto, WriteOffDto } from './writeOffDto';
import { mapDepreciationRun, mapWriteOff } from './writeOffMapper';

export const WRITE_OFF_ENDPOINTS = {
  list: '/v1/asset-reports',
  detail: (id: string) => `/v1/asset-reports/${id}`,
  approve: (id: string) => `/v1/asset-reports/${id}/approve`,
  reject: (id: string) => `/v1/asset-reports/${id}/reject`,
  attachments: (id: string) => `/v1/asset-reports/${id}/attachments`,
  pdf: (id: string) => `/v1/asset-reports/${id}/pdf`,
  me: '/v1/users/me',
  runDepreciation: '/v1/assets/depreciation/run',
} as const;

const SIGNATURE_FILE = 'tanda-tangan.png';
const PDF_FALLBACK_NAME = 'berita-acara.pdf';

/** The API rejects unknown or empty query parameters, so only the set ones go out. */
const listQuery = (params: WriteOffListParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

export const fetchWriteOffs = async (params: WriteOffListParams): Promise<WriteOffPage> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<WriteOffDto>>>(
    WRITE_OFF_ENDPOINTS.list,
    { params: listQuery(params) }
  );
  const page = data.data;
  return {
    items: (page?.data ?? []).map(mapWriteOff),
    pagination: page?.pagination ?? { total: 0, page: 1, limit: params.limit, totalPages: 0 },
  };
};

export const fetchWriteOff = async (id: string): Promise<WriteOffReport> => {
  const { data } = await apiClient.get<ApiEnvelope<WriteOffDto>>(WRITE_OFF_ENDPOINTS.detail(id));
  return mapWriteOff(data.data);
};

export const createWriteOff = async (
  assetId: string,
  draft: WriteOffDraft
): Promise<WriteOffReport> => {
  const amount = receivedAmount(draft);
  const form = new FormData();
  form.append('assetId', assetId);
  form.append('type', draft.type ?? '');
  form.append('incidentDate', draft.incidentDate);
  form.append('description', draft.description.trim());
  form.append('proceedsAmount', String(amount));
  if (amount > 0 && draft.proceedsAccount) form.append('proceedsAccount', draft.proceedsAccount);
  // The account field sits with the money received, which a fully depreciated asset has none of.
  if (draft.gainLossAccount && proceedsAllowed(draft.type)) {
    form.append('gainLossAccount', draft.gainLossAccount);
  }
  if (draft.signature) form.append('signature', draft.signature, SIGNATURE_FILE);
  draft.evidence.forEach((file) => form.append('attachments', file, file.name));
  const { data } = await apiClient.post<ApiEnvelope<WriteOffDto>>(WRITE_OFF_ENDPOINTS.list, form);
  return mapWriteOff(data.data);
};

export const approveWriteOff = async (
  id: string,
  signature: Blob,
  note: string
): Promise<WriteOffReport> => {
  const form = new FormData();
  form.append('signature', signature, SIGNATURE_FILE);
  if (note.trim()) form.append('note', note.trim());
  const { data } = await apiClient.post<ApiEnvelope<WriteOffDto>>(
    WRITE_OFF_ENDPOINTS.approve(id),
    form
  );
  return mapWriteOff(data.data);
};

export const rejectWriteOff = async (id: string, reason: string): Promise<WriteOffReport> => {
  const { data } = await apiClient.post<ApiEnvelope<WriteOffDto>>(WRITE_OFF_ENDPOINTS.reject(id), {
    reason: reason.trim(),
  });
  return mapWriteOff(data.data);
};

export const addWriteOffAttachments = async (
  id: string,
  files: File[]
): Promise<WriteOffReport> => {
  const form = new FormData();
  files.forEach((file) => form.append('attachments', file, file.name));
  const { data } = await apiClient.post<ApiEnvelope<WriteOffDto>>(
    WRITE_OFF_ENDPOINTS.attachments(id),
    form
  );
  return mapWriteOff(data.data);
};

const fileNameFrom = (disposition: unknown) => {
  if (typeof disposition !== 'string') return PDF_FALLBACK_NAME;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1].trim()) : PDF_FALLBACK_NAME;
};

export const downloadWriteOffPdf = async (
  id: string
): Promise<{ blob: Blob; fileName: string }> => {
  const response = await apiClient.get<Blob>(WRITE_OFF_ENDPOINTS.pdf(id), { responseType: 'blob' });
  const headers = (response.headers ?? {}) as Record<string, unknown>;
  return { blob: response.data, fileName: fileNameFrom(headers['content-disposition']) };
};

/** `GET /v1/users/me` answers with the user itself, without the envelope. */
export const fetchCurrentUserId = async (): Promise<string> => {
  const { data } = await apiClient.get<{ id?: string; data?: { id?: string } }>(
    WRITE_OFF_ENDPOINTS.me
  );
  return data.id ?? data.data?.id ?? '';
};

export const runDepreciation = async (input: {
  assetId?: string;
  upTo: string;
}): Promise<DepreciationRunResult> => {
  const body = input.assetId ? { assetId: input.assetId, upTo: input.upTo } : { upTo: input.upTo };
  const { data } = await apiClient.post<ApiEnvelope<DepreciationRunDto>>(
    WRITE_OFF_ENDPOINTS.runDepreciation,
    body
  );
  return mapDepreciationRun(data.data);
};
