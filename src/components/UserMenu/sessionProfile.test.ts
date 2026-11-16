import { describe, expect, it } from 'vitest';
import { toSessionProfile } from '@/components/UserMenu/sessionProfile';

describe('toSessionProfile', () => {
  it('reads who is signed in and the site (company) they belong to', () => {
    expect(
      toSessionProfile({
        name: 'budi santoso',
        email: 'budi@example.com',
        role: 'superadmin',
        site: { id: 's1', name: 'Demo Site', external_site_id: '991276' },
      })
    ).toEqual({
      name: 'Budi Santoso',
      email: 'budi@example.com',
      role: 'Superadmin',
      initials: 'BS',
      site: { name: 'Demo Site', code: '991276' },
    });
  });

  it('takes one initial from a one-word name and tolerates missing fields', () => {
    expect(toSessionProfile({ name: 'superadmin' })).toEqual({
      name: 'Superadmin',
      email: '',
      role: '',
      initials: 'S',
      site: undefined,
    });
    expect(toSessionProfile({}).initials).toBe('?');
  });
});
