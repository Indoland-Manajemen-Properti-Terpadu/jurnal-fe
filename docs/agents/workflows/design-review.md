# Design Review Workflow

1. Inspect the matching screen or flow on the [Jurnal ProApps UI reference](https://jurnalproapps.vercel.app) (navigate via the UI menus rather than URLs, and check role-specific views via **"Lihat sebagai"** in the footer when relevant), then inspect the existing page, shared components, and local theme. Include shared navigation and layout when affected.
2. Compare the implementation with the reference's page structure, visual hierarchy, controls, interaction states, responsive behavior, and copy (using `jurnal-fe`'s existing theme tokens and adjusting `i18n` where needed). The matching reference screen takes precedence over generic layouts in [ui-guidelines.md](../../ui-guidelines.md); use those layouts where the reference has no equivalent.
3. Verify alignment with the **Product Vision** (approachable, human-centric, zero-anxiety accounting for non-accountants and skeptics) and **The 6 Golden Rules of Accounting UI/UX** defined in [ui-guidelines.md](../../ui-guidelines.md).
4. Compare the implementation with the project context's Mantine v8, Tailwind, typography, icon, accessibility, and responsive rules.
5. Check loading, empty, error, and populated states, plus keyboard use, visible focus, and accessible names for interactive controls.
6. Verify live visual feedback: does the user immediately see the financial cause-and-effect of their input (balance indicators, difference badges, live preview cards)?
7. Report concrete mismatches and user impact. Do not invent new design tokens or change shared tokens outside the approved scope. If a UI mismatch stems from a backend API difference, flag it for confirmation or mention the relevant Jira owner (Raga: UI/UX, PM, QA; Aldi & Zaki: backend, Zaki also handles frontend). If the reference is inaccessible or has no equivalent screen, record that and do not claim visual verification.

