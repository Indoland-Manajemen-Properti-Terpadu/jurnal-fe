# Feature Refactor Workflow

1. Inspect the target feature, its callers, current behavior, API contract, and working-tree changes.
2. Identify concrete boundary or maintainability problems and compare the smallest safe options. Explain the recommended option, affected files, and behavior risks before a broad refactor.
3. Get approval before expanding beyond the requested feature or changing public contracts, authentication, shared design tokens, dependencies, or CI/CD.
4. Refactor in cohesive steps while preserving observable behavior and feature boundaries.
5. Run only the agreed verification and report completed scope, checks, and remaining migration work.
