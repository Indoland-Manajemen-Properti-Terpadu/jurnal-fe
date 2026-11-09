/**
 * Rights of the signed-in person, as a separate entry from `index.ts` so shared UI (the app sidebar)
 * can use it without importing the pages, which render that same shell and would close an import cycle.
 */
export { useMyGrants } from './presentation/hooks/useMyGrants';
