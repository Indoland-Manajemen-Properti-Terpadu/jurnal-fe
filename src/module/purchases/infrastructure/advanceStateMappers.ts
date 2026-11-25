import type { AdvanceDocRef, OrderAdvanceState } from '@/module/purchases/domain/purchaseDocuments';
import type { AdvanceDocDto, AdvanceStateDto } from '@/module/purchases/infrastructure/purchaseDto';

const toAdvanceDocs = (docs: AdvanceDocDto[] | null | undefined): AdvanceDocRef[] =>
  (docs ?? []).map((doc) => ({
    id: doc.id,
    number: doc.transactionNumber ?? '',
    status: doc.status ?? '',
  }));

export const toAdvanceState = (
  dto: AdvanceStateDto | null | undefined
): OrderAdvanceState | null =>
  dto
    ? {
        mode: dto.mode === 'REQUEST' ? 'REQUEST' : 'BILL',
        amount: dto.amount ?? 0,
        paidAmount: dto.paidAmount ?? 0,
        billed: dto.billed === true,
        paid: dto.paid === true,
        postedAmount: dto.postedAmount ?? 0,
        recognizedAmount: dto.recognizedAmount ?? 0,
        heldAmount: dto.heldAmount ?? 0,
        step: dto.step ?? '',
        stepLabel: dto.stepLabel ?? '',
        canCreateBill: dto.canCreateBill === true,
        // A missing flag must not block a receipt the service would accept.
        receiptAllowed: dto.receiptAllowed !== false,
        receiptBlockReason: dto.receiptBlockReason ?? null,
        bills: toAdvanceDocs(dto.bills),
        paymentRequests: toAdvanceDocs(dto.paymentRequests),
        paymentVouchers: toAdvanceDocs(dto.paymentVouchers),
      }
    : null;
