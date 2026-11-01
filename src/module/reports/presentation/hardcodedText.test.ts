const sources = import.meta.glob('./**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const files = Object.entries(sources).filter(([path]) => !path.endsWith('.test.ts'));

const FORBIDDEN: Array<[string, RegExp]> = [
  ['literal placeholder text', /placeholder="[^"{]*[A-Za-z]{3}/],
  ['Indonesian search or empty-state copy', /`?(Cari |Tidak ada |Tidak Seimbang|telah diunduh)/],
  ['literal aria-label sentence', /aria-label=\{`[A-Za-z]/],
];

describe('report presentation text', () => {
  it.each(FORBIDDEN)('has no %s outside the reports locale files', (_label, pattern) => {
    const offenders = files.filter(([, source]) => pattern.test(source)).map(([path]) => path);

    expect(offenders).toEqual([]);
  });
});
