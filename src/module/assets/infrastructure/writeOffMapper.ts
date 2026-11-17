import { BASE_URL } from '@/lib/http/endpoints';
import {
  isWriteOffType,
  type DepreciationRunLine,
  type DepreciationRunResult,
  type WriteOffFile,
  type WriteOffReport,
  type WriteOffSignature,
  type WriteOffStatus,
} from '@/module/assets/domain/writeOff';
import { mapAccountRef, toDateOnly } from './assetMapper';
import type { DepreciationRunDto, WriteOffDto, WriteOffSignatureDto } from './writeOffDto';

const STATUSES: readonly WriteOffStatus[] = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

/** Files are stored as paths relative to the API host. */
export const fileUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) return null;
  if (/^https?:\/\//.test(filePath)) return filePath;
  return `${BASE_URL.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`;
};

const mapSignature = (dto: WriteOffSignatureDto): WriteOffSignature => {
  const state = dto.state === 'signed' || dto.state === 'rejected' ? dto.state : 'waiting';
  return {
    title: dto.title ?? '',
    name: dto.name ?? null,
    role: dto.role ?? '',
    signedAt: dto.signedAt ?? null,
    state,
    imageUrl: fileUrl(dto.image?.filePath),
    note: dto.note?.trim() || null,
  };
};

export const mapWriteOff = (dto: WriteOffDto): WriteOffReport => {
  const snapshot = dto.snapshot ?? {};
  const status = STATUSES.find((value) => value === dto.status) ?? 'PENDING_APPROVAL';
  const createdBy =
    typeof dto.createdBy === 'object' && dto.createdBy
      ? { id: dto.createdBy.id, name: dto.createdBy.name ?? '' }
      : { id: dto.createdBy ?? '', name: '' };
  const attachments: WriteOffFile[] = (dto.attachments ?? []).map((file, index) => ({
    id: file.id ?? String(index),
    url: fileUrl(file.filePath) ?? '',
    fileName: file.fileName ?? '',
    mimeType: file.mimeType ?? '',
  }));
  const approvedAt = dto.approvals?.find((approval) => approval.at)?.at ?? null;
  return {
    id: dto.id,
    number: dto.number ?? '',
    assetId: (typeof dto.asset === 'string' ? dto.asset : dto.asset?.id) ?? '',
    // An unknown type still renders; it reads as the plainest kind of disposal.
    type: isWriteOffType(dto.type) ? dto.type : 'scrapped',
    status,
    incidentDate: toDateOnly(dto.incidentDate) ?? '',
    description: dto.description ?? '',
    proceedsAmount: dto.proceedsAmount ?? 0,
    proceedsAccount: mapAccountRef(dto.proceedsAccount ?? null),
    gainLossAccount: mapAccountRef(dto.gainLossAccount ?? null),
    attachments,
    snapshot: {
      code: snapshot.code ?? '',
      name: snapshot.name ?? '',
      categoryName: snapshot.categoryName ?? null,
      location: snapshot.location || undefined,
      brand: snapshot.brand || undefined,
      modelType: snapshot.modelType || undefined,
      serialNumber: snapshot.serialNumber || undefined,
      acquisitionDate: toDateOnly(snapshot.acquisitionDate) ?? '',
      acquisitionCost: snapshot.acquisitionCost ?? 0,
      accumulatedDepreciation: snapshot.accumulatedDepreciation ?? 0,
      bookValue: snapshot.bookValue ?? 0,
      estimatedGainLoss: snapshot.estimatedGainLoss ?? 0,
    },
    result: dto.result
      ? {
          accumulatedDepreciation: dto.result.accumulatedDepreciation ?? 0,
          bookValue: dto.result.bookValue ?? 0,
          gainLoss: dto.result.gainLoss ?? 0,
        }
      : null,
    signatures: (dto.signatures ?? []).map(mapSignature),
    createdBy,
    submittedAt: dto.submittedAt ?? dto.createdAt ?? '',
    decidedAt: dto.rejectedAt ?? approvedAt,
    waitingOnRoles:
      status === 'PENDING_APPROVAL'
        ? (dto.pendingApprovers ?? []).flatMap((step) =>
            (step.roles ?? [])
              .filter((role) => !role.approved && role.name)
              .map((role) => role.name as string)
          )
        : [],
    canDecide: Boolean(dto.canDecide) && status === 'PENDING_APPROVAL',
  };
};

const mapRunLine = (
  line: string | { code?: string; assetCode?: string; reason?: string; message?: string }
): DepreciationRunLine =>
  typeof line === 'string'
    ? { code: '', reason: line }
    : { code: line.code ?? line.assetCode ?? '', reason: line.reason ?? line.message ?? '' };

export const mapDepreciationRun = (dto: DepreciationRunDto): DepreciationRunResult => ({
  upTo: dto.upTo ?? '',
  months: dto.months ?? 0,
  amount: dto.amount ?? 0,
  plan: (dto.plan ?? []).map((row) => ({
    code: row.code ?? '',
    months: row.months ?? 0,
    from: row.from ?? '',
    to: row.to ?? '',
    amount: row.amount ?? 0,
  })),
  skipped: (dto.skipped ?? []).map(mapRunLine),
  failed: (dto.failed ?? []).map(mapRunLine),
});
