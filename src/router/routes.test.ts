import { matchRoutes } from 'react-router-dom';
import { router } from './index';
import { routes } from './routes';

const collectPaths = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectPaths);
  return [];
};

const concretePaths = [...new Set(collectPaths(routes))]
  .filter((path) => path !== '*')
  .map((path) => path.replace(/:[A-Za-z]+/g, 'x'));

describe('route manifest', () => {
  it.each(concretePaths)('%s resolves to a real page, never the catch-all', (path) => {
    const matches = matchRoutes(router.routes, path);

    expect(matches).not.toBeNull();
    expect(matches?.at(-1)?.route.path).not.toBe('*');
  });
});

describe('route constants', () => {
  it('never use the same path twice, so a constant has one meaning', () => {
    const paths = collectPaths(routes);

    expect(paths.filter((path, index) => paths.indexOf(path) !== index)).toEqual([]);
  });

  it('keep every group named like a camelCase module and every key camelCase', () => {
    const names = Object.entries(routes).flatMap(([group, value]) =>
      typeof value === 'string' ? [group] : [group, ...Object.keys(value)]
    );

    expect(names.filter((name) => !/^[a-z][A-Za-z0-9]*$/.test(name))).toEqual([]);
  });
});
