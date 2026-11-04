import { tagNames } from './journalTags';

describe('tagNames', () => {
  it('reads the name of every tag object', () => {
    expect(
      tagNames([
        { id: '1', name: 'Proyek A' },
        { id: '2', name: 'Audit', color: '#fff' },
      ])
    ).toEqual(['Proyek A', 'Audit']);
  });

  it('accepts a list of strings and a single string', () => {
    expect(tagNames(['a', 'b'])).toEqual(['a', 'b']);
    expect(tagNames('Proyek A')).toEqual(['Proyek A']);
  });

  it('is empty for no tag: [], "-", blanks, null and undefined', () => {
    expect(tagNames([])).toEqual([]);
    expect(tagNames('-')).toEqual([]);
    expect(tagNames(['  ', '-', { id: '1' }])).toEqual([]);
    expect(tagNames(null)).toEqual([]);
    expect(tagNames(undefined)).toEqual([]);
  });
});
