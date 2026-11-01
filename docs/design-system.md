# Design System

How Jurnal ProApps is styled: the tokens, where they live, and the rules for using them. Product vision, page layouts, icons and empty states are in [ui-guidelines.md](ui-guidelines.md).

## Principles

1. **One source of truth.** Every colour, size, radius, shadow, duration and z-index is a token in `src/theme/tokens/`. The Mantine theme and every `--jurnal-*` CSS variable are generated from those files.
2. **Mantine first.** Reach for a Mantine prop (`c="primary"`, `p="md"`, `radius="lg"`, `fz="sm"`) before a CSS module, and a CSS module before inline `style`.
3. **Light only, Figtree only.** The app forces the light scheme and uses Figtree at 400/500/600/700.
4. **Readable numbers.** Money and quantities use tabular figures so columns line up.

## Where things live

```text
src/theme/
  tokens/
    palette.ts        raw colour scales (the only hex values, with colors.ts)
    colors.ts         brand colours, semantic roles, gradients
    typography.ts     font family, weights, size scale, headings, text styles
    spacing.ts        4px grid and Mantine spacing names
    radius.ts         Mantine radius scale, default radius
    shadows.ts        elevation
    motion.ts         durations and easings
    layers.ts         z-index scale
    breakpoints.ts    responsive breakpoints (mirrored in postcss.config.cjs)
    units.ts          toRem, mapTokens
    index.ts          barrel
  mantineTheme.ts       createTheme(): tokens + app-wide component defaults
  components.module.css class overrides that mantineTheme.ts attaches via classNames
  cssVariables.ts       cssVariablesResolver: emits every --jurnal-* variable
  index.ts              public API, import from '@/theme'
  mantine.d.ts          adds `primary` / `secondary` to Mantine's colour types
src/styles/
  fonts.css           loads Figtree
  global.css          @layer order, Tailwind (no preflight), body, scrollbar, mantine-datatable
```

`App.tsx` imports the Mantine stylesheets first, then `fonts.css` and `global.css`, and passes `theme={myTheme}` and `cssVariablesResolver={cssVariablesResolver}` to `MantineProvider`. Storybook does the same.

## Tokens

### Colour

Mantine colours: every scale in `palette.ts` (Tailwind v3 hues plus the brand `primary` and `secondary`) is a Mantine colour, so `c="gray.6"` and `themeColors.gray[6]` work. Index 0..9 is shade 50..900. `primaryShade` is 6, so `color="primary"` means `#053079`.

Semantic roles, emitted as `--jurnal-color-<role>`:

| Role                                | Value                   | Use for                                  |
| ----------------------------------- | ----------------------- | ---------------------------------------- |
| `primary`                           | primary 600 `#053079`   | brand actions, links, active states      |
| `primary-subtle`                    | primary 50              | selected rows, brand tints               |
| `secondary`                         | secondary 600 `#09B2FF` | accents only; 2.4:1 on white, never text |
| `text-primary`                      | gray 900                | body text, headings                      |
| `text-secondary`, `text-muted`      | gray 500                | descriptions, captions, placeholders     |
| `text-on-brand`                     | white                   | text on `primary` fills                  |
| `surface`                           | white                   | cards, tables, modals                    |
| `surface-hover` / `bg-subtle`       | gray 50                 | row hover, table header, page tint       |
| `surface-muted`                     | gray 100                | inset areas, scrollbar track             |
| `border-subtle` / `border-muted`    | gray 200                | dividers, card borders                   |
| `border-strong`                     | gray 400                | emphasised dividers                      |
| `success` `warning` `danger` `info` | green/amber/red/sky 500 | icons, dots, fills, borders              |
| `*-subtle`                          | the same hue at 50      | feedback backgrounds                     |
| `*-strong`                          | the same hue at 700     | feedback **text**                        |

Gradients: `--jurnal-gradient-brand` (90deg primary to secondary 900), `--jurnal-gradient-brand-diagonal` (200deg), `--jurnal-gradient-brand-overlay` (transparent to primary 800). For Mantine's `variant="gradient"` use `gradientColors.gradient`.

### Typography

Font: `--jurnal-font-family` = `Figtree, sans-serif`. Weights: `--jurnal-font-weight-{regular|medium|semibold|bold}` = 400/500/600/700.

