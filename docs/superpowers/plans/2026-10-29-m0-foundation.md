# Milestone 0 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the repository safe to refactor: a green, honest quality baseline; tooling that stops structure and quality from regressing; one HTTP client; a money helper; and the documentation skeleton. No feature is moved or renamed in this milestone.

**Architecture:** Guardrails are built around a *ratchet*: lint rule counts are recorded in `docs/migration/eslint-baseline.json` and CI fails if any count rises, so existing debt is tolerated but cannot grow, and each later feature migration lowers the numbers. Formatting is owned by Prettier and checked only on changed files. Everything uses dependencies already installed.

**Tech Stack:** TypeScript strict, Vite 5, Vitest 1 + jsdom, ESLint 8 (`eslint-plugin-import` already installed), Stylelint 16, Prettier 3, Yarn 4.2.2, GitHub Actions, `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-10-29-codebase-restructure-design.md` (sections 6, 7, 9, 10). Findings from the 2026-10-29 baseline run that the spec did not have are listed under "Deviations from the spec" and are authoritative for this plan.

## Global Constraints

- Work on branch `chore/m0-foundation` cut from `develop-frontend`; open a PR into `develop-frontend`. `develop-frontend`, `staging` and `main-frontend` are protected (PR required, admins enforced). Never push to them directly.
- Commits are part of this plan (one per task, Conventional Commits, ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`). Ask before `git push` and before opening the PR.
- Preserve existing untracked work: `API-SPEC-Petty-Cash-Backend.pdf`, `PRD-Petty-Cash-Jurnal-ProApps.pdf`, `docs/API-SPEC-Petty-Cash-Backend.md`, `docs/API-SPEC-Petty-Cash-Backend.pdf`, `docs/PRD-Petty-Cash-Jurnal-ProApps.pdf`, `docs/superpowers/plans/petty-cash-prd.md` (0 bytes). Only Task 11 touches them.
- Observable behavior must not change. No API, route, accounting, design-token, or dependency changes. No new npm dependency.
- Package manager is Yarn 4.2.2 (`yarn.lock` is never regenerated). Scripts in `package.json` keep the existing `npm run` style.
- Do not weaken a check to make it pass. Turning formatting rules off in ESLint is allowed only because Prettier enforces the same concerns (Task 4); say so in the commit body.
- Identifiers and paths in new code are English; user-facing text in `id` and `en`.
- Do not mention competitor brand names in any new file.

## Deviations from the spec (from the baseline run)

1. `.gitignore` is intact; the truncated lines seen earlier were a display artifact. Spec finding 9 is corrected in Task 1.
2. Baseline is not clean: `typecheck` and `build` pass; `vitest` fails (1 file with an empty `describe`; 18 tests pass); `eslint` reports 3433 errors and 46 warnings over 508 files (mostly formatting rules that duplicate Prettier) and crashes with `Keyv is not a constructor` when `--cache` is used; `stylelint` reports 48 errors; `prettier --check` flags 224 files; the production deploy step (SSH) has failed on every recent run (connection timeout after about 30 s; image build and push succeed). The SSH failure is out of scope: it is recorded, not fixed.
3. Mass formatting is not done in M0 (it would touch 224 files and collide with parallel branches). Each migrated feature is formatted in its own PR; CI checks Prettier on changed files only.
4. Feature-owned stores (`src/store/GeneralJournal/*`) are not moved in M0; they move once, with the feature that owns them (M3). Duplicate shared components (`ConfirmModal`, `PageHeader`/`PageHeaderV2`, `products` `ModuleHeader`) are consolidated in the milestone of their heaviest consumer, not here. `src/router` stays where it is (no `src/app`).
5. Deploy guard (spec section 10) is kept only to enforce promotion order (`staging` to `main-frontend`, `develop-frontend` to `staging`); direct pushes are already blocked by branch protection applied on 2026-10-29.

## Review Focus

- `apiClient` moves while `@/router` imports it and it imports `@/router`; a circular-init mistake typechecks but blanks the app at runtime. Covered in Task 8 by the route-manifest test importing the router.
- ESLint crashing or printing non-JSON must fail the ratchet, never pass it (Task 5).
- A rule absent from the baseline that appears in current results counts as a regression (Task 5).
- Money input such as `0.1 + 0.2`, `''`, `NaN`, `'1,500.50'`, `-0` must give a defined result or throw, never a silent wrong number (Task 10).
- Prettier-on-changed-files with zero changed files, or file names with spaces, must exit 0 and not crash (Task 4).

---

### Task 1: Branch, baseline record, spec correction

**Files:**
- Create: `docs/migration/BASELINE.md`, `docs/migration/STATUS.md`
- Modify: `docs/superpowers/specs/2026-10-29-codebase-restructure-design.md` (section 2, row 9 and add row 13)

**Interfaces:** Produces `docs/migration/STATUS.md`, a table with one row per target module and columns `Structure | Names | i18n | Docs | Tests | Release`, all initially `todo`; later tasks and milestones update it.

- [ ] **Step 1:** `git fetch origin && git switch -c chore/m0-foundation origin/develop-frontend`. Expected: clean switch; untracked files untouched (`git status --short` still lists the six untracked paths).
- [ ] **Step 2:** Write `docs/migration/BASELINE.md` with the numbers in "Deviations" item 2, the date, the commit SHA (`git rev-parse --short HEAD`), the exact commands used (`yarn typecheck`, `yarn vitest`, `npx eslint . --ext .ts,.tsx -f json`, `yarn lint:stylelint`, `npx prettier --check "src/**/*.{ts,tsx}"`, `yarn build`), the 2.6 MB single JS chunk warning, and the SSH deploy failure with run id `39580303882`.
- [ ] **Step 3:** Write `docs/migration/STATUS.md` with one row per module from spec section 4.3 and 4.4 (including the seven `GeneralJournal` targets) grouped by milestone M1 to M4.
- [ ] **Step 4:** Spec row 9 was already corrected (the "`.gitignore` comments truncated" claim is gone); add row 13: "Baseline is red: vitest 1 failing file, eslint 3433 errors (mostly formatting), stylelint 48 errors, 224 files not Prettier-formatted, production SSH deploy step failing (see `docs/migration/BASELINE.md`)".
- [ ] **Step 5:** Commit: `docs(migration): record baseline and status tracker`.

### Task 2: Repository hygiene

**Files:**
- Delete: `package-lock.json`
- Untrack: `.vite/` (3 files)
- Modify: `.gitignore`

- [ ] **Step 1:** `git rm package-lock.json`; `git rm -r --cached .vite`; add the line `.vite/` under the existing build-output section of `.gitignore`.
- [ ] **Step 2:** Verify: `git ls-files | grep -E '^(package-lock\.json|\.vite/)'` prints nothing, and `git status --short` shows `.vite/` is not listed as untracked.
- [ ] **Step 3:** Verify `yarn install --immutable` still succeeds (lockfile untouched).
- [ ] **Step 4:** Commit: `chore(repo): drop npm lockfile and untrack vite cache`.

### Task 3: Green test baseline

**Files:**
- Modify: `src/components/Button/tests/Button.test.tsx`

**Interfaces:** Consumes `DefaultButton` from `@/components/Button` (props `children`, `onClick`, `variant`, `disabled`). Note `DefaultButton` currently ignores `disabled`; this task does not change the component.

- [ ] **Step 1: Write the failing test** replacing the empty `describe`: `renders its label as an accessible button` (`screen.getByRole('button', { name: 'Save' })` is in the document) and `calls onClick once when clicked` (`userEvent.click`, `expect(onClick).toHaveBeenCalledTimes(1)`). Wrap in `MantineProvider` via `render` from `@test-utils` (check `test-utils/render.tsx` already does).
- [ ] **Step 2:** Run `yarn vitest src/components/Button` and see it pass or fail honestly. If the provider is missing, fix the test, not the component.
- [ ] **Step 3:** Run `yarn vitest`. Expected: 6 files passed, 0 failed.
- [ ] **Step 4:** Commit: `test(button): replace empty suite with behavior tests`.

### Task 4: Usable lint scripts, Prettier owns formatting

**Files:**
- Modify: `package.json` (scripts), `.eslintrc.cjs`
- Create: `scripts/prettierChanged.mjs`

**Decision to confirm at review:** ESLint formatting rules that duplicate Prettier are switched off; semantic rules stay.

- [ ] **Step 1:** In `package.json` remove `--cache` from `lint:eslint` and `lint:eslint:fix`. Verify `npm run lint:eslint` no longer crashes with `Keyv is not a constructor` (it may still exit 1 with errors).
- [ ] **Step 2:** In `.eslintrc.cjs` set to `'off'`: `react/jsx-indent-props`, `@typescript-eslint/quotes`, `linebreak-style`, `max-len`, `jsx-quotes`, `no-multiple-empty-lines`, `@typescript-eslint/semi`, `react/jsx-tag-spacing`, `comma-dangle`, `eol-last`, `no-trailing-spaces`, `react/jsx-closing-tag-location`, `padded-blocks`, `react/jsx-first-prop-new-line`, `react/jsx-max-props-per-line`, `@typescript-eslint/no-extra-semi`, `no-multi-spaces`, `react/jsx-props-no-multi-spaces`, `quote-props`, `nonblock-statement-body-position`. Add a comment: "Formatting is owned by Prettier (.prettierrc.cjs)".
- [ ] **Step 3:** Run `npx eslint . --ext .ts,.tsx -f json` and confirm about 820 errors remain (mostly `no-unused-vars` 454, `import/order` 136, `arrow-body-style` 104) and none of the switched-off rules appear.
- [ ] **Step 4:** Create `scripts/prettierChanged.mjs`: `node scripts/prettierChanged.mjs [baseRef]` lists `*.ts`/`*.tsx` files changed against `baseRef` (default `origin/develop-frontend`) via `git diff --name-only --diff-filter=ACMR`, runs `prettier --check` on them with `execFileSync` (no shell, so spaces are safe), exits 0 when the list is empty, exits 1 when any file is unformatted. Add script `"prettier:changed": "node scripts/prettierChanged.mjs"`.
- [ ] **Step 5:** Verify: with no changed TS files it prints "no changed files" and exits 0; touching one unformatted file makes it exit 1; revert the touch.
- [ ] **Step 6:** Commit: `chore(lint): remove eslint cache crash and let prettier own formatting` (body states why formatting rules are off).

### Task 5: Ratchet and guardrail rules

**Files:**
- Create: `scripts/lib/ratchet.mjs`, `scripts/lib/ratchet.test.mjs`, `scripts/eslintRatchet.mjs`, `docs/migration/eslint-baseline.json`
- Modify: `.eslintrc.cjs`, `package.json`

**Interfaces:** Produces in `scripts/lib/ratchet.mjs`:
`parseEslintOutput(stdout: string): EslintFileResult[]` (throws `Error` on empty or non-JSON input);
`countByRule(results: EslintFileResult[]): Record<string, number>` (counts every message, errors and warnings, under `ruleId` or `'parse-error'`);
`compareToBaseline(current: Record<string, number>, baseline: Record<string, number>): { regressions: RuleDelta[]; improvements: RuleDelta[] }` where `RuleDelta = { rule: string; baseline: number; current: number }`.

- [ ] **Step 1: Write failing tests** in `ratchet.test.mjs`: `parseEslintOutput('')` throws; `parseEslintOutput('Error: boom')` throws; `countByRule` counts two messages of the same rule as 2 and a message with `ruleId: null` under `'parse-error'`; `compareToBaseline({a:3},{a:2})` reports one regression; `compareToBaseline({a:1},{a:2})` reports one improvement and no regression; `compareToBaseline({new:1},{})` reports a regression with `baseline: 0`; equal counts report neither.
- [ ] **Step 2:** `yarn vitest scripts` fails (module not found).
- [ ] **Step 3:** Implement the three functions.
- [ ] **Step 4:** `yarn vitest scripts` passes.
- [ ] **Step 5:** Add guardrail rules to `.eslintrc.cjs` at severity `error` (existing violations are absorbed by the baseline, not hidden):
  - `import/no-restricted-paths` with zones: `src/components` may not import `src/module` (exception: none; two existing violations are baselined); for every feature directory F found by `fs.readdirSync('src/module')` and every other feature G, a zone `{ target: './src/module/F', from: './src/module/G', except: ['./index.ts'] }` (built programmatically so renames in later milestones need no config edit); and `{ target: './src/module/*/domain', from: ['./src/module/*/presentation', './src/module/*/infrastructure'] }`.
  - `no-restricted-imports`: pattern `../../../*` (use `@/`); `axios` forbidden except in overrides for `src/lib/**`, `src/services/**`, and `src/module/**/infrastructure/**`.
  - `@typescript-eslint/no-explicit-any: error`, `no-console: ['error', { allow: ['warn', 'error'] }]`, `max-lines: ['error', { max: 400, skipBlankLines: true, skipComments: true }]`.
- [ ] **Step 6:** Verify the zone rule loads and fires: `npx eslint src/components/HeaderNav/page.tsx` reports `import/no-restricted-paths`. If globs in `target`/`from` are not supported by the installed plugin version, replace the `src/module/*/domain` zone with one explicit zone per feature using the same programmatic loop.
- [ ] **Step 7:** Create `scripts/eslintRatchet.mjs`: runs `npx eslint . --ext .ts,.tsx -f json` with `spawnSync` (not a shell), exits 2 if ESLint's exit code is above 1 or output is unparseable, prints regressions and improvements, exits 1 on any regression, exits 0 otherwise; `--write-baseline` writes the current counts, sorted by rule, to `docs/migration/eslint-baseline.json`. Add scripts `"lint:ratchet": "node scripts/eslintRatchet.mjs"` and change `"lint"` to `npm run lint:ratchet && npm run lint:stylelint`.
- [ ] **Step 8:** `npm run lint:ratchet -- --write-baseline`, then `npm run lint:ratchet` exits 0. Add one `any` to a scratch file, confirm exit 1, remove it.
- [ ] **Step 9:** Commit: `chore(lint): add ratchet and architecture guardrail rules`.

### Task 6: Stylelint clean

**Files:** CSS files reported by `yarn lint:stylelint`.

- [ ] **Step 1:** `npx stylelint '**/*.css' --fix` (fixes about 33 of 48). Run `git diff --stat` and confirm only whitespace/blank-line/format-level changes.
- [ ] **Step 2:** For each remaining error (`selector-type-no-unknown` on `switches`, `font-family-no-missing-generic-family-keyword`), open the rule in context. Fix only when the fix cannot change rendering (for example adding `sans-serif` after the named font). If a fix could change appearance, leave the selector, add a scoped `/* stylelint-disable-next-line <rule> -- reason */` comment, and list it under "Needs decision" in `docs/migration/BASELINE.md`.
- [ ] **Step 3:** `yarn lint:stylelint` exits 0. Run `yarn build` and compare `dist/assets/*.css` sizes before and after within 1%.
- [ ] **Step 4:** Commit: `style(css): fix stylelint violations without visual change`.

### Task 7: Route-manifest test

**Files:**
- Create: `src/router/routes.test.ts`
- Modify: `src/router/index.tsx` (add `export { router };` only)

**Interfaces:** Produces `router` (the `createBrowserRouter` result) as a named export of `@/router`.

- [ ] **Step 1: Write the failing test** `every concrete route constant resolves to a real page, never the catch-all`: flatten all string values of `routes` except `'*'`, replace `:param` segments with `x`, call `matchRoutes(router.routes, path)`, assert a match exists and its last route's `path` is not `'*'`. Add `it('has no duplicate route constants that diverge', ...)` only if it can be asserted without false failures; otherwise omit.
- [ ] **Step 2:** Run `yarn vitest src/router`. Expected before the export: FAIL (`router` is not exported).
- [ ] **Step 3:** Add the export. If importing the whole router fails in jsdom because of a specific module, mock only that module with `vi.mock`; if the router cannot be imported at all after reasonable effort, fall back to asserting that every `routes.*` reference value appears as `routes.<group>.<key>` in `src/router/index.tsx` source, and state the weaker guarantee in the test name.
- [ ] **Step 4:** Test passes; `yarn typecheck` passes.
- [ ] **Step 5:** Commit: `test(router): add route manifest safety net`.

### Task 8: Single HTTP client

**Files:**
- Move: `src/services/apiClient.ts` to `src/lib/http/apiClient.ts`
- Modify: the 42 files importing `@/services/apiClient` and `src/services/index.ts`
- Delete: `src/lib/axios.ts`

**Interfaces:** `src/lib/http/apiClient.ts` keeps every existing export unchanged (`default apiClient`, `get`, `download`, `post`, `postV2`, `put`, `del`, `patch`). `@/services` keeps re-exporting `get, post, postV2, put, patch, del` from the new path so unmigrated imports of `@/services` still work.

- [ ] **Step 1:** `git mv src/services/apiClient.ts src/lib/http/apiClient.ts` (create the directory first). Commit as pure move after Step 2 compiles, not separately.
- [ ] **Step 2:** Replace `@/services/apiClient` with `@/lib/http/apiClient` in all importers (`git grep -l` then in-place replace) and update `src/services/index.ts` to export from `@/lib/http/apiClient`.
- [ ] **Step 3:** Add a `@deprecated` JSDoc to `get`, `post`, `postV2`, `put`, `patch`, `del`, `download` stating they return `error.response` or `null` on failure and that new code must use the default `apiClient` inside `infrastructure/`. No behavior change.
- [ ] **Step 4:** `git rm src/lib/axios.ts` (zero importers confirmed on 2026-10-29; re-run `git grep "lib/axios"` first).
- [ ] **Step 5:** Verify `yarn typecheck`, `yarn vitest` (route-manifest test imports the router, which proves the circular import with `@/router` still initializes), and `yarn build`. Start `yarn dev` and confirm `/login` renders without console errors.
- [ ] **Step 6:** Run `npm run lint:ratchet`; regressions must be zero (the `axios` restriction counts may move; lower the baseline with `--write-baseline` only if counts went down).
- [ ] **Step 7:** Commit: `refactor(http): move api client to lib/http and drop duplicate axios instance`.

### Task 9: Dead aliases and example code

**Files:**
- Modify: `tsconfig.json`
- Delete: `src/examples/RefactoredTableExample.tsx`, template leftovers only if unreferenced

- [ ] **Step 1:** Re-verify zero usage: `git grep -nE "from '(@app|@features|@shared|@components|@hooks|@services|@store|@types|@utils|@router|@theme|@assets)[/']" -- src test-utils .storybook` prints nothing, and `git grep -n "examples/" -- src` prints nothing.
- [ ] **Step 2:** Reduce `compilerOptions.paths` to `@/*` and `@test-utils`.
- [ ] **Step 3:** `git rm src/examples/RefactoredTableExample.tsx`. Leave `Welcome` and `ColorSchemeToggle` for the milestone that owns `components/` cleanup (they are template leftovers with their own test and story; removing them is not needed for M0).
- [ ] **Step 4:** `yarn typecheck`, `yarn vitest`, `yarn build`, `yarn storybook:build` all succeed (storybook only if it succeeded before this task; otherwise note the baseline).
- [ ] **Step 5:** Commit: `chore(config): remove unused path aliases and example code`.

### Task 10: Money helper and audit

**Files:**
- Create: `src/lib/money/money.ts`, `src/lib/money/money.test.ts`, `docs/migration/money-audit.md`

**Interfaces:** Produces in `src/lib/money/money.ts`:
`toMinor(amount: number | string): number` returns the amount in integer hundredths (`1500.5` becomes `150050`); it throws `RangeError` for non-finite numbers, empty strings, strings with thousands separators or exponents, and amounts with more than two decimal places beyond a `1e-6` float tolerance (no silent rounding policy is invented).
`fromMinor(minor: number): string` returns a plain decimal string with two decimals (`150050` becomes `"1500.50"`); throws `RangeError` for non-integers.
`sumMinor(values: number[]): number` returns the integer sum.

- [ ] **Step 1: Write failing tests:** `toMinor(0.1) + toMinor(0.2) === toMinor(0.3)` and equals `30`; `toMinor(0.1 + 0.2) === 30`; `toMinor('1500.50') === 150050`; `toMinor('10.1') === 1010`; `toMinor('-5.25') === -525`; `toMinor('-0')` is `0` (not `-0`: `Object.is(...,0)`); `toMinor(1.005)` throws; `toMinor(NaN)`, `toMinor('')`, `toMinor('1,500.50')`, `toMinor('1e3')` throw; `fromMinor(150050) === '1500.50'`; `fromMinor(-525) === '-5.25'`; `fromMinor(1.5)` throws; `sumMinor([toMinor(0.1), toMinor(0.2)]) === 30`; `sumMinor([]) === 0`.
- [ ] **Step 2:** `yarn vitest src/lib/money` fails.
- [ ] **Step 3:** Implement with string parsing for the string branch and a tolerance check on `amount * 100` for the number branch; no library.
- [ ] **Step 4:** Tests pass.
- [ ] **Step 5:** Audit (read-only): `git grep -nE "parseFloat|Number\(|\.toFixed|reduce\(" -- 'src/**/*.ts' 'src/**/*.tsx'` filtered to lines mentioning `amount|debit|credit|balance|total|price|tax`. Write `docs/migration/money-audit.md` as a table `file:line | expression | risk (display only / arithmetic) | owning milestone`. Do not change any call site in M0.
- [ ] **Step 6:** Commit: `feat(lib): add integer money helper and money arithmetic audit`.

### Task 11: CI, templates, branch policy as code, docs

**Files:**
- Modify: `.github/workflows/pr-check.yml`, `.github/workflows/deploy.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.codex/PROJECT_CONTEXT.md`, `.codex/workflows/feature-refactor.md`, `README.md`
- Create: `.github/branch-protection/{main-frontend,staging,develop-frontend}.json`, `.github/branch-protection/README.md`, `docs/README.md`, `docs/architecture.md`, `docs/conventions.md`, `docs/branching-and-release.md`, `docs/adr/0001-english-naming.md`, `docs/adr/0002-feature-sibling-modules.md`, `docs/adr/0003-single-http-client.md`, `docs/adr/0004-release-per-milestone.md`, `docs/adr/0005-integer-money-and-localstorage-tokens.md`, `docs/modules/README.md`, `docs/petty-cash/`

- [ ] **Step 1: `pr-check.yml`:** trigger on PRs to `develop-frontend`, `staging`, `main-frontend`. Steps in order: checkout with `fetch-depth: 0`, Node 20, corepack, `yarn install --immutable`, `yarn typecheck`, `npm run lint`, `node scripts/prettierChanged.mjs origin/${{ github.base_ref }}`, `yarn vitest --run` (remove `continue-on-error`), `yarn build`. Job id stays `test-and-build`.
- [ ] **Step 2: `deploy.yml`:** add job `guard` (permissions `contents: read`, `pull-requests: read`) that calls `gh api repos/${{ github.repository }}/commits/${{ github.sha }}/pulls` and fails unless one returned PR is merged and matches: base `main-frontend` with head `staging` or `hotfix/*`; base `staging` with head `develop-frontend` or `hotfix/*`. `build-and-deploy` gets `needs: guard`. Do not touch the SSH step (its failure is recorded, not fixed here).
- [ ] **Step 3: Branch policy as code:** copy the three protection payloads applied on 2026-10-29 (`main-frontend` 1 approval; `staging` and `develop-frontend` 0; all `enforce_admins: true`, no force push, no deletion, conversation resolution required) into `.github/branch-protection/`, and document the `gh api -X PUT repos/<org>/jurnal-fe/branches/<branch>/protection --input <file>` command in its README. After this PR's first CI run is green, add `"required_status_checks": {"strict": true, "contexts": ["test-and-build"]}` to all three files and re-apply them (ask before applying).
- [ ] **Step 4: PR template:** replace the module checklist with the target module list from spec 4.3 and 4.4; add a release-gate checklist for PRs into `main-frontend` (typecheck, lint ratchet, tests, build green; staging smoke of login, chart of accounts, journal entry, cash and bank, reports, sales; `docs/migration/STATUS.md` updated; no unintended behavior change).
- [ ] **Step 5: Docs content:** `docs/README.md` indexes everything. `architecture.md`: layers, dependency direction, state ownership, HTTP flow, how guardrails map to rules. `conventions.md`: spec section 5 with one real example per row. `branching-and-release.md`: spec section 10 plus the hotfix flow and the weekly sync. ADRs 0001 to 0005 record the decisions (English naming; sibling modules; single HTTP client; release per milestone; integer money and refresh tokens kept in `localStorage` with the XSS trade-off noted and no change made). `docs/modules/README.md` lists every current module with a link placeholder to its future README row in `STATUS.md`.
- [ ] **Step 6: `PROJECT_CONTEXT.md`:** add sections "Module structure", "Naming (English, kebab-case folders)", "Boundaries enforced by lint", "Ratchet workflow (lowering `eslint-baseline.json`)", and "Money helper"; keep every existing rule. In the brand-neutrality rule replace the list of competitor names with "any competitor brand". Update `feature-refactor.md` to point at the per-feature procedure and Definition of Done in the spec (section 8.1). Add a docs link block to `README.md` (do not rewrite its product text).
- [ ] **Step 7: Petty-cash docs:** the root and `docs/` PDF pairs are byte-identical (verified by `shasum` on 2026-10-29). `mkdir docs/petty-cash`; move `docs/API-SPEC-Petty-Cash-Backend.md`, `docs/API-SPEC-Petty-Cash-Backend.pdf`, `docs/PRD-Petty-Cash-Jurnal-ProApps.pdf` into it; re-run `shasum` on the two root PDFs against the moved copies and remove each root copy only if the hashes match. Leave `docs/superpowers/plans/petty-cash-prd.md` (empty) untouched and mention it in the PR.
- [ ] **Step 8:** Verify: `yarn typecheck`, `npm run lint`, `yarn vitest`, `yarn build` pass; `git grep -niE "mekari|accurate|zahir|quickbooks|xero|\bsap\b" -- . ':!.yarn' ':!docs/superpowers/specs'` prints nothing; markdown links in `docs/README.md` resolve (`git ls-files` check for each linked path).
- [ ] **Step 9:** Commit in three commits: `ci: gate PRs and deploy order`, `docs: add architecture, conventions, ADRs and module index`, `docs(petty-cash): move product and API specs under docs`.

### Task 12: Final verification and handoff

- [ ] **Step 1:** Run the full gate and record outputs: `yarn typecheck`, `npm run lint` (ratchet and stylelint), `node scripts/prettierChanged.mjs origin/develop-frontend`, `yarn vitest --run`, `yarn build`. All must exit 0.
- [ ] **Step 2:** Update `docs/migration/BASELINE.md` with an "After M0" table (same commands, new numbers) and mark M0 complete in `docs/migration/STATUS.md`.
- [ ] **Step 3:** `git diff origin/develop-frontend --stat`; review for accidental changes (no feature file other than import-path edits from Task 8; no secrets).
- [ ] **Step 4:** Ask the user before `git push -u origin chore/m0-foundation` and before opening the PR into `develop-frontend`. After merge and the first green run, ask before applying the required-status-check protection files.
