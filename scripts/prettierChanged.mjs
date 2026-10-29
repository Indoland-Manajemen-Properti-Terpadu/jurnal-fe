import { execFileSync } from 'node:child_process';

const baseRef = process.argv[2] ?? 'origin/develop-frontend';

const changed = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`, '--', '*.ts', '*.tsx'],
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(Boolean);

if (changed.length === 0) {
  console.log('prettier:changed: no changed files');
  process.exit(0);
}

try {
  execFileSync('npx', ['prettier', '--check', ...changed], { stdio: 'inherit' });
} catch {
  console.error('prettier:changed: run `npx prettier --write` on the files listed above');
  process.exit(1);
}
