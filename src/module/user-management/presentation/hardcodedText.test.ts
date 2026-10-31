const sources = import.meta.glob('./**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const files = Object.entries(sources).filter(
  ([path]) =>
    !path.endsWith('.test.ts') && !path.endsWith('.test.tsx') && !path.includes('.stories.')
);

const FORBIDDEN: Array<[string, RegExp]> = [
  ['literal placeholder text', /placeholder="[^"{]*[A-Za-z]{3}/],
  ['literal label text', /\blabel="[^"{]*[A-Za-z]{3}/],
  [
    'Indonesian sentence in JSX',
    />\s*(Pilih|Tambah|Simpan|Batal|Kembali|Ringkasan|Total|Rekening|Tanggal)\b/,
  ],
];

describe('user-management presentation text', () => {
  it.each(FORBIDDEN)('has no %s outside the locale files', (_label, pattern) => {
    const offenders = files.filter(([, source]) => pattern.test(source)).map(([path]) => path);

    expect(offenders).toEqual([]);
  });
});
