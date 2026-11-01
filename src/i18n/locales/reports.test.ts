import {
  reportCatalogData,
  reportCategories,
} from '@/module/reports/presentation/components/catalog/reportCatalogData';
import { reports as en } from './en/reports';
import { reports as id } from './id/reports';

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

describe('reports i18n namespace', () => {
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

  it('defines every key the report catalog refers to', () => {
    const keys = [
      ...reportCategories.map((category) => category.labelKey),
      ...reportCatalogData.flatMap((item) => [
        item.titleKey,
        item.englishTitleKey,
        item.descriptionKey,
        ...(item.badgeKey ? [item.badgeKey] : []),
      ]),
    ];

    expect(keys.filter((key) => !(key in idFlat))).toEqual([]);
  });
});
