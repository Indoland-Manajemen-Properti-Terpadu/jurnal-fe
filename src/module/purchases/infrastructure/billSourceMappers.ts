import type {
  BillSourceDoc,
  BillSourceLine,
  BillTerm,
} from '@/module/purchases/domain/billSources';
import type {
  BillSourceDto,
  BillSourceLineDto,
} from '@/module/purchases/infrastructure/billSourceDto';
import { toDate, toDateOrNull, toParty } from '@/module/purchases/infrastructure/purchaseMappers';

const toSourceLine = (dto: BillSourceLineDto): BillSourceLine => ({
  purchaseOrderItemId: dto.purchaseOrderItem,
  description: dto.description ?? '',
  openQty: dto.open ?? 0,
  unitPrice: dto.unitPrice,
  taxRate: dto.taxRate ?? 0,
  schedule: dto.schedule
    ? {
        kind: dto.schedule.kind,
        seq: dto.schedule.seq ?? 1,
        of: dto.schedule.of ?? 1,
        periodFrom: toDateOrNull(dto.schedule.periodFrom),
        periodTo: toDateOrNull(dto.schedule.periodTo),
      }
    : null,
});

/** The structured term; older answers only had one text, split at the dot between name and note. */
const toBillTerm = (dto: BillSourceDto): BillTerm => {
  const [oldName = '', oldNote = ''] = (dto.termName ?? '').split(' · ');
  return {
    name: dto.term?.name ?? oldName,
    description: dto.term?.description ?? oldNote,
    dueDays: dto.term?.dueDays ?? null,
    dueBasis: dto.term?.dueBasis ?? '',
    hasDueTerm: dto.term?.hasDueTerm ?? false,
    dueText: dto.term?.dueText ?? '',
  };
};

export const toBillSource = (dto: BillSourceDto): BillSourceDoc => ({
  id: dto.id,
  number: dto.transactionNumber,
  date: toDate(dto.transactionDate),
  vendor: toParty(dto.vendor),
  kind: dto.kind ?? (dto.isService ? 'SERVICE' : null),
  orderId: dto.purchaseOrder?.id ?? '',
  orderNumber: dto.purchaseOrder?.transactionNumber ?? '',
  termKey: dto.termKey ?? '',
  termName: dto.termName ?? '',
  term: toBillTerm(dto),
  dueDate: dto.dueDate ? toDate(dto.dueDate) : null,
  isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
  lines: (dto.lines ?? []).map(toSourceLine),
  orderLines: (dto.orderLines ?? []).map(toSourceLine),
});
