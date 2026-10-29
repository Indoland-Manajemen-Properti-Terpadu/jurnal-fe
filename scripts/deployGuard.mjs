import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { isAllowedPromotion } from './lib/deployGuard.mjs';

const [branch, sha, repository] = process.argv.slice(2);
if (!branch || !sha || !repository) {
  console.error('usage: node scripts/deployGuard.mjs <branch> <sha> <owner/repo>');
  process.exit(2);
}

const ATTEMPTS = 5;
const DELAY_MS = 6000;

// The commit-to-PR association can lag right after a merge, so an empty answer is retried.
async function findPullRequests() {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const out = execFileSync(
      'gh',
      [
        'api',
        `repos/${repository}/commits/${sha}/pulls`,
        '--jq',
        '[.[] | {base: .base.ref, head: .head.ref, merged_at: .merged_at}]',
      ],
      { encoding: 'utf8' }
    );
    const pullRequests = JSON.parse(out);
    if (pullRequests.length > 0 || attempt === ATTEMPTS) return pullRequests;
    console.log(`No PR associated with ${sha} yet (attempt ${attempt}/${ATTEMPTS}); retrying`);
    await sleep(DELAY_MS);
  }
  return [];
}

const pullRequests = await findPullRequests();
console.log(`Pull requests for ${sha}: ${JSON.stringify(pullRequests)}`);

if (!isAllowedPromotion(branch, pullRequests)) {
  console.error(
    `::error::${branch} accepts only merged PRs from the allowed source branches (see docs/branching-and-release.md).`
  );
  process.exit(1);
}
console.log(`Promotion into ${branch} allowed.`);
