# Agent Instructions

Single entry point for every coding agent and contributor (Claude Code reads it through `CLAUDE.md`, Gemini through `GEMINI.md`, Copilot through `.github/copilot-instructions.md`; they only point here). All rules live in `docs/`; nothing is defined twice.

## Read first

1. [`docs/agents/README.md`](docs/agents/README.md): scope, what needs approval, the work process, and the task workflows.
2. The document for your task:

| Topic | Document |
|---|---|
| Where code belongs, layers, state, HTTP, lint guardrails | [`docs/architecture.md`](docs/architecture.md) |
| Naming, TypeScript, tests, commits | [`docs/conventions.md`](docs/conventions.md) |
| Money, ledger and accounting correctness | [`docs/accounting.md`](docs/accounting.md) |
| Screens: product vision, page layouts, accessibility | [`docs/ui-guidelines.md`](docs/ui-guidelines.md) |
| Tokens, colors, typography, CSS variables | [`docs/design-system.md`](docs/design-system.md) |
| Translations and accounting terms | [`docs/i18n.md`](docs/i18n.md) |
| Branches, PRs, releases | [`docs/branching-and-release.md`](docs/branching-and-release.md) |
| A feature's own behavior | `src/module/<feature>/README.md` ([index](docs/modules/README.md)) |
| Why a decision was made | [`docs/adr/`](docs/adr) |

`README.md` covers product overview and local setup only. The full index is [`docs/README.md`](docs/README.md).
