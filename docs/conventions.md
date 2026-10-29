# Conventions

English for every identifier and path. User-facing text is bilingual (`id` primary, `en`) through `useTranslation` from `@/i18n`; see the terminology table in [`.codex/PROJECT_CONTEXT.md`](../.codex/PROJECT_CONTEXT.md).

| Item | Convention | Example |
|---|---|---|
| Feature directory | kebab-case, English, plural for collections | `journal-entries`, `bank-cash` |
| Ordinary directory | kebab-case | `bank-statements` |
| Page or component file | PascalCase, name equals the export | `JournalEntryPage.tsx` |
| Hook | camelCase, starts with `use` | `useJournalEntries.ts` |
| Zustand store | `use<Name>Store.ts` | `useBankStatementStore.ts` |
| Use case | verb phrase | `createJournalEntry.ts` |
| Repository port | by responsibility | `journalEntryRepository.ts` |
| Repository adapter | `http<Name>Repository.ts` | `httpJournalEntryRepository.ts` |
| Mapper | `<type>Mapper.ts` | `journalEntryMapper.ts` |
| Other TypeScript | camelCase | `formatCurrency.ts` |
| Types, interfaces, enums | PascalCase, no `I` prefix | `JournalEntry` |
| True constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |
| Tests | beside the unit | `createJournalEntry.test.ts` |
| CSS Modules | same name as the component | `JournalEntryPage.module.css` |
| Imports | `@/` alias; never `../../..` | `import { x } from '@/lib/money/money'` |
| i18n namespace | one per feature, camelCase | `journalEntries` |

## Do and don't

- Do import another feature only from `@/module/<feature>`.
- Do keep route components in `presentation/pages`; do not create `view`, `page` or `Layout.tsx` wrappers.
- Do keep a file under 400 lines; split by responsibility, not by line count.
- Do convert money to minor units at the API boundary and sum with `sumMinor`.
- Don't use Indonesian-derived names (`Pembelian`, `Kontak`, `Periode`) or misspellings (`Sumary`, `Begining`) in new code.
- Don't rename legacy paths in bulk; rename a feature inside its own migration PR.
- Don't put accounting rules, endpoints or HTTP calls in pages or components.

## Commits and PRs

Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `style`), scope is the module (`feat(contacts): ...`). One feature per migration PR; the first commit of a migration is a pure `git mv` so history follows the files.