| Size    | rem (px)      | Line height    | Mantine                | CSS                   |
| ------- | ------------- | -------------- | ---------------------- | --------------------- |
| xs      | 0.75 (12)     | 16px           | `fz="xs"`              | `--jurnal-text-xs`    |
| sm      | 0.875 (14)    | 20px           | `fz="sm"`              | `--jurnal-text-sm`    |
| md      | 1 (16)        | 24px           | `fz="md"`              | `--jurnal-text-md`    |
| lg      | 1.125 (18)    | 28px           | `fz="lg"`              | `--jurnal-text-lg`    |
| xl      | 1.25 (20)     | 28px           | `fz="xl"`              | `--jurnal-text-xl`    |
| 2xl     | 1.5 (24)      | 30px           | `<Title order={5}>`    | `--jurnal-text-2xl`   |
| 3xl     | 2 (32)        | 38px           | `<Title order={4}>`    | `--jurnal-text-3xl`   |
| 4xl-6xl | 2.5 / 3 / 3.5 | 48 / 58 / 68px | `<Title order={3..1}>` | `--jurnal-text-4xl`.. |

Line heights are also emitted as `--jurnal-leading-<size>`. Mantine's `<Text size>` keeps its own unitless line heights (1.4 to 1.65) so existing text does not reflow.

Headings h1..h6 are semibold with slightly negative tracking; use `<Title order>`. For one-off text in TSX, spread a text style from `@/theme`: `textStyles.body`, `bodySm`, `bodyXs`, `bodyLg`, `label`, `labelLg`, `labelSm`, `caption`, `numeric`, or `headingStyles.h1..h6`.

### Spacing (4px grid)

| Token          | px                 | Mantine name | CSS                                           |
| -------------- | ------------------ | ------------ | --------------------------------------------- |
| `space[1]`     | 4                  |              | `--jurnal-space-1`                            |
| `space[2]`     | 8                  | `xs`         | `--jurnal-space-2`                            |
| `space[3]`     | 12                 | `sm`         | `--jurnal-space-3`                            |
| `space[4]`     | 16                 | `md`         | `--jurnal-space-4`                            |
| `space[5]`     | 20                 | `lg`         | `--jurnal-space-5`                            |
| `space[6]`     | 24                 | `xl`         | `--jurnal-space-6`                            |
| `space[7..16]` | 28, 32, 40, 48, 64 |              | `--jurnal-space-7`, `-8`, `-10`, `-12`, `-16` |

`--jurnal-spacing-{xs|sm|base|md|lg|xl|2xl|3xl|4xl}` (8..48px) are legacy aliases kept for existing CSS. Their names are offset from Mantine's (`--jurnal-spacing-md` is 20px, `p="md"` is 16px), so new CSS uses `--jurnal-space-<n>`.

### Radius, shadow, motion, layers, breakpoints

| Group      | Tokens                                                                                              | CSS                                         |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Radius     | `xs` 2, `sm` 4, **`md` 8 (default)**, `lg` 16, `xl` 32 px                                           | `--mantine-radius-<name>`                   |
| Shadow     | `xs`..`xl`, soft black alpha                                                                        | `--mantine-shadow-<name>`                   |
| Duration   | `fast` 150ms (hover, focus), `normal` 250ms, `slow` 350ms                                           | `--jurnal-duration-<name>`                  |
| Easing     | `standard` (ease), `enter` (decelerate), `exit` (accelerate)                                        | `--jurnal-ease-<name>`                      |
| z-index    | `base` 0, `raised` 1, `sticky` 10, `app` 100, `modal` 200, `popover` 300, `overlay` 400, `max` 9999 | `--jurnal-z-<name>`                         |
| Breakpoint | `xs` 36em, `sm` 48em, `md` 62em, `lg` 75em, `xl` 88em                                               | `$mantine-breakpoint-<name>` in CSS modules |

`--jurnal-radius-{sm|md|lg|xl|2xl|3xl|full}` (2, 4, 8, 12, 16, 24, 999px) are legacy aliases with offset names (`--jurnal-radius-md` is 4px); new CSS uses `--mantine-radius-*`, which matches the `radius` prop. The z-index values from `app` to `overlay` equal Mantine's `getDefaultZIndex()`.

## Rules

**Do**

