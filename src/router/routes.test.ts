import { matchRoutes } from 'react-router-dom';
import { router } from './index';
import { routes } from './routes';

const collectPaths = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectPaths);
  return [];
};

// Constants that exist in routes.ts but have no page behind them and no references in src.
// They are listed here, not silently skipped, so a new orphan fails the test.
// Decide in the milestone that owns each module whether to build the page or delete the constant.
const KNOWN_ORPHANS = new Set(['/setting-budget/budget-IS', '/result-reports/business-overview']);

const concretePaths = [...new Set(collectPaths(routes))]
  .filter((path) => path !== '*' && !KNOWN_ORPHANS.has(path))
  .map((path) => path.replace(/:[A-Za-z]+/g, 'x'));

describe('route manifest', () => {
  it.each(concretePaths)('%s resolves to a real page, never the catch-all', (path) => {
    const matches = matchRoutes(router.routes, path);

    expect(matches).not.toBeNull();
    expect(matches?.at(-1)?.route.path).not.toBe('*');
  });
});
