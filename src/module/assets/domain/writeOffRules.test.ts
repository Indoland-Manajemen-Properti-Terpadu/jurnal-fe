import { describe, expect, it } from 'vitest';
import type { WriteOffDraft } from '@/module/assets/domain/writeOff';
import {
  canBeFullyDepreciated,
  disposalTypeLabelKey,
  documentTitleKey,
  incidentDateBounds,
  lastClosedMonth,
  validateEvidenceFile,
  validateWriteOffDraft,
  writeOffChecklist,
} from '@/module/assets/domain/writeOffRules';

const ctx = { today: '2026-11-17', acquisitionDate: '2026-04-02' };
const file = (name = 'bukti.png', type = 'image/png') => new File(['x'], name, { type });
const signature = new Blob(['sig'], { type: 'image/png' });

const draft = (patch: Partial<WriteOffDraft> = {}): WriteOffDraft => ({
  type: 'scrapped',
  incidentDate: '2026-11-10',
  description: 'Unit rusak dan tidak bisa diperbaiki lagi.',
  hasProceeds: false,
  proceedsAmount: 0,
  proceedsAccount: '',
  gainLossAccount: '',
  evidence: [file()],
  signature,
  ...patch,
});

const empty: WriteOffDraft = {
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

describe('validateWriteOffDraft', () => {
  it('reports every missing piece of an empty draft', () => {
    const errors = validateWriteOffDraft(empty, ctx);
    expect(errors.type).toBe('errType');
    expect(errors.incidentDate).toBe('errDateRange');
    expect(errors.description).toBe('errDescriptionShort');
    expect(errors.signature).toBe('errSignatureRequired');
  });

  it('accepts a complete scrapped draft', () => {
    expect(validateWriteOffDraft(draft(), ctx)).toEqual({});
  });

  it('needs a price and a receiving account for a sale', () => {
    expect(validateWriteOffDraft(draft({ type: 'sold' }), ctx).proceedsAmount).toBe(
      'errPriceRequired'
    );
    expect(
      validateWriteOffDraft(draft({ type: 'sold', proceedsAmount: 8_000_000 }), ctx).proceedsAccount
    ).toBe('errProceedsAccount');
  });

  it('only checks money for other types when the user says money came in', () => {
    expect(validateWriteOffDraft(draft({ type: 'damaged' }), ctx)).toEqual({});
    expect(
      validateWriteOffDraft(
        draft({ type: 'damaged', hasProceeds: true, proceedsAmount: 500_000 }),
        ctx
      ).proceedsAccount
    ).toBe('errProceedsAccount');
  });

  it('does not ask for evidence of a lost asset and caps the files at five', () => {
    expect(validateWriteOffDraft(draft({ type: 'lost', evidence: [] }), ctx)).toEqual({});
    expect(validateWriteOffDraft(draft({ evidence: [] }), ctx).evidence).toBe(
      'errEvidenceRequired'
    );
    const six = Array.from({ length: 6 }, () => file());
    expect(validateWriteOffDraft(draft({ evidence: six }), ctx).evidence).toBe(
      'errEvidenceTooMany'
    );
  });

  it('checks the length of the chronology', () => {
    expect(validateWriteOffDraft(draft({ description: 'a'.repeat(9) }), ctx).description).toBe(
      'errDescriptionShort'
    );
    expect(validateWriteOffDraft(draft({ description: 'a'.repeat(5001) }), ctx).description).toBe(
      'errDescriptionLong'
    );
  });

  it('keeps the incident date between the acquisition date and today', () => {
    expect(validateWriteOffDraft(draft({ incidentDate: '2026-11-18' }), ctx).incidentDate).toBe(
      'errDateRange'
    );
    expect(validateWriteOffDraft(draft({ incidentDate: '2026-03-01' }), ctx).incidentDate).toBe(
      'errDateRange'
    );
  });
});

describe('incidentDateBounds', () => {
  it('returns the window, or null when the asset is acquired after today', () => {
    expect(incidentDateBounds('2026-04-02', '2026-11-17')).toEqual({
      min: '2026-04-02',
      max: '2026-11-17',
    });
    expect(incidentDateBounds('2026-11-30', '2026-11-17')).toBeNull();
  });
});

describe('canBeFullyDepreciated', () => {
  it('needs the book value at or below the residual value', () => {
    expect(canBeFullyDepreciated(3_843_750, 0)).toBe(false);
    expect(canBeFullyDepreciated(2_000_000, 2_000_000)).toBe(true);
  });
});

describe('validateEvidenceFile', () => {
  it('rejects other file types and files above 10 MB', () => {
    expect(validateEvidenceFile({ type: 'text/plain', size: 3 })).toBe('errFileType');
    expect(validateEvidenceFile({ type: 'image/png', size: 10 * 1024 * 1024 + 1 })).toBe(
      'errFileSize'
    );
    expect(validateEvidenceFile({ type: 'application/pdf', size: 1000 })).toBeNull();
  });
});

describe('labels', () => {
  it('names old disposals without a type by their price', () => {
    expect(disposalTypeLabelKey(null, 9_000_000)).toBe('legacySold');
    expect(disposalTypeLabelKey(null, 0)).toBe('legacyDisposed');
    expect(disposalTypeLabelKey('scrapped', 0)).toBe('type_scrapped');
  });

  it('titles the document by its type', () => {
    expect(documentTitleKey('damaged')).toBe('docTitle_damaged');
  });
});

describe('lastClosedMonth', () => {
  it('is the month before today', () => {
    expect(lastClosedMonth('2026-11-17')).toBe('2026-10');
    expect(lastClosedMonth('2026-01-05')).toBe('2025-12');
  });
});

describe('writeOffChecklist', () => {
  it('leaves out evidence for a lost asset and adds money rows for a sale', () => {
    const lost = writeOffChecklist(draft({ type: 'lost' }), ctx).map((row) => row.key);
    expect(lost).not.toContain('evidence');
    const sold = writeOffChecklist(draft({ type: 'sold' }), ctx).map((row) => row.key);
    expect(sold).toEqual(
      expect.arrayContaining(['proceedsAmount', 'proceedsAccount', 'evidence', 'signature'])
    );
  });

  it('ticks what is done', () => {
    const rows = writeOffChecklist(draft({ signature: null }), ctx);
    expect(rows.find((row) => row.key === 'signature')?.done).toBe(false);
    expect(rows.find((row) => row.key === 'description')?.done).toBe(true);
  });
});
