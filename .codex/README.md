# Project Agent Context

This directory is the canonical home for Jurnal frontend engineering context and task workflows.

## Read first

- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) defines project scope, architecture, naming, API boundaries, accounting correctness, UI, and verification expectations.
- The repository-root [`AGENTS.md`](../AGENTS.md) is a small auto-discovered loader that points agents to this context.

## Task workflows

Read a workflow when its task applies. Workflows describe task steps; they do not create a second set of project rules.

- [Issue fix](workflows/issue-fix.md)
- [Feature scaffold](workflows/feature-scaffold.md)
- [Feature refactor](workflows/feature-refactor.md)
- [Code review](workflows/code-review.md)
- [Test authoring](workflows/test-authoring.md)
- [Design review](workflows/design-review.md)
- [Design token change](workflows/design-token-change.md)
- [Security review](workflows/security-review.md)
- [Incident hotfix](workflows/incident-hotfix.md)
- [Deployment readiness](workflows/deployment-readiness.md)

## Provider-specific files

`.github/` contains GitHub Actions, pull request templates, and thin GitHub Copilot adapters. Keep project rules and reusable task workflows here in `.codex/`; provider adapters should link to them instead of restating them. `README.md` remains the source for product overview and local setup instructions.
