# PRO-120 Purchase Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the purchasing prototype across dashboard, payables report, and five document lists using BE response fields.

**Architecture:** Extend typed API DTOs and map them at the purchases infrastructure boundary. Render summaries through focused React components and existing query hooks, access checks, translations, and design tokens.

**Tech Stack:** React 18, TypeScript, Mantine 8, TanStack Query 5, CSS Modules, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-26-pro-120-purchase-summary-design.md`

## Global Constraints

- Financial amounts and counts come from the backend.
- Missing role-gated fields hide their sections; present zero values remain visible.
- Retention stays a separate surface.
- Do not introduce dependencies or change backend contracts.

---

### Task 1: Dashboard contract and prototype layout

**Files:** `src/module/purchases/domain/dashboard.ts`, `infrastructure/dashboardApi.ts`, `presentation/components/hub/*`, `presentation/pages/PurchasesPage.tsx`, purchase translations.

**Interfaces:** `getDashboardSummary(): Promise<DashboardSummary>` and `getDashboardActions(): Promise<DashboardActions>` keep their public names. Add typed due groups, top vendors, credits, monthly purchase periods, procurement totals, `actions.oldest`, and action severity/counts.

- [ ] Extend DTO and domain types from the BE handoff; normalize optional report fields without replacing missing values with zero.
- [ ] Render the payables hero, side action rows, server-ordered flow, severity tabs and eight-row pages, and lower report cards with responsive CSS.
- [ ] Verify representative authorized/unauthorized and zero/empty states; review against prototype desktop and mobile.

### Task 2: Single-source payables report

**Files:** `domain/purchaseDocuments.ts`, `infrastructure/purchaseDto.ts`, `presentation/components/reports/usePayablesReport.ts`, `PayablesKpis.tsx`, `PayablesTable.tsx`, `PayableBillsTable.tsx`, `presentation/pages/PayablesReportPage.tsx`.

**Interfaces:** `usePayablesReport({asOf, vendor}, enabled)` returns totals, vendor rows, invoices, precision, and as-of date from one endpoint. `PayableBillsTable` consumes invoice rows as props.

- [ ] Map the report response, preserving its `rows` and `invoices` order and using the report's precision.
- [ ] Replace the two bill-list queries with the report's invoice array, and keep vendor/date/export filters synchronized.
- [ ] Match prototype report cards and tables; verify empty and error states.

### Task 3: Five list summary cards

**Files:** `domain/purchaseCommon.ts`, `infrastructure/purchaseDto.ts`, `purchaseMappers.ts`, `purchaseApi.ts`, `presentation/components/lists/{RequestList,OrderList,ReceiptList,BillList,PaymentRequestList}.tsx`, a shared purchase-list summary card component, purchase translations.

**Interfaces:** `Page<T>` gains an optional, typed `summary` field for each list. The existing `items`, `page`, `limit`, `totalPages`, and `totalResults` remain the row source.

- [ ] Preserve `data.summary` and precision from the list response in the API mapper.
- [ ] Render four cards between list title and search, using each endpoint's four named values; hide them only when summary is absent or access disallows them.
- [ ] Verify zero, empty search, filter/page changes, and requester versus verifier scope against prototype and service responses.

### Task 4: Review and promotion

**Files:** `src/module/purchases/README.md`, `docs/migration/STATUS.md` when release state changes.

- [ ] Review the diff, generated files, access behavior, date and money formatting, and responsive layout.
- [ ] Run focused type/lint/build and meaningful tests for changed mapping and behavior; resolve only in-scope failures.
- [ ] Commit the feature branch, open the develop PR, and promote through staging and main with the repository release gates and the user's prior direct-to-production direction.
