# Issue Fix Workflow

1. Read the report, reproduction steps, error output, and relevant environment details. Mark unknowns instead of guessing.
2. Inspect the working tree and trace the failure through the relevant presentation, application, domain, and infrastructure boundaries.
3. State the root cause and a minimal in-scope fix. If the fix requires a broader migration or changes a contract, get the user's approval first.
4. Implement only the approved change and preserve unrelated work.
5. Run verification only when requested or included in the agreed task scope. Report the exact checks and any remaining uncertainty.

Follow [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) for all engineering decisions.
