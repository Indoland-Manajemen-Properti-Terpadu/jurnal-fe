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
2. Before any implementation or fix, open the [Jurnal ProApps UI reference](https://jurnalproapps.vercel.app) and inspect the screen or flow related to the task (see [`docs/ui-guidelines.md`](../ui-guidelines.md) for how to navigate by menu, switch roles with **"Lihat sebagai"** in the footer, and handle mismatches). If the task touches shared navigation or layout, inspect that too. For work with no matching screen, inspect the closest relevant page or app shell. If the reference cannot be reached or has no equivalent screen, record that limitation and do not claim visual verification.
3. Confirm the requested outcome and keep the change within that scope. Ask before changing external systems, expanding behavior, adding dependencies, changing public contracts, or performing a broad migration. If the Vercel UI reference conflicts with the backend API contract, confirm with the user or mention the relevant Jira owner (Raga: UI/UX, PM, QA; Aldi & Zaki: backend, Zaki also handles frontend) rather than inventing dummy behavior.
4. Make the smallest cohesive change that follows the architecture, keeps `jurnal-fe`'s existing theme tokens, updates `i18n` copy where needed, and matches the reference screen's UI, layout, and UX flow. Improve messy structure in the affected area when it directly helps the requested work and preserves behavior.
5. Review the diff for accidental changes, secrets, generated files, and unrelated formatting. Preserve all user-owned changes. For UI changes, visually compare the local result against `https://jurnalproapps.vercel.app` when local rendering is available.
6. Report what changed, the files affected, which reference screen or flow (and role, if applicable) was inspected, verification performed (including visual comparison or why it was skipped), and any unresolved contract, design, or environment issue.

## Task workflows

Read the workflow when its task applies. Workflows describe steps only; they never define a second set of rules.

| Task | Workflow |
|---|---|
| Fix a bug or issue | [issue-fix](workflows/issue-fix.md) |
| Work a Jira QA ticket, reply to QA, give feedback | [jira-ticket](workflows/jira-ticket.md) |
| New feature | [feature-scaffold](workflows/feature-scaffold.md) |
| Restructure or migrate a feature | [feature-refactor](workflows/feature-refactor.md) |
| Review a change | [code-review](workflows/code-review.md) |
| Write tests | [test-authoring](workflows/test-authoring.md) |
| Review a UI | [design-review](workflows/design-review.md) |
| Change a design token | [design-token-change](workflows/design-token-change.md) |
| Security review | [security-review](workflows/security-review.md) |
| Production incident | [incident-hotfix](workflows/incident-hotfix.md) |
| Before a release | [deployment-readiness](workflows/deployment-readiness.md) |
