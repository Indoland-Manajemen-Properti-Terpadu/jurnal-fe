import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MANTINE_SHADES, palette, themeColors } from './tokens';

const HEX = /#[0-9a-f]{3,8}\b/i;

describe('palette', () => {
  it.each(Object.keys(palette) as Array<keyof typeof palette>)(
    '%s maps to a dense 10-step Mantine tuple matching its shade keys',
    (name) => {
      const tuple = themeColors[name];
      expect(tuple).toHaveLength(10);
      expect(Object.keys(tuple)).toHaveLength(10);
      MANTINE_SHADES.forEach((shade, index) => {
        expect(tuple[index]).toBe(palette[name][shade]);
      });
      Object.values(palette[name]).forEach((value) => expect(value).toMatch(HEX));
    }
  );

  it('keeps the brand colours at shade 6', () => {
    expect(themeColors.primary[6]).toBe('#053079');
    expect(themeColors.secondary[6]).toBe('#09B2FF');
  });
});

describe('hex colour literals', () => {
  it('appear only in palette.ts and colors.ts', () => {
    const themeDir = join(process.cwd(), 'src/theme');
    const allowed = new Set(['tokens/palette.ts', 'tokens/colors.ts']);
    const offenders = (readdirSync(themeDir, { recursive: true }) as string[])
      .filter((file) => /\.(ts|css)$/.test(file) && !file.endsWith('.test.ts'))
      .filter((file) => !allowed.has(file))
      .filter((file) => HEX.test(readFileSync(join(themeDir, file), 'utf8')));

    expect(offenders).toEqual([]);
  });
});
