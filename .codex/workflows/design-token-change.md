# Design Token Change Workflow

1. Confirm the requested token change and inspect the current theme implementation (`src/theme/tokens/`, see [`docs/design-system.md`](../../docs/design-system.md#changing-or-adding-a-token)) and existing consumers.
2. Verify the intended value against the current approved design source. If the reference cannot be accessed or is ambiguous, report that and do not fabricate a token value.
3. Explain affected tokens, consumers, and compatibility risks before changing a shared token.
4. Update the existing theme source and only the consumers needed for the approved scope. Do not create a parallel token system.
5. Perform the agreed visual or code verification and report any unchecked surfaces.