- Use Mantine props with token names: `c="primary"`, `bg="gray.0"`, `p="md"`, `gap="lg"`, `radius="lg"`, `fz="sm"`, `fw={600}`, `shadow="sm"`.
- In CSS modules, use variables: `var(--jurnal-color-*)`, `var(--jurnal-text-*)`, `var(--jurnal-space-*)`, `var(--mantine-radius-*)`, `var(--mantine-shadow-*)`, `var(--jurnal-duration-fast) var(--jurnal-ease-standard)`.
- In TSX, when a prop will not do, import from `@/theme`: `themeColors.gray[6]`, `colorRoles.textSecondary`, `textStyles.label`, `layers.modal`.
- Use media queries with `$mantine-breakpoint-*` or Mantine's responsive props (`p={{ base: 'md', sm: 'xl' }}`).
- Show money and counts with tabular figures: `font-variant-numeric: tabular-nums` in CSS, `style={textStyles.numeric}` in TSX, right-aligned in tables.
- Inherit the font. A component never sets `ff`; when CSS must name it, use `var(--jurnal-font-family)`.

**Don't**

- Hex, `rgb()` or named colours outside `src/theme/tokens/` (hex only in `palette.ts` and `colors.ts`). Use `var(--mantine-color-<scale>-<0..9>)` for a palette shade (0 is 50, 9 is 900), and `color-mix(in srgb, var(--mantine-color-primary-6) 12%, transparent)` for a translucent one. A colour the API stores (tag colours) comes from `palette` in TS, never from a literal.
- Pixel font sizes (`font-size: 13px`, `fz={13}`): pick a size from the scale (`xs` 12, `sm` 14, `md` 16, `lg` 18, `xl` 20, `2xl` 24, `3xl` 32). Fluid `clamp()` display sizes are the only exception. `src/theme/noHardcodedStyles.test.ts` fails the build on a hex, `rgb()` or px font size outside `src/theme`.
- Spacing or radius off the 4px grid, or raw `z-index` numbers.
- Declaring a `--jurnal-*` variable anywhere except `cssVariables.ts` (a test fails if you do).
- A second token file, a new global stylesheet, `!important` against Mantine, or a dark-mode branch.
- Feedback base colours (`success`, `warning`, `danger`, `info`) or `secondary` as text on white: use the `*-strong` roles.

## Accessibility: contrast

Every pair below meets WCAG 2.x AA and is checked by `src/theme/contrast.test.ts`.

| Foreground on background                   | Ratio       | Passes                    |
| ------------------------------------------ | ----------- | ------------------------- |
| text-primary on surface / surface-muted    | 17.7 / 16.1 | AA text                   |
| text-secondary on surface / bg-subtle      | 4.83 / 4.63 | AA text                   |
| primary on surface / primary-subtle        | 12.3 / 11.5 | AA text                   |
| text-on-brand (white) on primary           | 12.3        | AA text                   |
| success-strong on surface / success-subtle | 5.02 / 4.79 | AA text                   |
| warning-strong on surface / warning-subtle | 5.02 / 4.84 | AA text                   |
| danger-strong on surface / danger-subtle   | 6.47 / 5.91 | AA text                   |
| info-strong on surface / info-subtle       | 5.93 / 5.57 | AA text                   |
| danger on surface                          | 3.76        | icons and large text only |

These fail AA for text and must not carry meaning alone: success 2.28, warning 2.15, info 2.77, secondary 2.38 and border-strong 2.54, all on white. Pair them with an icon, a label or a `*-strong` text colour.

## Changing or adding a token

Follow [`agents/workflows/design-token-change.md`](agents/workflows/design-token-change.md). In code:

1. Edit the value in `src/theme/tokens/<group>.ts`. A colour goes in `palette.ts`; give it a role in `colors.ts` if components need it by meaning.
2. If CSS needs it, check that its group is in `jurnalCssVariables` (`cssVariables.ts`); groups are emitted automatically as `--jurnal-<group>-<kebab-name>`.
3. If Mantine needs it, wire it in `mantineTheme.ts`.
4. Breakpoints: change `breakpoints.ts` and `postcss.config.cjs` together.
5. Run `yarn vitest --run src/theme`, then add the contrast pair to `contrast.test.ts` and the table above if the token is a text or background colour.

Never rename or delete a `--jurnal-*` variable that is still referenced; the CSS variable test lists every reference in `src`.
