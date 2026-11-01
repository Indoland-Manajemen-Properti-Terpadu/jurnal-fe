# UI Guidelines

Product vision, UX rules and page layouts for every screen. Tokens, typography, colors and CSS variables are in [design-system.md](design-system.md); translations are in [i18n.md](i18n.md).

## Product vision: user-friendly accounting for non-accountants

The primary mission of Jurnal Proapps is to **demystify accounting and create an extraordinarily approachable, intuitive, and anxiety-free accounting system**.

Traditional accounting software and legacy desktop ledgers are notorious for being rigid, confusing, jargon-heavy, and intimidating to business owners, operators, and staff who are skeptical of complex financial systems. 

**Strict Rule: Brand Neutrality & Zero Competitor Mentions**:
- NEVER mention or refer to any competitor product or company by name anywhere in the codebase, UI, landing pages, marketing copy, comparison matrices, educational resources, tooltips, or agent communications.
- ALWAYS use neutral, professional, generic terms such as "Software Akuntansi Konvensional" / "Conventional Accounting Software", "Software Akuntansi Umum" / "Generalist Systems", or "Sistem Pembukuan Standar".

**Our Core Value Proposition**:
1. **Accounting Without Fear**: Every screen must provide clarity, psychological safety, and clear direction. Users should never feel lost, confused, or worried that a single click might break their company's books.
2. **Instant Cognitive Clarity**: Demystify complex concepts (such as double-entry, contra accounts, depreciation, normal balances) through real-world examples, contextual tooltips, and interactive guidance cards.
3. **Prevention Over Punishment (Poka-Yoke)**: Make invalid states difficult or impossible to enter. Show live balance meters, difference indicators, and real-time verification checklists rather than punishing users with cryptic error dialogs after submission.
4. **Delightful & Modern Polish**: Maintain clean visual hierarchy, generous whitespace, crisp cards, legible typography, and seamless ergonomics (Laws of Design: Proximity, Common Region, Visual Hierarchy, Fitts's Law).

Any agent working on this codebase MUST treat UI/UX not as an afterthought, but as a core functional requirement equal in importance to accounting mathematical correctness.

## UI and accessibility

- Use React 18, Mantine 8, the existing custom Tailwind setup, and the repository's theme tokens. Do not use Mantine v9 APIs or invent a parallel design system.
- Follow the existing Figma references and local theme as the design sources of truth. Prefer existing shared components. Avoid hardcoded colors, spacing, typography, and radius values when a project token exists.
- Use the brand tokens defined in `src/theme/tokens/` (see [design-system.md](design-system.md) for every token and the styling rules): primary `#053079` and secondary `#09B2FF`. Their Mantine shades are derived in the same theme palette; reference `primary` and `secondary` tokens instead of hardcoding hex values in components. Keep semantic feedback colors separate from brand colors (for example, success green and error red).
- Preserve the project's Figtree typography. Use Phosphor icons with `weight="duotone"` in the app shell and Tabler icons in general content, following the established component patterns.
- Preserve the established app-shell navigation behavior; on desktop, the collapsed sidebar uses the existing icon-rail pattern unless the requested product change explicitly alters it.
- Keep styling with the established CSS Modules, Mantine `classNames`, and configured Tailwind patterns. Confirm a Mantine API against the installed v8 version rather than copying examples from another major version.
- Interactive controls need an accessible name, keyboard behavior, visible focus, and a meaningful loading/disabled state where applicable. Data views must handle loading, empty, error, and populated states.
- Master module list and category tabs must follow consistent pill navigation: `<Tabs color="primary" variant="pills" radius="md">` with `leftSection` icons on each tab inside a top `<Paper withBorder radius="lg" p="md">`, positioned above the search bar and data table. Do not use default underline tabs for primary master data navigation.
- Empty State Consistency: Tables and list views MUST NOT unmount the table shell or replace the data frame with disparate raw boxes when filtered or empty. Render the standard `<EmptyState>` component inside `<Table.Tbody><Table.Tr><Table.Td colSpan={...}>` (or the unified table container) so that headers, borders, and pagination structures remain stable. The empty state must feature an informative soft-themed icon orb, concise bold title, descriptive instruction text, and an actionable CTA button where relevant (e.g. "Buat Data Baru").
- **Canonical Feature Page Layout Standard**:
  Use the following layouts as defaults, not decorative checklists. Choose the smallest composition that supports the page's actual decisions and tasks. A page may omit KPI strips, sidebars, guide cards, or tabs when they do not add decision value; visual consistency comes from shared tokens, components, spacing, and interaction behavior rather than repeating every region.
  
  **Standard A: Listing & Master Data Pages (Kontak, Produk, Daftar Akun, Persetujuan Perubahan)**:
  1. **Page Wrapper**: `<AppShellLayout><Box p={{ base: 'md', sm: 'xl' }}><Stack gap="lg">`. Never wrap pages in inconsistent full-width banner wrappers or divergent background boxes.
  2. **Top Bar HeaderNav Mapping**: Register the path prefix in `src/components/HeaderNav/HeaderNav.tsx`'s `SECTION_TITLES` so the breadcrumb displays the proper group (e.g. `TRANSAKSI`, `OPERASIONAL`, `MASTER DATA`) and section title, preventing fallback to generic "PROAPPS / Jurnal".
  3. **Module Header**: Prefer the canonical `<ModuleHeader>` (`src/components/ModuleHeader/ModuleHeader.tsx`) with a bold title, concise description, and right-aligned actions. Use at most one visually primary CTA in the header. Gradient icons and multiple equal-weight buttons are optional and must not compete with the page's main task.
  4. **Decision Metrics**: Add a KPI grid only when each metric changes a user decision. Prefer one cohesive balance/summary surface when values form a single equation or accountability model. Do not repeat the same value across cards, progress bars, badges, and tables.
  5. **Main Content Container**: Wrap tabs, search filter, and data table inside a single unified `<Paper withBorder radius="lg" p="md" bg="white">`.

  **Standard B: Form & Transaction Pages (Tambah Akun, Tambah Transaksi Jurnal, Form Entri)**:
  1. **Page Wrapper & Header**: Same canonical `<AppShellLayout><Box p={{ base: 'md', sm: 'xl' }}><Stack gap="lg">` and `<ModuleHeader>` featuring title, description, and return button (`leftSection={<IconArrowLeft size={16} />}`).
  2. **Top Metrics / Balance Strip**: Use a balance or validation summary only when it helps prevent an error or explains the transaction's effect. Four cards are not a default requirement.
  3. **Responsive Main / Supporting Content Split (`<Grid gutter="lg" align="flex-start">`)**:
     - **Left Column (`span={{ base: 12, lg: 8 }}`)**:
       - Structured into semantic Mantine `Paper` cards (`withBorder radius="md" p="lg" bg="white" shadow="xs"`).
       - Each card starts with a theme icon orb (size 36, light variant), bold 15px section title, and 12px dimmed subtitle (Law of Common Region).
       - Contextual form fields, modern segmented/radio cards for choices, clear placeholders, and instant error feedback.
     - **Right Column (`span={{ base: 12, lg: 4 }}`), when supporting content is necessary**:
       - Optional sticky sidebar (`pos="sticky" top={20}`) containing only content needed during the task:
         - **Interactive Live Preview or Verification Checklist Card**: Live representation of what is being created (e.g. `AccountPreviewCard` with normal balance calculation, or `JournalValidationCard` with real-time pass/fail checks).
         - **Accounting Standards & Tips Card**: Use progressive disclosure for practical rules; do not keep a permanent guide open beside a familiar workflow.
         - **Sticky Actions Card**: Use only when the form is long enough that the submit action would otherwise become difficult to reach.

- **Calm Financial Interface Rules**:
  1. **One Primary Action per Region**: A header, panel, or modal must not present multiple filled or gradient actions with equal visual weight. Secondary operations belong in default/light buttons, a menu, or the relevant task tab.
  2. **Color Budget**: Brand blue and neutral surfaces dominate. Green, amber, and red communicate real success, warning, and failure states only. A normal expense is not an error and must not be rendered red by default.
  3. **Progressive Disclosure**: Put journal previews, accounting education, and advanced configuration behind contextual disclosure unless they are required to complete or verify the current task.
  4. **Financial Event Integrity**: A displayed balance or status changes only after the domain event that legally and operationally causes it. Submission or approval must not imitate payment, posting, settlement, or disbursement.
  5. **Single Navigation Owner**: Nested routes must resolve to one active navigation item using an explicit route hierarchy or most-specific match. Never allow both a parent and sibling leaf to render as selected.
  6. **Responsive Priority, Not Card Stacking**: On small screens preserve the current balance, primary action, status, and task list first. Hide, collapse, or defer supporting explanations instead of merely stacking every desktop card.
  7. **No Fabricated Defaults**: Production forms must not silently submit invented people, receipts, attachments, account numbers, denominations, or financial values. Defaults must be user-authored, contract-derived, or visibly marked example data.

- **The 6 Golden Rules of Accounting UI/UX (Mandatory for Every Agent)**:
  1. **Demystification & In-Context Guidance (Law of Clarity)**: Never present raw accounting jargon without an intuitive explanation and concrete real-world examples. Always provide helper tips or accordion guides.
  2. **Instant Cause-and-Effect Feedback**: Users must see the exact financial effect of their input in real-time (normal balance position, debit vs credit balance, difference badges).
  3. **Poka-Yoke (Mistake-Proofing by Design)**: Prevent impossible financial states in the UI (e.g. mutual exclusion of debit/credit on the same row, auto-suggesting valid account codes, disabling submit with clear tooltips until double-entry balance is achieved).
  4. **Psychological Safety for Skeptics**: Replace feelings of anxiety and headache with reassuring, clean, calm design—clear badges, celebratory "Siap Dibukukan" checks, and generous whitespace.
  5. **Warm, Polite, & Actionable Copy (Bilingual)**: Use clear, professional Bahasa Indonesia as primary, and standard international English as secondary. Never display raw technical error codes, stack traces, or unformatted API responses.
  6. **Coherent Structure**: Never create random bespoke full-screen wrappers, floating bottom bars, or conflicting tab systems. Start from Standard A or B, then omit regions that do not serve the workflow while preserving shared shell, spacing, and component behavior.

- Do not fabricate product claims, accounting data, user identities, or API results in production UI.

## Design references

- Figma color tokens: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-493&m=dev
- Figma text styles: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-4400&m=dev
- Figma spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-5511&m=dev
- Figma radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-6791&m=dev
- Local theme sources: `src/theme/` (tokens, Mantine theme, CSS variables) and `src/styles/` (global CSS, fonts), documented in [design-system.md](design-system.md).
