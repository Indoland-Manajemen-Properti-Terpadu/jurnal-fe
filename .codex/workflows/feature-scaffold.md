# Feature Scaffold Workflow

1. Confirm the feature's user-facing outcome, supported languages, route/access needs, API contract, and accounting rules from an approved source. Do not invent missing details.
2. Inspect existing feature boundaries and shared components before choosing the structure.
3. For a new or substantially changed feature, use the pragmatic Clean Architecture boundaries in [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md): `domain`, `application`, `infrastructure`, and `presentation`. Create only folders that have a real responsibility.
4. Define domain types and repository ports inward; implement API DTOs, mappers, and concrete adapters in infrastructure; keep use cases independent of React and network libraries.
5. Keep pages and components focused on rendering and user intent. Adapt use cases to React and TanStack Query in presentation hooks. Use Zustand only for shared client state.
6. Add route wiring and focused verification only as part of the approved feature scope. Do not scaffold speculative CRUD fields, endpoints, screens, barrels, or empty layers.
7. Implement user interfaces strictly adhering to the **Product Vision** and **Canonical Feature Page Layout Standard** (Standard A for listing pages, Standard B for form/transaction pages) and **The 6 Golden Rules of Accounting UI/UX** defined in [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).
