# Working Agreement for Agents and Contributors

Scope rules, the work process and the task workflows. The technical rules live in the topic documents indexed in the root [`AGENTS.md`](../../AGENTS.md).

## Scope and change boundaries

- This repository contains the Jurnal Accounting frontend integrated with ProApps. Work only on the user-requested Jurnal frontend task.
- Do not change ProApps backend code, shared infrastructure, production resources, external accounts, or unrelated repositories unless the user explicitly authorizes that scope.
- Do not add unrequested features, alter product behavior, change API contracts, or expand a task into a broad migration. Explain why an expansion is needed and get approval first.
- Preserve existing uncommitted and untracked work. Inspect the working tree before editing; never revert, delete, or overwrite changes you did not make.
- A cleanup is in scope when it is directly needed by the requested change and stays within the affected feature. Broad cross-feature restructuring requires a separate plan and approval.
- Do not commit, push, merge, deploy, or change external systems unless the user explicitly asks for that action.
- Do not disable or weaken lint, typecheck, tests, or CI checks to make a change appear successful.

## Work process

1. Read the topic documents your task needs (indexed in `AGENTS.md`), inspect the relevant implementation and API contracts, and check `git status` before editing.
2. Confirm the requested outcome and keep the change within that scope. Ask before changing external systems, expanding behavior, adding dependencies, changing public contracts, or performing a broad migration.
3. Make the smallest cohesive change that follows the architecture. Improve messy structure in the affected area when it directly helps the requested work and preserves behavior.
4. Review the diff for accidental changes, secrets, generated files, and unrelated formatting. Preserve all user-owned changes.
5. Report what changed, the files affected, verification performed, and any unresolved contract or environment issue.

## Task workflows

Read the workflow when its task applies. Workflows describe steps only; they never define a second set of rules.

| Task | Workflow |
|---|---|
| Fix a bug or issue | [issue-fix](workflows/issue-fix.md) |
| New feature | [feature-scaffold](workflows/feature-scaffold.md) |
| Restructure or migrate a feature | [feature-refactor](workflows/feature-refactor.md) |
| Review a change | [code-review](workflows/code-review.md) |
| Write tests | [test-authoring](workflows/test-authoring.md) |
| Review a UI | [design-review](workflows/design-review.md) |
| Change a design token | [design-token-change](workflows/design-token-change.md) |
| Security review | [security-review](workflows/security-review.md) |
| Production incident | [incident-hotfix](workflows/incident-hotfix.md) |
| Before a release | [deployment-readiness](workflows/deployment-readiness.md) |
