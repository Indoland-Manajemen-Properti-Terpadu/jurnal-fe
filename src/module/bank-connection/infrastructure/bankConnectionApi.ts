import apiClient from '@/lib/http/apiClient';
import type {
  BankConnection,
  BankProvider,
  ConnectionEvent,
  ProviderStatus,
  SyncRun,
  SyncTrigger,
} from '@/module/bank-connection/domain/connection';
import {
  DOCUMENT_TYPES,
  type DocumentType,
} from '@/module/bank-connection/domain/connectionDocuments';
import type {
  AccountType,
  ConnectionBody,
  DraftBody,
} from '@/module/bank-connection/domain/connectionForm';
import {
  CONNECTION_STATUSES,
  resolveNextAction,
  type ConnectionStatus,
  type NextAction,
} from '@/module/bank-connection/domain/connectionStatus';
import { maskAccountNumber } from '@/module/bank-connection/domain/connectionForm';
import {
  BankConnectionError,
  toBankConnectionError,
} from '@/module/bank-connection/infrastructure/bankConnectionErrors';

export { BankConnectionError };

/**
 * Endpoints proposed in docs/prd/bank-connection.md (section 7). The backend does not provide them
 * yet, so every shape here is tolerant and a 404 on the provider list means "not available yet".
 */
const BASE = '/v1/bank-connections';
const PROVIDERS = '/v1/bank-providers';

type Dto = Record<string, unknown>;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;
const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/** The list answers as `{ results }`, `{ data: { results } }`, `{ data: [] }` or a bare array. */
const rowsOf = (body: unknown): Dto[] => {
  const root = (body ?? {}) as Dto;
  const data = root.data as Dto | Dto[] | undefined;
  const found =
    (Array.isArray(root.results) && root.results) ||
    (data && !Array.isArray(data) && Array.isArray(data.results) && data.results) ||
    (Array.isArray(data) && data) ||
    (Array.isArray(body) && body) ||
    [];
  return found as Dto[];
};

const rowOf = (body: unknown): Dto => {
  const root = (body ?? {}) as Dto;
  return ((root.data && !Array.isArray(root.data) ? root.data : root) as Dto) ?? {};
};

const PROVIDER_STATUSES: ProviderStatus[] = ['AVAILABLE', 'COMING_SOON', 'MAINTENANCE'];

const toFees = (value: unknown): BankProvider['fees'] => {
  const entries = (Array.isArray(value) ? (value as Dto[]) : [])
    .filter((rule) => rule.accountType === 'CORPORATE' || rule.accountType === 'INDIVIDUAL')
    .map((rule) => [
      rule.accountType as AccountType,
      {
        monthly: asNumber(rule.monthly) ?? 0,
        includedRefreshes: asNumber(rule.includedRefreshes) ?? 0,
        extraRefreshFee: asNumber(rule.extraRefreshFee) ?? 0,
        autoRefreshes: asNumber(rule.autoRefreshesPerMonth) ?? 0,
        autoDebit: rule.billing === 'AUTO_DEBIT',
      },
    ]);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

const toUsage = (value: unknown): BankConnection['refreshUsage'] => {
  const usage = (value ?? {}) as Dto;
  const used = asNumber(usage.used);
  const included = asNumber(usage.included);
  if (used === undefined || included === undefined) return undefined;
  return { used, included, extraRefreshFee: asNumber(usage.extraRefreshFee) };
};

const toProvider = (dto: Dto): BankProvider => ({
  id: String(dto.id ?? ''),
  bankName: asString(dto.bankName) ?? '',
  bankCode: asString(dto.bankCode),
  accountTypes: (Array.isArray(dto.accountTypes) ? dto.accountTypes : []).filter(
    (type): type is AccountType => type === 'INDIVIDUAL' || type === 'CORPORATE'
  ),
  capabilities: Array.isArray(dto.capabilities) ? dto.capabilities.map(String) : [],
  status: PROVIDER_STATUSES.includes(dto.status as ProviderStatus)
    ? (dto.status as ProviderStatus)
    : 'COMING_SOON',
  monthlyFee: asNumber((dto.monthlyFee as Dto | undefined)?.amount),
  requiredFields: Array.isArray(dto.requiredFields) ? dto.requiredFields.map(String) : [],
  consentValidityMonths: asNumber(dto.consentValidityMonths),
  logoUrl: asString(dto.logoUrl),
  fees: toFees(dto.feeRules),
});

/** An unknown status is shown as an error state rather than guessed at. */
const toStatus = (value: unknown): ConnectionStatus =>
  CONNECTION_STATUSES.includes(value as ConnectionStatus) ? (value as ConnectionStatus) : 'ERROR';

const toConnection = (dto: Dto): BankConnection => {
  const status = toStatus(dto.status);
  const consent = (dto.consent ?? {}) as Dto;
  const signatory = (dto.signatory ?? {}) as Dto;
  return {
    id: String(dto.id ?? ''),
    providerId: String(dto.providerId ?? ''),
    bankName: asString(dto.bankName) ?? '',
    accountId: String(dto.accountId ?? ''),
    accountType: dto.accountType === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'CORPORATE',
    status,
    nextAction: resolveNextAction(status, asString(dto.nextAction) as NextAction | undefined),
    reason: asString(dto.reason),
    accountNumberMasked:
      asString(dto.bankAccountNumberMasked) ?? maskAccountNumber(asString(dto.bankAccountNumber)),
    accountHolderName: asString(dto.accountHolderName),
    signatoryName: asString(signatory.name),
    memo: asString(dto.memo),
    consentSignedAt: asString(consent.signedAt),
    consentExpiresAt: asString(consent.expiresAt),
    lastSyncedAt: asString(dto.lastSyncedAt),
    statementBalance: asNumber(dto.statementBalance),
    statementBalanceAsOf: asString(dto.statementBalanceAsOf),
    signingUrl: asString(dto.signingUrl),
    refreshUsage: toUsage(dto.refreshUsage),
    documents: (Array.isArray(dto.documents) ? (dto.documents as Dto[]) : [])
      .filter((item) => DOCUMENT_TYPES.includes(item.type as DocumentType))
      .map((item) => ({
        type: item.type as DocumentType,
        fileName: asString(item.fileName) ?? '',
      })),
  };
};

const TRIGGERS: SyncTrigger[] = ['SCHEDULE', 'WEBHOOK', 'MANUAL'];

const toSyncRun = (dto: Dto): SyncRun => ({
  id: String(dto.id ?? ''),
  startedAt: asString(dto.startedAt) ?? '',
  finishedAt: asString(dto.finishedAt),
  trigger: TRIGGERS.includes(dto.trigger as SyncTrigger)
    ? (dto.trigger as SyncTrigger)
    : 'SCHEDULE',
  status: dto.status === 'RUNNING' || dto.status === 'FAILED' ? dto.status : 'SUCCESS',
  added: asNumber(dto.added) ?? 0,
  duplicates: asNumber(dto.duplicates) ?? 0,
  errorCode: asString((dto.error as Dto | undefined)?.code),
});

const toEvent = (dto: Dto, index: number): ConnectionEvent => ({
  id: asString(dto.id) ?? `event-${index}`,
  at: asString(dto.at) ?? '',
  actor: asString(dto.actor),
  toStatus: toStatus(dto.toStatus),
  reason: asString(dto.reason),
});

const REQUEST = { timeout: 30_000 };

/** Wraps a call so every failure becomes a `BankConnectionError`. */
const run = async <T>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch (error) {
    throw toBankConnectionError(error);
  }
};

