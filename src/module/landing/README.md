# landing

Public marketing page for Jurnal ProApps. It presents the product, a live preview mockup, a comparison table, free e-books, testimonials, FAQ and a login call to action.

- **Route:** `routes.landingPage` (`/`, see `src/router/routes.ts`); the login buttons navigate to `routes.login`.
- **Page:** `presentation/pages/LandingPage.tsx`, exported from `index.ts` as `LandingPage`. It only holds state and composes the sections.
- **Endpoints:** none.
- **State:** local React state only (active preview tab, decimal precision, demo sync toggle, e-book modal and email). Nothing is persisted or sent to a server.
- **i18n namespace:** `landing` (`id` primary, `en`), spread over `landing.ts`, `landingPreview.ts`, `landingMarketing.ts` and `landingResources.ts` in each locale. `src/i18n/locales/landing.test.ts` checks that both languages have the same keys, the same `{param}` placeholders and no empty values.
- **Styles:** one shared CSS module, `presentation/pages/LandingPage.module.css`, imported by the sections.

## Sections (`presentation/components`)

`LandingHeader`, `HeroSection` (with `TrustMetricsBar`), `LivePreviewSection` (tabs: `PreviewDashboardTab`, `PreviewSyncTab`, `PreviewSmartJournalTab`, `PreviewBankReconciliationTab`), `DifferentiatorSection`, `ComparisonSection`, `EbooksSection` (data in `ebookData.ts`) with `EbookModal`, `TestimonialsSection` (with `ComplianceBadges`), `FaqSection`, `FinalCtaSection`, `LandingFooter`. `SectionHead` and `previewTypes.ts` are shared helpers.

## Known gaps

- The e-book lead-magnet form only validates that the email contains `@` and shows notifications; no backend sends a link and "Open PDF" downloads nothing.
- All figures, testimonials, ratings and company names are static marketing copy and demo data, not live data.
- Footer links such as privacy policy and terms point to `#top`; there are no pages behind them.
