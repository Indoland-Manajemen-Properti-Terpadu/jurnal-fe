import type {
  RetentionPreview,
  RetentionReleaseInput,
  RetentionReport,
  RetentionRow,
  RetentionSummary,
  RetentionTask,
} from '@/module/purchases/domain/retention';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import { uploadAttachments } from '@/module/purchases/infrastructure/purchaseApi';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';

/** The day part of a timestamp the service sends (`2026-11-25T00:00:00.000Z`). */
const day = (value: string | null | undefined): string | null =>
  value ? value.slice(0, 10) : null;

interface RowDto {
  purchaseOrder: string;
  transactionNumber: string;
  isService?: boolean;
  vendorName?: string | null;
  status?: string | null;
  retentionPercent?: number;
  maintenanceMonths?: number;
  totalAmount?: number;
  heldAmount?: number;
  releasedAmount?: number;
  balance?: number;
  state?: string | null;
  stateLabel?: string | null;
  maintenanceFrom?: string | null;
  releasableFrom?: string | null;
  reminderDate?: string | null;
  daysLeft?: number | null;
  releaseBill?: string | { id: string } | null;
}

interface ReportDto {
  total: number;
  count: number;
  maintenanceCount?: number;
  releasableCount?: number;
  rows: RowDto[];
}

export interface SummaryRetentionDto {
  total: number;
  count: number;
  releasableCount?: number;
  orders?: {
    purchaseOrder: string;
    transactionNumber: string;
    vendorName?: string | null;
    balance?: number;
    state?: string | null;
    stateLabel?: string | null;
    releasableFrom?: string | null;
    daysLeft?: number | null;
  }[];
}

interface TaskDto {
  purchaseOrder: string;
  transactionNumber: string;
  vendorName?: string | null;
  balance?: number;
  type: string;
  title?: string | null;
  dueDate?: string | null;
  daysLeft?: number | null;
}

const toRow = (dto: RowDto): RetentionRow => ({
  purchaseOrderId: dto.purchaseOrder,
  number: dto.transactionNumber,
  vendorName: dto.vendorName ?? '',
  isService: dto.isService ?? false,
  status: dto.status ?? '',
  percent: dto.retentionPercent ?? 0,
  maintenanceMonths: dto.maintenanceMonths ?? 0,
  total: dto.totalAmount ?? 0,
  held: dto.heldAmount ?? 0,
  released: dto.releasedAmount ?? 0,
  balance: dto.balance ?? 0,
  state: dto.state ?? 'NONE',
  stateLabel: dto.stateLabel ?? '',
  maintenanceFrom: day(dto.maintenanceFrom),
  releasableFrom: day(dto.releasableFrom),
  reminderDate: day(dto.reminderDate),
  daysLeft: dto.daysLeft ?? null,
  releaseBillId:
    typeof dto.releaseBill === 'string' ? dto.releaseBill : (dto.releaseBill?.id ?? null),
});

/** Only the people who may read the purchasing report receive `retention`; others get null. */
export const toRetentionSummary = (
  dto: SummaryRetentionDto | undefined
): RetentionSummary | null =>
  dto
    ? {
        total: dto.total,
        count: dto.count,
        releasableCount: dto.releasableCount ?? 0,
        orders: (dto.orders ?? []).map((order) => ({
          purchaseOrderId: order.purchaseOrder,
          number: order.transactionNumber,
          vendorName: order.vendorName ?? '',
          balance: order.balance ?? 0,
          state: order.state ?? 'NONE',
          stateLabel: order.stateLabel ?? '',
          releasableFrom: day(order.releasableFrom),
          daysLeft: order.daysLeft ?? null,
        })),
      }
    : null;

/** "Hutang Retensi": held retention per order. It is not part of the payables report. */
export const getRetentionReport = async (): Promise<RetentionReport> => {
  const { data } = await http.get<ApiEnvelope<ReportDto>>(PURCHASE_API.retention, undefined);
  return {
    total: data.total,
    count: data.count,
    maintenanceCount: data.maintenanceCount ?? 0,
    releasableCount: data.releasableCount ?? 0,
    rows: data.rows.map(toRow),
  };
};

/** The retention to-dos: ask for the final handover, then release (H-30 reminder date). */
export const getRetentionTasks = async (): Promise<RetentionTask[]> => {
  const { data } = await http.get<ApiEnvelope<TaskDto[]>>(PURCHASE_API.retentionTasks, undefined);
  return (data ?? []).map((task) => ({
    purchaseOrderId: task.purchaseOrder,
    number: task.transactionNumber,
    vendorName: task.vendorName ?? '',
    balance: task.balance ?? 0,
    type: task.type,
    title: task.title ?? '',
    dueDate: day(task.dueDate),
    daysLeft: task.daysLeft ?? null,
  }));
};

interface PreviewDto {
  amount?: number;
  withholdingPercent?: number;
  withholdingAmount?: number;
  finalAmount?: number;
  state?: { releasableFrom?: string | null } | null;
}

/** What releasing the held retention of an order would book; nothing is saved. */
export const previewRetentionRelease = async (
  purchaseOrderId: string
): Promise<RetentionPreview> => {
  const { data } = await http.post<ApiEnvelope<PreviewDto>>(PURCHASE_API.retentionReleasePreview, {
    purchaseOrder: purchaseOrderId,
  });
  return {
    amount: data.amount ?? 0,
    withholdingPercent: data.withholdingPercent ?? 0,
    withholdingAmount: data.withholdingAmount ?? 0,
    finalAmount: data.finalAmount ?? 0,
    releasableFrom: day(data.state?.releasableFrom),
  };
};

/**
 * Releases the retention: the service makes a verified, journaled bill. The signed final handover
 * is attached to that bill afterwards (kind OTHER), because the release call takes no file.
 */
export const releaseRetention = async (
  input: RetentionReleaseInput
): Promise<{ id: string; number: string }> => {
  const { data } = await http.post<ApiEnvelope<{ id: string; transactionNumber: string }>>(
    PURCHASE_API.retentionReleases,
    {
      purchaseOrder: input.purchaseOrderId,
      bastNumber: input.bastNumber.trim(),
      releaseDate: input.releaseDate,
      ...(input.memo.trim() ? { memo: input.memo.trim() } : {}),
    }
  );
  if (input.file) {
    await uploadAttachments('bill', data.id, [input.file], undefined, undefined, 'OTHER');
  }
  return { id: data.id, number: data.transactionNumber };
};
