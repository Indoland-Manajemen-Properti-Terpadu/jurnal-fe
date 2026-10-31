import { matchRoutes } from 'react-router-dom';
import { router } from './index';
import { routes } from './routes';

type RedirectProps = { to?: string; replace?: boolean };

const elementOf = (matches: ReturnType<typeof matchRoutes>) => {
  const route = matches?.at(-1)?.route as { element?: { props?: RedirectProps } } | undefined;
  return route?.element;
};

describe('legacy route redirects', () => {
  it('keeps /pembelian as a legacy path that differs from the new route', () => {
    expect(routes.legacyPaths.purchases).toBe('/pembelian');
    expect(routes.purchases.main).toBe('/purchases');
  });

  it('renders a redirect element to /purchases for /pembelian', () => {
    const matches = matchRoutes(router.routes, '/pembelian');
    const element = elementOf(matches);

    expect(element?.props?.to).toBe('/purchases');
    expect(element?.props?.replace).toBe(true);
  });

  it('serves /purchases with the page, not a redirect', () => {
    const matches = matchRoutes(router.routes, '/purchases');
    const element = elementOf(matches);

    expect(matches).not.toBeNull();
    expect(element?.props?.to).toBeUndefined();
  });

  it('redirects the misspelled business-sumary report URL to business-summary', () => {
    expect(routes.legacyPaths.reportsBusinessSumary).toBe(
      '/result-reports/business-overview/business-sumary'
    );
    expect(routes.reports.businessSummary).toBe(
      '/result-reports/business-overview/business-summary'
    );

    const element = elementOf(matchRoutes(router.routes, routes.legacyPaths.reportsBusinessSumary));

    expect(element?.props?.to).toBe(routes.reports.businessSummary);
    expect(element?.props?.replace).toBe(true);
  });

  it('serves the business-summary report with the page, not a redirect', () => {
    const element = elementOf(matchRoutes(router.routes, routes.reports.businessSummary));

    expect(element).toBeDefined();
    expect(element?.props?.to).toBeUndefined();
  });

  it.each([
    ['/kontak', '/contact'],
    ['/asset', '/assets'],
    ['/settings/approval-setting', '/pending-changes'],
  ])('redirects %s to %s with replace', (legacy, current) => {
    const element = elementOf(matchRoutes(router.routes, legacy));

    expect(element?.props?.to).toBe(current);
    expect(element?.props?.replace).toBe(true);
  });

  it('lists every old URL in legacyPaths with its redirect registered', () => {
    const registered = Object.values(routes.legacyPaths).map(
      (path) => matchRoutes(router.routes, path)?.at(-1)?.route.path
    );

    expect(registered).toEqual(Object.values(routes.legacyPaths));
  });
});
