# Jurnal Frontend Project Context

This is the single source of truth for project engineering context and rules. The root `AGENTS.md` is the auto-discovered entry point and directs agents here. Read this file before changing project files. Workflow documents live under `.codex/workflows/`; they may provide task steps but must not contradict these rules. Other Markdown files may document product behavior, setup, or examples, but must not define conflicting engineering rules.

## Project Scope and Change Boundaries

- This repository contains the Jurnal Accounting frontend integrated with ProApps. Work only on the user-requested Jurnal frontend task.
- Do not change ProApps backend code, shared infrastructure, production resources, external accounts, or unrelated repositories unless the user explicitly authorizes that scope.
- Do not add unrequested features, alter product behavior, change API contracts, or expand a task into a broad migration. Explain why an expansion is needed and get approval first.
- Preserve existing uncommitted and untracked work. Inspect the working tree before editing; never revert, delete, or overwrite changes you did not make.
- A cleanup is in scope when it is directly needed by the requested change and stays within the affected feature. Broad cross-feature restructuring requires a separate plan and approval.
- Do not commit, push, merge, deploy, or change external systems unless the user explicitly asks for that action.
- Do not disable or weaken lint, typecheck, tests, or CI checks to make a change appear successful.

## Architecture

Use pragmatic Clean Architecture with feature-first boundaries. Keep the existing `src/module` root while the codebase is migrated incrementally. New features and substantially changed feature areas should use this structure:

```text
src/module/<feature-name>/
  domain/
    entities/
    value-objects/
    repositories/       # ports/interfaces
  application/
    use-cases/
    dto/
  infrastructure/
    api/
    mappers/
    repositories/      # concrete adapters
  presentation/
    pages/
    components/
    hooks/
```

Keep only folders that have a real responsibility; do not create empty layers or pass-through files just to match this tree. Existing feature folders may retain their current layout until a relevant task gives a clear reason to migrate them. Preserve behavior during structural refactors.

### Dependency Direction

- Presentation depends on application contracts and invokes use cases. Application depends on domain. Domain has no dependency on React, browser APIs, Mantine, Axios, TanStack Query, Zustand, or infrastructure.
- Application use cases are framework-independent: they must not import React, browser APIs, UI libraries, network clients, or infrastructure implementations.
- Infrastructure implements repository ports defined inward and maps external API DTOs to domain/application types.
- The app composition root (`src/main.tsx`, `src/App.tsx`, and router/provider setup) wires concrete adapters to the application.
- Do not import another feature's internal files. Expose a small public feature API when cross-feature use is necessary. Avoid circular dependencies and deep imports across feature boundaries.
- Keep cross-feature UI and utilities in the existing shared locations such as `src/components`, `src/theme`, `src/lib`, and `src/utils`. Do not create a second shared-components or API-client directory.

### View, Business Logic, and Data Access

- Pages and view components render state, collect user input, and forward user intent. They must not call Axios/fetch, build endpoints, contain accounting rules, or coordinate multi-step business workflows.
- Keep business rules and calculations in domain entities/value objects or application use cases, where they can be understood and tested without rendering React.
- Keep API access, external DTOs, response mapping, and repository implementations in feature infrastructure. Use the existing centralized Axios client.
- Presentation hooks may adapt use cases to React and TanStack Query. Keep query keys and query hooks close to their feature; pages should consume typed results and render loading, empty, error, and success states.
- Local input and view state may stay in React state or Mantine form state. Do not move state globally without a real cross-component need.

## State Management

- TanStack Query v5 owns remote/server state, request lifecycle, caching, retries, and invalidation.
- Zustand owns client-only shared state such as cross-page interaction state. Do not mirror server responses in Zustand or maintain two competing sources of truth.
- Use component/form state for temporary state local to one view. Avoid global stores for state that has one consumer.
- Mutations must provide clear pending and failure feedback and prevent accidental duplicate submissions. Do not use optimistic updates for journal, ledger, balance, or other financial mutations unless correctness and rollback behavior are established for that operation.

## API and ProApps Integration

- Route all HTTP traffic through the configured shared client and feature-specific infrastructure adapters. Never call HTTP directly from a page or UI component.
- Keep endpoint definitions and request/response DTOs explicit. Do not use domain entities as raw API response types; map at the boundary when the shapes or meanings differ.
- Do not guess endpoints, permissions, tenant/site scoping, accounting rules, or request/response shapes. Verify them from available project/backend documentation or an authorized Postman collection. If evidence is missing, state the assumption and ask before implementing a contract-dependent change.
- Use Postman CLI only for an explicitly in-scope API engineering task and only against the authorized collection/environment. Its availability does not authorize unrelated account or production access.
- Keep credentials and secrets out of source control and logs. Follow the existing approved authentication flow; do not change token storage or authorization behavior without approval.
- Normalize API errors at the boundary without swallowing useful details. Show safe, actionable messages to users and keep technical details out of user-facing copy.

## Accounting Data Correctness

- Never introduce financial rules that are not supported by the existing product or an approved requirement.
- Do not use JavaScript floating-point arithmetic for money calculations. Preserve the API's established decimal or minor-unit representation and use its documented rounding rules. If the contract is unclear, ask before choosing a representation or rounding behavior.
- Keep accounting calculations out of views. Use domain/application code and cover important rules with focused tests when implementation and verification are requested.
- Treat date-only values, timestamps, currency, sign conventions, and period boundaries according to the verified API/product contract. Do not silently convert time zones or round values in presentation code.

## Naming and Language

