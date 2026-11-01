# Design Review Workflow

1. Inspect the existing page, shared components, local theme, and current design references before proposing changes.
2. Verify alignment with the **Product Vision** (approachable, human-centric, zero-anxiety accounting for non-accountants and skeptics) and **The 6 Golden Rules of Accounting UI/UX** defined in [ui-guidelines.md](../../ui-guidelines.md).
3. Ensure page strictly adheres to either **Standard A (Listing/Master Data)** or **Standard B (Form/Transaction 8/4 Grid)**. Reject bespoke divergent layouts.
4. Compare the implementation with the project context's Mantine v8, Tailwind, typography, icon, accessibility, and responsive rules.
5. Check loading, empty, error, and populated states, plus keyboard use, visible focus, and accessible names for interactive controls.
6. Verify live visual feedback: does the user immediately see the financial cause-and-effect of their input (balance indicators, difference badges, live preview cards)?
7. Report concrete mismatches and user impact. Do not invent new design tokens or change shared tokens outside the approved scope.

