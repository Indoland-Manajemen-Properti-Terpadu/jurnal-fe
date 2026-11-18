import dayjs from 'dayjs';
import type { WriteOffDraft, WriteOffType } from '@/module/assets/domain/writeOff';

/** Limits the API enforces on a write-off report. */
export const WRITE_OFF_LIMITS = {
  descriptionMin: 10,
  descriptionMax: 5000,
  maxFiles: 5,
  maxFileBytes: 10 * 1024 * 1024,
  evidenceMime: ['image/jpeg', 'image/png', 'application/pdf'],
  signatureMime: ['image/png', 'image/jpeg'],
  rejectReasonMin: 3,
} as const;

export type WriteOffField =
  | 'type'
  | 'incidentDate'
  | 'description'
  | 'proceedsAmount'
  | 'proceedsAccount'
  | 'evidence'
  | 'signature';

export interface WriteOffContext {
  /** `YYYY-MM-DD` */
  today: string;
  /** `YYYY-MM-DD` */
  acquisitionDate: string;
  /** False when the book value on the incident date is still above the residual value. */
  fullyDepreciatedAllowed?: boolean;
}

/** A sale cannot be filed without its price. */
export const proceedsRequired = (type: WriteOffType | null) => type === 'sold';

/** Money can come in for every type except an asset that simply ran out of value. */
export const proceedsAllowed = (type: WriteOffType | null) =>
  type !== null && type !== 'fully_depreciated';

/** A lost asset has nothing to photograph. */
export const evidenceRequired = (type: WriteOffType | null) => type !== 'lost';

/** "Fully depreciated" only fits once the book value has reached the residual value. */
export const canBeFullyDepreciated = (bookValue: number, residualValue: number) =>
  bookValue <= residualValue;

/** Dates an incident can have; null when the asset was acquired after today. */
export const incidentDateBounds = (
  acquisitionDate: string,
  today: string
): { min: string; max: string } | null =>
  acquisitionDate > today ? null : { min: acquisitionDate, max: today };

/** Money the report sends: zero unless it is a sale or the user said money came in. */
export const receivedAmount = (draft: WriteOffDraft) =>
  proceedsRequired(draft.type) || (draft.hasProceeds && proceedsAllowed(draft.type))
    ? draft.proceedsAmount
    : 0;

const descriptionError = (description: string) => {
  const { length } = description.trim();
  if (length < WRITE_OFF_LIMITS.descriptionMin) return 'errDescriptionShort';
  if (length > WRITE_OFF_LIMITS.descriptionMax) return 'errDescriptionLong';
  return null;
};

const dateInRange = (date: string, ctx: WriteOffContext) => {
  const bounds = incidentDateBounds(ctx.acquisitionDate, ctx.today);
  return Boolean(date) && bounds !== null && date >= bounds.min && date <= bounds.max;
};

/** Field errors as i18n keys of the `assetWriteOffs` namespace; empty when the draft can be filed. */
export const validateWriteOffDraft = (
  draft: WriteOffDraft,
  ctx: WriteOffContext
): Partial<Record<WriteOffField, string>> => {
  const errors: Partial<Record<WriteOffField, string>> = {};
  if (!draft.type) {
    errors.type = 'errType';
  } else if (draft.type === 'fully_depreciated' && ctx.fullyDepreciatedAllowed === false) {
    errors.type = 'errFullyDepreciatedBlocked';
  }
  if (!dateInRange(draft.incidentDate, ctx)) errors.incidentDate = 'errDateRange';
  const description = descriptionError(draft.description);
  if (description) errors.description = description;

  const amount = receivedAmount(draft);
  if (proceedsRequired(draft.type) && amount <= 0) errors.proceedsAmount = 'errPriceRequired';
  if (amount > 0 && !draft.proceedsAccount) errors.proceedsAccount = 'errProceedsAccount';

  if (draft.evidence.length > WRITE_OFF_LIMITS.maxFiles) errors.evidence = 'errEvidenceTooMany';
  else if (evidenceRequired(draft.type) && draft.evidence.length === 0) {
    errors.evidence = 'errEvidenceRequired';
  }

  if (!draft.signature) errors.signature = 'errSignatureRequired';
  return errors;
};

/** What is still missing before the report can be filed, in the order of the form. */
export const writeOffChecklist = (
  draft: WriteOffDraft,
  ctx: WriteOffContext
): { key: WriteOffField; done: boolean }[] => {
  const errors = validateWriteOffDraft(draft, ctx);
  const keys: WriteOffField[] = ['type', 'incidentDate', 'description'];
  if (proceedsRequired(draft.type)) keys.push('proceedsAmount', 'proceedsAccount');
  else if (draft.hasProceeds && proceedsAllowed(draft.type)) keys.push('proceedsAccount');
  if (evidenceRequired(draft.type)) keys.push('evidence');
  keys.push('signature');
  return keys.map((key) => ({ key, done: !errors[key] }));
};

/** Error key for a file that cannot be evidence, or null. */
export const validateEvidenceFile = (file: { type: string; size: number }) => {
  if (!(WRITE_OFF_LIMITS.evidenceMime as readonly string[]).includes(file.type)) {
    return 'errFileType';
  }
  if (file.size > WRITE_OFF_LIMITS.maxFileBytes) return 'errFileSize';
  return null;
};

/** Label of a disposed asset; disposals made before the reports existed have no type. */
export const disposalTypeLabelKey = (type: WriteOffType | null, price: number) => {
  if (type) return `type_${type}`;
  return price > 0 ? 'legacySold' : 'legacyDisposed';
};

export const documentTitleKey = (type: WriteOffType) => `docTitle_${type}`;

/** `YYYY-MM` of the last month that has ended; depreciation is booked up to it. */
export const lastClosedMonth = (today: string) =>
  dayjs(today).subtract(1, 'month').format('YYYY-MM');

/**
 * The person who filed a report never decides it, whatever the API says: the approval has to
 * come from someone else. Until the signed-in user is known nobody is offered the decision.
 */
export const separateDuties = <T extends { canDecide: boolean; createdBy: { id: string } }>(
  report: T,
  userId: string | undefined
): T => ({
  ...report,
  canDecide: Boolean(userId) && report.canDecide && report.createdBy.id !== userId,
});
