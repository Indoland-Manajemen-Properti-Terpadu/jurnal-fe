// Allowed source branch per deploy branch. Branch protection cannot express this, so the deploy
// workflow checks it: a deploy is allowed only when the pushed commit belongs to a merged PR whose
// base is the deploy branch and whose head is one of the sources below.
const ALLOWED_HEADS = {
  'main-frontend': (head) => head === 'staging' || head.startsWith('hotfix/'),
  // main-frontend is the hotfix back-merge into staging (docs/branching-and-release.md).
  staging: (head) =>
    head === 'develop-frontend' || head === 'main-frontend' || head.startsWith('hotfix/'),
};

export function isAllowedPromotion(branch, pullRequests) {
  const headAllowed = ALLOWED_HEADS[branch];
  if (!headAllowed) return false;
  return pullRequests.some(
    (pr) => pr.merged_at != null && pr.base === branch && headAllowed(pr.head)
  );
}
