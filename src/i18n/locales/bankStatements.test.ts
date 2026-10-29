import { bankStatements as en } from './en/bankStatements';
import { bankStatements as id } from './id/bankStatements';

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      acc[path] = value;
    } else {
      Object.assign(acc, flatten(value, path));
    }
    return acc;
  }, {});

const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort();

describe('bankStatements i18n namespace', () => {
  const idFlat = flatten(id as Tree);
  const enFlat = flatten(en as Tree);

  it('has the same keys in id and en', () => {
    expect(Object.keys(enFlat).sort()).toEqual(Object.keys(idFlat).sort());
  });

  it('has no empty values', () => {
    const empty = [...Object.entries(idFlat), ...Object.entries(enFlat)].filter(
      ([, value]) => value.trim() === ''
    );
    expect(empty).toEqual([]);
  });

  it('uses the same interpolation placeholders in id and en', () => {
    Object.keys(idFlat).forEach((key) => {
      expect(placeholders(enFlat[key])).toEqual(placeholders(idFlat[key]));
    });
  });
});
