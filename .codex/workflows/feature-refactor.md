# Feature Refactor Workflow

1. Inspect the target feature, its callers, current behavior, API contract, and working-tree changes.
2. Identify concrete boundary or maintainability problems and compare the smallest safe options. Explain the recommended option, affected files, and behavior risks before a broad refactor.
3. Get approval before expanding beyond the requested feature or changing public contracts, authentication, shared design tokens, dependencies, or CI/CD.
4. Refactor in cohesive steps while preserving observable behavior and feature boundaries.
5. Ensure the refactored UI conforms to the **Product Vision**, **Canonical Feature Page Layout Standard** (Standard A for listings, Standard B for forms/transactions), and **The 6 Golden Rules of Accounting UI/UX** defined in [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).
6. Run only the agreed verification and report completed scope, checks, and remaining migration work.
