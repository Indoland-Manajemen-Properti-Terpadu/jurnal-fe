import { loadImportPreview, saveImportDraft } from './importDraftStorage';

describe('import draft storage', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the upload response under bankStatementData unchanged', () => {
    const body = { code: 200, data: { preview: [{ rowIndex: 1 }] } };
    saveImportDraft(body);
    expect(JSON.parse(localStorage.getItem('bankStatementData') as string)).toEqual(body);
  });

  it('reads the preview rows back', () => {
    saveImportDraft({ data: { preview: [{ rowIndex: 1 }, { rowIndex: 2 }] } });
    expect(loadImportPreview()?.map((r) => r.rowIndex)).toEqual([1, 2]);
  });

  it('returns null when nothing is stored and an empty list when there is no preview', () => {
    expect(loadImportPreview()).toBeNull();
    saveImportDraft({ code: 200 });
    expect(loadImportPreview()).toEqual([]);
  });

  it('returns null for unreadable data', () => {
    localStorage.setItem('bankStatementData', '{not json');
    expect(loadImportPreview()).toBeNull();
  });
});
