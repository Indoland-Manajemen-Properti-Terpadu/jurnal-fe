# ADR 0003: One HTTP client

**Status:** Accepted, 2026-10-29

## Context
Two Axios instances existed. `src/services/apiClient.ts` (now `src/lib/http/apiClient.ts`) had the interceptors (Bearer token, 401 refresh queue, loading bar); `src/lib/axios.ts` was an unused plain instance. The legacy helpers swallowed errors by returning `error.response` or `null`.

## Decision
`src/lib/http/apiClient.ts` is the only client and is called from `infrastructure/` only (lint-enforced). The unused instance is deleted. The legacy helpers are `@deprecated` and keep their behavior until each feature migrates; migrated code handles errors explicitly.

## Consequences
Changing the helpers to throw is a behavior change and is done per feature, with error states in the UI.
