# Code Review Workflow

Review the requested diff or scope without editing it unless the user asks for fixes. Read [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) and inspect relevant callers and contracts.

Check correctness, financial calculations and rounding, API contract handling, architecture boundaries, state ownership, accessibility, bilingual copy, and regression risk. Report actionable findings first, with severity and file/line references. Distinguish confirmed defects from assumptions, and state verification limits. Do not request cosmetic changes without a maintainability or user-impact reason.
