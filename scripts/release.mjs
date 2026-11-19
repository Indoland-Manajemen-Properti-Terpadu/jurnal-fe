import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { latestTag, nextVersion, releaseNotes } from './lib/releaseVersion.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const [repository, sha] = args.filter((arg) => !arg.startsWith('--'));
if (!repository || !sha) {
  console.error('usage: node scripts/release.mjs <owner/repo> <sha> [--dry-run]');
  process.exit(2);
}

const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();

const lastTag = latestTag(git('tag', '--list', 'v*').split('\n'));
if (!lastTag) {
  console.error('::error::No vMAJOR.MINOR.PATCH tag found; create the first release by hand.');
  process.exit(1);
}

// A rerun of the same deploy must not make a second release.
if (git('rev-list', '-n', '1', lastTag) === git('rev-parse', sha)) {
  console.log(`${lastTag} already points at ${sha}; nothing to release.`);
  process.exit(0);
}

// \x1f separates fields and \x1e commits, so subjects and bodies can hold any text.
const log = git('log', '--no-merges', '--format=%s%x1f%b%x1e', `${lastTag}..${sha}`);
const commits = log
  .split('\x1e')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [subject, body = ''] = entry.split('\x1f');
    return { subject: subject.trim(), body: body.trim() };
  });

const next = nextVersion(lastTag, commits);
if (!next) {
  console.log(`No new work since ${lastTag}; nothing to release.`);
  process.exit(0);
}

const repoUrl = `https://github.com/${repository}`;
const notes = releaseNotes({ commits: next.commits, lastTag, tag: next.tag, repoUrl });
console.log(
  `${lastTag} -> ${next.tag} (${next.level}, ${next.commits.length} commits)\n\n${notes}`
);
if (dryRun) process.exit(0);

const notesFile = join(mkdtempSync(join(tmpdir(), 'release-')), 'notes.md');
writeFileSync(notesFile, notes);
git('tag', '-a', next.tag, sha, '-m', next.tag);
git('push', 'origin', next.tag);
execFileSync(
  'gh',
  [
    'release',
    'create',
    next.tag,
    '--title',
    next.tag,
    '--notes-file',
    notesFile,
    '--latest',
    '--verify-tag',
  ],
  { stdio: 'inherit' }
);
