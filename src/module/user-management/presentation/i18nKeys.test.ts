import { userManagement as id } from '@/i18n/locales/id/userManagement';

const sources = import.meta.glob('./**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

type Tree = { [key: string]: string | Tree };

const has = (tree: Tree, key: string): boolean => {
  const value = key
    .split('.')
    .reduce<
      string | Tree | undefined
    >((node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree);
  return typeof value === 'string';
};

describe('user-management presentation translations', () => {
  it('only asks for keys that exist in the userManagement namespace', () => {
    const missing: string[] = [];
    Object.entries(sources)
      .filter(([path]) => !path.includes('.test.'))
      // A page that also reads the settings namespace has its own `t`; only its `tu`-style calls are ours.
      .filter(([, source]) => !source.includes("useTranslation('settings')"))
      .forEach(([path, source]) => {
        [...source.matchAll(/\bt\(\s*'([A-Za-z0-9_.]+)'/g)].forEach(([, key]) => {
          if (!has(id as Tree, key)) missing.push(`${path}: ${key}`);
        });
      });

    expect(missing).toEqual([]);
  });
});
