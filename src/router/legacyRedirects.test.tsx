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
    expect(routes.baseModules.legacyPurchases).toBe('/pembelian');
    expect(routes.baseModules.purchases).toBe('/purchases');
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
});
