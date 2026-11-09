# production

Placeholder module for production. It renders the shared `PlannedModulePage` (header and planned scope, copy in the `plannedModules` namespace); there is no domain logic, endpoint or state yet.

- **Route:** `routes.production.main` (see `src/router/routes.ts`)
- **Page:** `presentation/pages/ProductionPage.tsx`, exported from `index.ts`
- **i18n namespace:** `production` (`id` primary, `en`)
- **Endpoints / state:** none
- **Known gaps:** the feature itself awaits a product decision; replace the placeholder page when it is specified.
