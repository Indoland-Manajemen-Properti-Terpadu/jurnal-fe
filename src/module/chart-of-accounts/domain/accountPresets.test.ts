import { ACCOUNT_PRESETS, findPresetCategory } from './accountPresets';

const categories = [
  { id: 'a', categoryID: 'AH', name: 'Hutang' },
  { id: 'kb', categoryID: 'KB', name: 'Kas & Bank' },
  { id: 'pen', categoryID: 'PEN', name: 'Pendapatan' },
  { id: 'beb', categoryID: 'BEB', name: 'Beban Usaha' },
];

describe('findPresetCategory', () => {
  it('matches a category by code or name keyword', () => {
    expect(findPresetCategory('bank', categories)?.id).toBe('kb');
    expect(findPresetCategory('revenue', categories)?.id).toBe('pen');
    expect(findPresetCategory('expense', categories)?.id).toBe('beb');
  });

  it('returns undefined when nothing matches or the preset is unknown', () => {
    expect(findPresetCategory('receivable', categories.slice(0, 2))).toBeUndefined();
    expect(findPresetCategory('nope', categories)).toBeUndefined();
  });

  it('keeps the substring quirk: the short keyword "ap" also matches Pendapatan', () => {
    expect(findPresetCategory('receivable', categories)?.id).toBe('pen');
  });

  it('marks only the accumulated depreciation preset as contra', () => {
    const contra = Object.entries(ACCOUNT_PRESETS).filter(([, p]) => p.isContra);
    expect(contra.map(([k]) => k)).toEqual(['accumDepr']);
  });
});
