import type {
  AdvanceDocRef,
  OrderAdvanceMode,
  OrderAdvanceState,
  PurchaseOrder,
} from '@/module/purchases/domain/purchaseDocuments';

/** The steps an advance goes through, in order; a request-only advance has no bill steps. */
const BILL_STEPS = [
  'CREATE_BILL',
  'VERIFY_BILL',
  'CREATE_REQUEST',
  'APPROVE_REQUEST',
  'CREATE_VOUCHER',
  'PAY_VOUCHER',
  'PAID',
];
const REQUEST_STEPS = BILL_STEPS.filter((step) => !step.endsWith('_BILL'));

/** Where an advance stands on its route: the step's place, how many there are, and whether it is paid. */
export const advanceStepProgress = (
  mode: OrderAdvanceMode,
  step: string
): { index: number; total: number; done: boolean } => {
  const steps = mode === 'REQUEST' ? REQUEST_STEPS : BILL_STEPS;
  return {
    index: Math.max(0, steps.indexOf(step)),
    total: steps.length,
    done: step === 'PAID',
  };
};

/** A request-only advance can be cancelled only before any bill or payment history exists. */
export const canCancelAdvanceRequest = (
  advance: OrderAdvanceState,
  request: AdvanceDocRef
): boolean =>
  advance.mode === 'REQUEST' &&
  !advance.billed &&
  !advance.paid &&
  advance.bills.length === 0 &&
  request.status !== 'PAID' &&
  request.status !== 'CANCELLED';

/**
 * Why a receipt (FPB / BAPP) cannot be recorded yet: the service holds it until the advance invoice
 * is paid. Null means nothing blocks it; an empty text means blocked with no reason given.
 */
export const receiptBlockReason = (order: PurchaseOrder): string | null => {
  const state = order.advanceState;
  if (!state || state.receiptAllowed) return null;
  return state.receiptBlockReason ?? '';
};
