import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { cssVariablesResolver, jurnalCssVariables } from './cssVariables';
import { myTheme } from './mantineTheme';

const SRC_DIR = join(process.cwd(), 'src');

const sourceFiles = (readdirSync(SRC_DIR, { recursive: true }) as string[]).filter((file) =>
  /\.(css|ts|tsx)$/.test(file)
);

const readSource = (file: string) => readFileSync(join(SRC_DIR, file), 'utf8');

describe('cssVariablesResolver', () => {
  const resolved = cssVariablesResolver(mergeMantineTheme(DEFAULT_THEME, myTheme));

  it('emits the generated variables on :root regardless of colour scheme', () => {
    expect(resolved.variables).toEqual(jurnalCssVariables);
    expect(resolved.light).toEqual({});
    expect(resolved.dark).toEqual({});
  });

  it('defines every --jurnal-* variable referenced in src', () => {
    const used = new Set(
      sourceFiles.flatMap((file) =>
        [...readSource(file).matchAll(/var\((--jurnal-[a-z0-9-]+)/g)].map((match) => match[1])
      )
    );

    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((name) => !(name in resolved.variables))).toEqual([]);
  });

  it('is the only place a --jurnal-* variable is declared', () => {
    const declaring = sourceFiles
      .filter((file) => file.endsWith('.css'))
      .filter((file) => /--jurnal-[a-z0-9-]+\s*:/.test(readSource(file)));

    expect(declaring).toEqual([]);
  });

  it('keeps the values that existing styles rely on', () => {
    expect(resolved.variables).toMatchObject({
      '--jurnal-font-family': 'Figtree, sans-serif',
      '--jurnal-color-primary': '#053079',
      '--jurnal-color-secondary': '#09B2FF',
      '--jurnal-color-surface': '#ffffff',
      '--jurnal-color-surface-muted': '#f3f4f6',
      '--jurnal-color-bg-subtle': '#f9fafb',
      '--jurnal-color-border-muted': '#e5e7eb',
      '--jurnal-color-text-primary': '#111827',
      '--jurnal-color-success': '#22c55e',
      '--jurnal-color-danger': '#ef4444',
      '--jurnal-color-info': '#0ea5e9',
      '--jurnal-gradient-brand': 'linear-gradient(90deg, #053079, #056b99)',
      '--jurnal-text-sm': '0.875rem',
      '--jurnal-spacing-sm': '0.75rem',
      '--jurnal-spacing-base': '1rem',
      '--jurnal-spacing-md': '1.25rem',
      '--jurnal-radius-md': '0.25rem',
      '--jurnal-radius-lg': '0.5rem',
      '--jurnal-radius-2xl': '1rem',
      '--jurnal-space-4': '1rem',
    });
  });
});
