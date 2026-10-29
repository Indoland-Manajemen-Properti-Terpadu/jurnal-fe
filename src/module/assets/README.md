# assets

Fixed asset register: list, filter and sort assets, add or edit an asset with a live depreciation preview, view the yearly depreciation schedule, dispose of (sell) an asset and delete it. The data is a browser-only prototype stored in `localStorage`; there is no backend yet.

- **Routes:** `routes.baseModules.assets` (`/assets`), `routes.baseModules.assetMaster` (`/asset`) and `routes.baseModules.assetDetail` (`/assets/:id`), unchanged. The router wraps `AssetPage` and `AssetDetailPage` in `AppShellLayout` (the pages do not render it), so `AppShellLayout -> Navbar -> ... -> page` cannot become an import cycle.
- **Public API (`index.ts`):** `AssetPage`, `AssetDetailPage`.
- **Endpoints:** none.
- **Storage:** key `jurnal_fixed_assets_data` (unchanged), value is a JSON array of `AssetItem` (unchanged shape). `infrastructure/localStorageAssetRepository.ts` implements the `AssetRepository` port (`domain/assetRepository.ts`); the seed lives in `infrastructure/assetSeed.ts`. On load, depreciation, net book value and status of every non-disposed asset are recalculated for today.
- **State:** `presentation/hooks/useAssets.ts` holds the list in React state and writes each change through the repository; `useAssetForm.ts` owns the form state, validation and preview.

## Domain rules (`domain/`)

- `depreciation.ts`: accumulated depreciation and net book value to date (straight line by month, double declining by year with a partial year), the yearly schedule, the form's yearly and monthly estimate, disposal gain or loss (`price - net book value`), percentages, totals for the stat cards (disposed assets are excluded) and status resolution (`fully_depreciated` when net book value reaches the residual value, `disposed` is kept).
- `assetMutations.ts`: build, update and dispose an `AssetItem` from form values.
- `assetFilters.ts`: category counts, category and text filter (name, code, notes) and sort.
- Rounding policy: depreciation amounts are rounded to whole rupiah with `Math.round`, exactly as displayed before. Sums (stat cards) and the disposal gain or loss run in integer minor units through `@/lib/money`; a value with sub-cent precision is first rounded half up to the cent per line, so a disposal of `0.3` against a book value of `0.1` is `0.20` and not `0.19999999999999998`. Whole-rupiah data gives the same results as before.

## i18n

Namespace `assets` (`id` primary, `en`), reused and completed. `src/i18n/locales/assets.test.ts` checks identical keys, placeholders and no empty values.

## Known gaps

- A fractional useful life (for example 2.5 years) produces a schedule of whole years only (2 rows) that never reaches the residual value; the accumulated figure to date uses 30 months. Kept as is (characterized in `depreciation.test.ts`).
- Category `other` had no label key before; it now reads "Lainnya" / "Other".
- Dates use the fixed `id-ID` format regardless of the selected language.
- A failed `localStorage` write is silent (the in-memory list still changes); the former `console.error` calls were removed.
- Moving to a backend means a new `AssetRepository` adapter and TanStack Query hooks.
