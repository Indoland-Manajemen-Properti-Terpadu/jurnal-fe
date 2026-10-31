import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..');
const SKIP_DIRS = new Set(['theme', 'i18n', 'assets']);

const collect = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) && dir === SRC ? [] : collect(path);
    return /\.(ts|tsx|css)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
  });

const files = collect(SRC).map((path) => ({
  name: relative(SRC, path),
  source: readFileSync(path, 'utf8'),
}));

const RULES: Array<[string, RegExp]> = [
  [
    'hex colour literal (use a --mantine-color-* or --jurnal-color-* variable)',
    /(?<![&\w#])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/,
  ],
  ['rgb()/rgba() literal (use color-mix() over a colour variable)', /\brgba?\(\s*\d/],
  [
    'px font size (use a --jurnal-text-* token or a Mantine size name)',
    /font-size:\s*[0-9.]+px|fontSize:\s*'?[0-9.]+(px)?'?\s*[,}]/,
  ],
];

describe('no hard-coded colours or font sizes outside src/theme', () => {
  it.each(RULES)('has no %s', (_label, pattern) => {
    const offenders = files.filter(({ source }) => pattern.test(source)).map(({ name }) => name);

    expect(offenders).toEqual([]);
  });
});
