# Branch protection as code

These files are the exact payloads applied to the three protected branches on 2026-10-29 (classic branch protection; the repository is public, which makes the feature available on the Free plan).

| File | Branch | Approvals | Notes |
|---|---|---|---|
| `main-frontend.json` | `main-frontend` (production) | 1 | A push here deploys to production |
| `staging.json` | `staging` | 0 | Pre-production soak |
| `develop-frontend.json` | `develop-frontend` | 0 | Integration branch |

All three: pull request required, admins included, no force pushes, no deletions, conversations must be resolved.

## Apply or re-apply

```bash
gh api -X PUT repos/Indoland-Manajemen-Properti-Terpadu/jurnal-fe/branches/<branch>/protection \
  --input .github/branch-protection/<branch>.json
```

## Required status check

Add this block to each file, then re-apply, once the `Quality Gate & Build Check` workflow has run at least once on a PR into that branch (the check does not exist before that, and requiring it earlier would block every PR):

```json
"required_status_checks": { "strict": true, "contexts": ["test-and-build"] }
```

Replace the current `"required_status_checks": null`. Promotion order (develop-frontend, staging, main-frontend) is enforced separately by the `guard` job in `.github/workflows/deploy.yml`.

## What `test-and-build` is

`test-and-build` is the last job of `.github/workflows/pr-check.yml`. It runs after the parallel jobs (`typecheck`, `lint`, three `unit` shards, `build`) and fails when any of them failed or was cancelled. A job skipped on purpose (a PR that changes only Markdown) counts as passed. Branch protection requires only this one name, so the parallel jobs can be split, merged or renamed without touching the protection, but this job cannot be renamed or removed without changing `required_status_checks` in all three payloads.

`"strict": true` makes GitHub ask for a branch that is up to date with its base before it merges, which reruns the gate after every merge into the base. Dropping it (or using a merge queue) would save that rerun but is a policy decision, not applied here.

