# Test Authoring Workflow

1. Confirm tests are part of the requested scope and inspect the repository's existing test setup and nearby examples.
2. Prefer tests for observable behavior, domain rules, use cases, API mapping, and important user interactions. Avoid implementation-detail assertions.
3. Use the existing Vitest and React Testing Library setup where appropriate. Keep fixtures representative and avoid inventing API guarantees.
4. Cover the relevant success, boundary, and failure behavior without adding arbitrary coverage targets.
5. Run the agreed test command and report its exact result. Do not add or run unrelated tests.
