# Conventions

English for every identifier and path. User-facing text is bilingual (`id` primary, `en`); see [i18n.md](i18n.md).

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

## TypeScript and maintainability

- Keep TypeScript strict. Type API boundaries, form inputs, query results, and component contracts; do not hide uncertainty with unchecked casts or broad optional fields.
- Keep modules cohesive and files focused. Split a component or service when it owns multiple responsibilities, but do not split files only to satisfy an arbitrary line count.
- Prefer direct, readable code over clever abstractions. Extract shared logic only when there is a real second use or a clear domain boundary; avoid speculative generic frameworks and pass-through wrappers.
- Use the path aliases already defined in `tsconfig.json`. Do not add aliases or barrel files in every folder. Add a barrel only for a deliberate public boundary.
- Prefer existing project dependencies and components. A new dependency, framework upgrade, or replacement of an established library requires user approval.
- Use the repository's pinned Yarn 4 package manager and preserve its lockfile. Do not switch package managers or clean up unrelated lockfiles as part of another task.

- Prefer `unknown` plus narrowing at external boundaries; avoid `any` unless a documented third-party limitation makes it necessary.
- Do not add an `I` prefix to interfaces; use PascalCase for types, interfaces, enums and classes.

## Testing and verification

- Add focused tests for changed domain rules, use cases, adapters, and user-visible behavior when testing is part of the requested implementation.
- Prefer the existing Vitest and React Testing Library setup. Test observable behavior and accounting outcomes rather than component internals.
- Use scripts declared in `package.json` and the relevant task's agreed verification scope. Before making claims about automated PR gates, inspect the current GitHub Actions workflow; documentation must not imply checks that CI does not run. Respect an explicit request to narrow or skip checks, and report what was not verified.
- Do not claim a check passed if it was not run. If a check is blocked by environment or unrelated baseline failures, report the exact limitation and separate it from the change's result.

## Commits and PRs

Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `style`), scope is the module (`feat(contacts): ...`). One feature per migration PR; the first commit of a migration is a pure `git mv` so history follows the files.
