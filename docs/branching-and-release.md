# Branching and Release

```text
main-frontend      production; a push here deploys, so release PRs only
   ^
staging            QA and soak; auto-deploys to the staging environment
   ^
develop-frontend   integration; all work lands here by PR
   ^
refactor/*, feat/*, fix/*, docs/*, chore/*   short-lived work branches
hotfix/*           cut from main-frontend
```

## Rules

- No direct pushes to `main-frontend`, `staging` or `develop-frontend`. Branch protection requires a PR, applies to admins, and blocks force pushes and deletions. The payloads are in [`.github/branch-protection/`](../.github/branch-protection).
- Work branches are squash-merged into `develop-frontend` after CI is green.
- Promotion is `develop-frontend` to `staging` to `main-frontend`, each by PR. The `guard` job in `.github/workflows/deploy.yml` refuses to deploy a commit that did not arrive this way.
- Releases are tagged `vMAJOR.MINOR.PATCH` on `main-frontend`.

## Release gate (PR into `main-frontend`)

1. Typecheck, lint ratchet, tests and build are green.
2. Staging soak with a manual smoke test: login, chart of accounts, journal entry, cash and bank, reports, sales.
3. [migration/STATUS.md](migration/STATUS.md) is updated.
4. No unintended behavior change; API payloads and accounting values are unchanged.

## Hotfix

1. Branch `hotfix/<topic>` from `main-frontend`.
2. PR into `main-frontend` (1 approval), then merge `main-frontend` back into `staging` and `develop-frontend`.

## Staying in sync during the restructure

Merge `main-frontend` into `develop-frontend` after every hotfix and at least weekly, so renames do not collide with production fixes.

## Known limitation

The production deploy step (SSH to the server) failed on the 12 most recent runs before the restructure began; see [migration/BASELINE.md](migration/BASELINE.md). A merge to `main-frontend` builds and publishes the Docker image, but the running container is not updated until the server connection is fixed.
