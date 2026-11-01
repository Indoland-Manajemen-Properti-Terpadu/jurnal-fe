import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { breakpoints } from './tokens';

type PostcssConfig = {
  plugins: { 'postcss-simple-vars': { variables: Record<string, string> } };
};

const postcssConfig = createRequire(import.meta.url)(
  join(process.cwd(), 'postcss.config.cjs')
) as PostcssConfig;

describe('breakpoints', () => {
  it('equal the $mantine-breakpoint-* values in postcss.config.cjs', () => {
    const fromPostcss = Object.fromEntries(
      Object.entries(postcssConfig.plugins['postcss-simple-vars'].variables).map(
        ([name, value]) => [name.replace('mantine-breakpoint-', ''), value]
      )
    );

    expect(fromPostcss).toEqual(breakpoints);
  });
});
