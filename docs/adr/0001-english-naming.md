# ADR 0001: English identifiers and paths

**Status:** Accepted, 2026-10-29

## Context
Paths and identifiers mixed Indonesian and English (`Pembelian`, `Kontak`, `PeriodeLockAndClosingBooks`, `BusinessSumary`). A branch (`refactor/general-journal-indonesian-naming`) had started the opposite direction.

## Decision
All identifiers, file names and directory names are English and follow [conventions](../conventions.md). Accounting terms use their standard English equivalents (the terminology table in `.codex/PROJECT_CONTEXT.md`). User-facing text stays bilingual through i18n; Indonesian-only terms may appear as data or translation values, never as identifiers.

## Consequences
Legacy paths are renamed feature by feature inside each migration PR, with redirects for bookmarked URLs. The abandoned Indonesian-naming branch is archived, not merged.
