import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { compareToBaseline, countByRule, parseEslintOutput } from './lib/ratchet.mjs';

const BASELINE_PATH = 'docs/migration/eslint-baseline.json';
const writeBaseline = process.argv.includes('--write-baseline');

const run = spawnSync('npx', ['eslint', '.', '--ext', '.ts,.tsx', '-f', 'json'], {
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});

// ESLint exits 0 (clean) or 1 (lint errors). Anything else is a crash and must fail loudly.
if (run.status === null || run.status > 1) {
  console.error(`eslint crashed (exit ${run.status}):\n${run.stderr}`);
  process.exit(2);
}

let current;
try {
  current = countByRule(parseEslintOutput(run.stdout));
} catch (error) {
  console.error(`eslint ratchet: ${error.message}\n${run.stderr}`);
  process.exit(2);
}

const sorted = (counts) =>
  Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));

if (writeBaseline) {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(sorted(current), null, 2)}\n`);
  console.log(`eslint ratchet: baseline written to ${BASELINE_PATH}`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
const { regressions, improvements } = compareToBaseline(current, baseline);

for (const { rule, baseline: before, current: now } of improvements) {
  console.log(`improved  ${rule}: ${before} -> ${now} (run with --write-baseline to lock it in)`);
}
for (const { rule, baseline: before, current: now } of regressions) {
  console.error(`REGRESSED ${rule}: ${before} -> ${now}`);
}
if (regressions.length > 0) {
  console.error('eslint ratchet: fix the new violations; the baseline may only go down');
  process.exit(1);
}
console.log('eslint ratchet: no regressions');