- New code identifiers, file names, and directory names must use common, idiomatic English terms. Do not introduce Indonesian transliterations or inconsistent abbreviations in code names.
- Use kebab-case for new feature and ordinary directory names. Use PascalCase for React component/page files and component names. Use camelCase for all other TypeScript source files, functions, variables, hooks, and utilities. Custom hook names and files start with `use` (for example, `useJournalEntries.ts`).
- Name use-case files with clear verbs (for example, `createJournalEntry.ts`), repository interfaces by domain responsibility, API adapters by implementation (for example, `httpJournalEntryRepository.ts`), and mappers by the type being mapped (for example, `journalEntryMapper.ts`). Keep names descriptive and consistent within a feature.
- Use PascalCase for TypeScript types, interfaces, enums, and classes. Do not add an `I` prefix to interfaces. Prefer `unknown` plus narrowing at external boundaries; avoid `any` unless a documented third-party limitation makes it necessary.
- Use `.test.ts` or `.test.tsx` for tests. Keep tests near the code when that matches the existing feature.
- Do not rename legacy Indonesian or inconsistent paths in bulk. Rename a path only when it is directly in scope, references are updated safely, and the migration has been approved where it crosses feature boundaries.
- User-facing product content supports English and Indonesian. Use the localization mechanism already present in the project and keep both translations semantically equivalent with consistent accounting terminology. Do not add an i18n dependency or redesign locale selection without approval. Never mix the two languages in one translation string unless the product copy explicitly requires it.

## TypeScript and Maintainability

- Keep TypeScript strict. Type API boundaries, form inputs, query results, and component contracts; do not hide uncertainty with unchecked casts or broad optional fields.
- Keep modules cohesive and files focused. Split a component or service when it owns multiple responsibilities, but do not split files only to satisfy an arbitrary line count.
- Prefer direct, readable code over clever abstractions. Extract shared logic only when there is a real second use or a clear domain boundary; avoid speculative generic frameworks and pass-through wrappers.
- Use the path aliases already defined in `tsconfig.json`. Do not add aliases or barrel files in every folder. Add a barrel only for a deliberate public boundary.
- Prefer existing project dependencies and components. A new dependency, framework upgrade, or replacement of an established library requires user approval.
- Use the repository's pinned Yarn 4 package manager and preserve its lockfile. Do not switch package managers or clean up unrelated lockfiles as part of another task.

## UI and Accessibility

- Use React 18, Mantine 8, the existing custom Tailwind setup, and the repository's theme tokens. Do not use Mantine v9 APIs or invent a parallel design system.
- Follow the existing Figma references and local theme as the design sources of truth. Prefer existing shared components. Avoid hardcoded colors, spacing, typography, and radius values when a project token exists.
- Use the brand tokens defined in `src/theme.ts`: primary `#053079` and secondary `#09B2FF`. Their Mantine shades are derived in the same theme palette; reference `primary` and `secondary` tokens instead of hardcoding hex values in components. Keep semantic feedback colors separate from brand colors (for example, success green and error red).
- Preserve the project's Figtree typography. Use Phosphor icons with `weight="duotone"` in the app shell and Tabler icons in general content, following the established component patterns.
- Preserve the established app-shell navigation behavior; on desktop, the collapsed sidebar uses the existing icon-rail pattern unless the requested product change explicitly alters it.
- Keep styling with the established CSS Modules, Mantine `classNames`, and configured Tailwind patterns. Confirm a Mantine API against the installed v8 version rather than copying examples from another major version.
- Interactive controls need an accessible name, keyboard behavior, visible focus, and a meaningful loading/disabled state where applicable. Data views must handle loading, empty, error, and populated states.
- Master module list and category tabs must follow consistent pill navigation: `<Tabs color="primary" variant="pills" radius="md">` with `leftSection` icons on each tab inside a top `<Paper withBorder radius="lg" p="md">`, positioned above the search bar and data table. Do not use default underline tabs for primary master data navigation.
- Empty State Consistency: Tables and list views MUST NOT unmount the table shell or replace the data frame with disparate raw boxes when filtered or empty. Render the standard `<EmptyState>` component inside `<Table.Tbody><Table.Tr><Table.Td colSpan={...}>` (or the unified table container) so that headers, borders, and pagination structures remain stable. The empty state must feature an informative soft-themed icon orb, concise bold title, descriptive instruction text, and an actionable CTA button where relevant (e.g. "Buat Data Baru").
- Do not fabricate product claims, accounting data, user identities, or API results in production UI.

## Testing and Verification

- Add focused tests for changed domain rules, use cases, adapters, and user-visible behavior when testing is part of the requested implementation.
- Prefer the existing Vitest and React Testing Library setup. Test observable behavior and accounting outcomes rather than component internals.
- Use scripts declared in `package.json` and the relevant task's agreed verification scope. Before making claims about automated PR gates, inspect the current GitHub Actions workflow; documentation must not imply checks that CI does not run. Respect an explicit request to narrow or skip checks, and report what was not verified.
- Do not claim a check passed if it was not run. If a check is blocked by environment or unrelated baseline failures, report the exact limitation and separate it from the change's result.

## Work Process

1. Read this file, inspect the relevant implementation and API contracts, and check `git status` before editing.
2. Confirm the requested outcome and keep the change within that scope. Ask before changing external systems, expanding behavior, adding dependencies, changing public contracts, or performing a broad migration.
3. Make the smallest cohesive change that follows the architecture. Improve messy structure in the affected area when it directly helps the requested work and preserves behavior.
4. Review the diff for accidental changes, secrets, generated files, and unrelated formatting. Preserve all user-owned changes.
5. Report what changed, the files affected, verification performed, and any unresolved contract or environment issue.

## Design References

- Figma color tokens: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-493&m=dev
- Figma text styles: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-4400&m=dev
- Figma spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-5511&m=dev
- Figma radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-6791&m=dev
- Local theme sources: `src/theme.ts`, `src/theme/index.ts`, `src/theme/constants.ts`, and `src/theme/globalStyles.css`.
