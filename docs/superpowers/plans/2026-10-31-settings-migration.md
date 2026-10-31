# Settings Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user chose native, inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/module/SettingMenu` (everything except `UserManagement`) to `src/module/settings` with English names, i18n, README and tests, the first module of Milestone 4 (release R4).

**Architecture:** One branch `refactor/settings`, one PR into `develop-frontend`, following the Module Migration Procedure of `2026-10-29-m1-small-modules.md` and the earlier module plans. `src/module/SettingMenu/UserManagement` stays at its old path (it moves in the `user-management` plan); its pages keep working through the public `SettingsLayout` export.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md) sections 4, 5, 8.1, 8.3.

## Global Constraints

Same as the earlier module plans: English identifiers and paths, kebab-case folders, PascalCase component files, `@/` imports only, no `any`, no `console.*`, files at most 400 lines, no `Layout.tsx` wrappers, no change to API payloads or endpoints, ratchet only goes down, commit 1 is a pure move, Conventional Commits ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Gate: `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`.

## Review Focus

- **Mutation feedback:** every create, update and delete shows success or failure and invalidates the matching list; a failed save keeps the modal open.
- **Tax form:** a blank name and a negative rate are rejected; the default rate stays 11; an empty account is sent as `undefined`, not `''`.
- **Account mapping batch:** only changed rows are sent; seeding and saving refresh the list.
- **Number format preview:** the preview pads the number to 6 digits and wraps it in prefix and suffix.
- **Language switch:** every label, notification and validation message in `id` and `en`.
- **User management still works:** its pages keep their settings layout and the chart-of-accounts pages keep their user and role lookups.

## Rulings made while planning

- **R1:** `ApprovalSetting` (`ApprovalSettingPage` and its layout wrapper) is referenced by nothing: the route `/settings/approval-setting` redirects to pending changes. Task 1 re-verifies and deletes it. Cost if wrong: restore from git.
- **R2:** `settingsNavigation.ts` (icons and routes) lives in `presentation/`; `SettingsLayout` is exported from the module index because `UserManagement` renders inside it.
- **R3:** `useSettingQueries.ts` (532 lines, seven resources) is split into one hook file per resource; query keys (`settingKeys`) and behavior stay identical.
- **R4:** The domain types move from `settingApi.ts` to `domain/`; `settingApi.ts` keeps the HTTP calls. Mutation notification texts move to the `settings` namespace.
- **R5:** `UserManagement` is untouched in this PR except for the import of `SettingsLayout`.

## Target tree

```text
src/module/settings/
  README.md
  index.ts                         the ten pages + SettingsLayout
  domain/                          settingTypes.ts (+ numberFormatPreview.ts with tests)
  infrastructure/                  settingApi.ts split per resource if over 400 lines
  presentation/
    pages/                         SettingsHubPage, GeneralSettingPage, CompanySettingPage, AccountMappingPage,
                                   TaxSettingPage, PaymentTermPage, PaymentMethodPage, NumberFormatPage, TagSettingPage
    components/                    SettingsLayout (+ css)
    hooks/                         one use<Resource>Queries.ts per resource, useSettingsOverview.ts
    settingsNavigation.ts
```

---

### Task 1: Branch, dead code, pure move
### Task 2: Rename, index, router, SettingsLayout export
### Task 3: Domain types and tested rules (number format preview, tax and payment term validation)
### Task 4: Split hooks and API per resource
### Task 5: i18n, cleanup
### Task 6: README, status, ratchet, gate, PR