export const listProviders = (): Promise<BankProvider[]> =>
  run(async () => {
    try {
      const response = await apiClient.get(PROVIDERS, { params: undefined });
      return rowsOf(response.data).map(toProvider);
    } catch (error) {
      const normalized = toBankConnectionError(error);
      // No such resource: the feature is not built on the backend yet.
      if (normalized.kind === 'notFound') {
        throw new BankConnectionError('unavailable', '', { status: 404 });
      }
      throw normalized;
    }
  });

export const listConnections = (
  filters: { accountId?: string; status?: string } = {}
): Promise<BankConnection[]> =>
  run(async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => Boolean(value))
    );
    const response = await apiClient.get(BASE, { params });
    return rowsOf(response.data).map(toConnection);
  });

export const getConnection = (id: string): Promise<BankConnection> =>
  run(async () => toConnection(rowOf((await apiClient.get(`${BASE}/${id}`, {})).data)));

export const createConnection = (body: ConnectionBody | DraftBody): Promise<BankConnection> =>
  run(async () => toConnection(rowOf((await apiClient.post(BASE, body, REQUEST)).data)));

export const updateConnection = (
  id: string,
  body: ConnectionBody | DraftBody
): Promise<BankConnection> =>
  run(async () =>
    toConnection(rowOf((await apiClient.patch(`${BASE}/${id}`, body, REQUEST)).data))
  );

const action = (id: string, name: string, body: unknown = {}): Promise<BankConnection> =>
  run(async () =>
    toConnection(rowOf((await apiClient.post(`${BASE}/${id}/${name}`, body, REQUEST)).data))
  );

export const submitConnection = (id: string) => action(id, 'submit');
export const signConnection = (id: string) => action(id, 'sign');
export const cancelConnection = (id: string) => action(id, 'cancel');
export const revokeConnection = (id: string, reason?: string) =>
  action(id, 'revoke', reason ? { reason } : {});

export const syncConnection = (id: string): Promise<{ syncRunId: string }> =>
  run(async () => {
    const response = await apiClient.post(`${BASE}/${id}/sync`, {}, REQUEST);
    return { syncRunId: String(rowOf(response.data).syncRunId ?? '') };
  });

export const listSyncRuns = (id: string, limit = 10): Promise<SyncRun[]> =>
  run(async () => {
    const response = await apiClient.get(`${BASE}/${id}/sync-runs`, { params: { limit } });
    return rowsOf(response.data).map(toSyncRun);
  });

export const listEvents = (id: string): Promise<ConnectionEvent[]> =>
  run(async () => {
    const response = await apiClient.get(`${BASE}/${id}/events`, {});
    return rowsOf(response.data).map(toEvent);
  });

/** The consent letter as a file, for opening in a new tab. */
export const fetchConsentDocument = (id: string): Promise<Blob> =>
  run(async () => {
    const response = await apiClient.get(`${BASE}/${id}/consent-document`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  });

/** Asks for a bank that is not offered yet (`POST /v1/bank-provider-requests`, proposed in the PRD, 7.1). */
export const proposeBank = (input: { bankCode: string; note?: string }): Promise<void> =>
  run(async () => {
    try {
      await apiClient.post('/v1/bank-provider-requests', input, REQUEST);
    } catch (error) {
      const normalized = toBankConnectionError(error);
      if (normalized.kind === 'notFound') {
        throw new BankConnectionError('unavailable', '', { status: 404 });
      }
      throw normalized;
    }
  });

/** One document of a request (`POST /v1/bank-connections/:id/documents`, multipart: `type` and `file`). */
export const uploadDocument = (id: string, type: DocumentType, file: File): Promise<void> =>
  run(async () => {
    const body = new FormData();
    body.append('type', type);
    body.append('file', file);
    await apiClient.post(`${BASE}/${id}/documents`, body, REQUEST);
  });
