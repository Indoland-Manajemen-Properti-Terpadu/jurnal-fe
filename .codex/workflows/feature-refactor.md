# Feature Refactor Workflow

1. Inspect the target feature, its callers, current behavior, API contract, and working-tree changes.
2. Identify concrete boundary or maintainability problems and compare the smallest safe options. Explain the recommended option, affected files, and behavior risks before a broad refactor.
3. Get approval before expanding beyond the requested feature or changing public contracts, authentication, shared design tokens, dependencies, or CI/CD.
4. Refactor in cohesive steps while preserving observable behavior and feature boundaries.
5. Ensure the refactored UI conforms to the **Product Vision**, **Canonical Feature Page Layout Standard** (Standard A for listings, Standard B for forms/transactions), and **The 6 Golden Rules of Accounting UI/UX** defined in [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).
6. Run only the agreed verification and report completed scope, checks, and remaining migration work.

## Restructure migration (per-feature procedure)

For a feature listed in `docs/migration/STATUS.md`, follow the procedure and Definition of Done in section 8.1 of `docs/superpowers/specs/2026-10-29-codebase-restructure-design.md`: write a migration plan under `docs/superpowers/plans/`, move files with `git mv` in a first commit, then rename, separate layers, split oversized files, add i18n for every string, remove `any` and `console` in the feature's files, add tests for extracted domain logic, write the module `README.md`, lower the ESLint baseline, and update `STATUS.md`. Work on `refactor/<feature>` and open a PR into `develop-frontend`.
