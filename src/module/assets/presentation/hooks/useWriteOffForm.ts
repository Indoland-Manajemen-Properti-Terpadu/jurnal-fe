import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { t } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import type { WriteOffDraft, WriteOffSignature } from '@/module/assets/domain/writeOff';
import {
  canBeFullyDepreciated,
  documentTitleKey,
  receivedAmount,
  validateWriteOffDraft,
  writeOffChecklist,
  type WriteOffField,
} from '@/module/assets/domain/writeOffRules';
import type { WriteOffSheetModel } from '@/module/assets/presentation/components/WriteOffSheet';
import { useDisposalPreview } from '@/module/assets/presentation/hooks/useAssetQueries';

const EMPTY_DRAFT: WriteOffDraft = {
  type: null,
  incidentDate: '',
  description: '',
  hasProceeds: false,
  proceedsAmount: 0,
  proceedsAccount: '',
  gainLossAccount: '',
  evidence: [],
  signature: null,
};

const isImage = (file: File) => file.type.startsWith('image/');

/** State, checks and the live document of the report form for one asset. */
export const useWriteOffForm = (asset: AssetItem, submitterName: string) => {
  const [today] = useState(() => dayjs().format('YYYY-MM-DD'));
  // The incident usually happened today; an asset acquired after today has no valid date yet.
  const [draft, setDraft] = useState<WriteOffDraft>(() => ({
    ...EMPTY_DRAFT,
    incidentDate: asset.acquisitionDate <= today ? today : '',
  }));
  const [touched, setTouched] = useState<Set<WriteOffField>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const ctx = useMemo(
    () => ({ today, acquisitionDate: asset.acquisitionDate }),
    [today, asset.acquisitionDate]
  );

  const set = <K extends keyof WriteOffDraft>(key: K, value: WriteOffDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setTouched((current) => new Set(current).add(key as WriteOffField));
  };

  const allErrors = validateWriteOffDraft(draft, ctx);
  // A field shows its error once the user has worked on it, or after a submit attempt.
  const errors = Object.fromEntries(
    Object.entries(allErrors).filter(([key]) => showAll || touched.has(key as WriteOffField))
  ) as Partial<Record<WriteOffField, string>>;
  const checklist = writeOffChecklist(draft, ctx);
  const ready = checklist.every((row) => row.done);

  const received = receivedAmount(draft);
  const dateReady = Boolean(draft.incidentDate) && !allErrors.incidentDate;
  const preview = useDisposalPreview(asset.id, dateReady ? draft.incidentDate : '', received);
  const bookValue = preview.data?.bookValue ?? asset.netBookValue;
  const fullyDepreciatedAllowed = canBeFullyDepreciated(bookValue, asset.residualValue);

  const evidenceUrls = useMemo(
    () => draft.evidence.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)),
    [draft.evidence]
  );
  const signatureUrl = useMemo(
    () => (draft.signature ? URL.createObjectURL(draft.signature) : null),
    [draft.signature]
  );
  useEffect(
    () => () => evidenceUrls.forEach((url) => url && URL.revokeObjectURL(url)),
    [evidenceUrls]
  );
  useEffect(
    () => () => {
      if (signatureUrl) URL.revokeObjectURL(signatureUrl);
    },
    [signatureUrl]
  );

  const tr = (key: string) => t(key, undefined, 'assetWriteOffs');

  const signatures: WriteOffSignature[] = [
    {
      title: tr('signSubmitter'),
      name: submitterName || null,
      role: tr('roleSubmitter'),
      signedAt: draft.signature ? today : null,
      state: draft.signature ? 'signed' : 'waiting',
      imageUrl: signatureUrl,
      note: null,
    },
    {
      title: tr('signApprover'),
      name: null,
      role: tr('roleApprover'),
      signedAt: null,
      state: 'waiting',
      imageUrl: null,
      note: null,
    },
  ];

  const previewModel: WriteOffSheetModel = {
    titleKey: draft.type ? documentTitleKey(draft.type) : 'docTitleDraft',
    number: null,
    status: null,
    snapshot: {
      code: asset.code,
      name: asset.name,
      categoryName: asset.categoryName,
      location: asset.location,
      brand: asset.brand,
      modelType: asset.modelType,
      serialNumber: asset.serialNumber,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
    },
    incidentDate: draft.incidentDate,
    description: draft.description,
    figures: preview.data
      ? {
          bookValue: preview.data.bookValue,
          catchUp: preview.data.catchUpDepreciation,
          received,
          gainLoss: preview.data.gainLoss,
          estimate: true,
        }
      : null,
    figuresLoading: preview.isFetching || preview.waiting,
    attachments: draft.evidence.map((file, index) => ({
      name: file.name,
      url: evidenceUrls[index],
      isImage: isImage(file),
    })),
    signatures,
  };

  return {
    draft,
    set,
    today,
    ctx,
    errors,
    allErrors,
    checklist,
    ready,
    previewModel,
    fullyDepreciatedAllowed,
    revealErrors: () => setShowAll(true),
    isDirty: () => touched.size > 0,
  };
};
