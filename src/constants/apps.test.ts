import { describe, expect, it } from 'vitest';
import { APP_CATALOG } from '@/constants/apps';

describe('APP_CATALOG', () => {
  it('has exactly one app that is the one in use', () => {
    expect(APP_CATALOG.filter((app) => app.current)).toHaveLength(1);
  });

  it('gives every other app a secure address, and the current one none', () => {
    APP_CATALOG.forEach((app) => {
      if (app.current) expect(app.href).toBeUndefined();
      else expect(app.href).toMatch(/^https:\/\//);
    });
  });

  it('names each app once', () => {
    const ids = APP_CATALOG.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists ProApps, the property management product, at proapps.id', () => {
    expect(APP_CATALOG.find((app) => app.id === 'proapps')?.href).toBe('https://proapps.id');
  });

  it('gives every app a logo, which may be the same file for now', () => {
    APP_CATALOG.forEach((app) => expect(app.logo).toBeTruthy());
  });
});
