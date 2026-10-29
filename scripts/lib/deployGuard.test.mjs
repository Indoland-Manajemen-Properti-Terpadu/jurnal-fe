import { describe, expect, it } from 'vitest';
import { isAllowedPromotion } from './deployGuard.mjs';

const merged = (base, head) => ({ base, head, merged_at: '2026-10-29T00:00:00Z' });

describe('isAllowedPromotion', () => {
  it('allows staging into main-frontend', () => {
    expect(isAllowedPromotion('main-frontend', [merged('main-frontend', 'staging')])).toBe(true);
  });

  it('allows a hotfix branch into main-frontend and into staging', () => {
    expect(isAllowedPromotion('main-frontend', [merged('main-frontend', 'hotfix/x')])).toBe(true);
    expect(isAllowedPromotion('staging', [merged('staging', 'hotfix/x')])).toBe(true);
  });

  it('allows develop-frontend into staging', () => {
    expect(isAllowedPromotion('staging', [merged('staging', 'develop-frontend')])).toBe(true);
  });

  it('allows the hotfix back-merge main-frontend into staging', () => {
    expect(isAllowedPromotion('staging', [merged('staging', 'main-frontend')])).toBe(true);
  });

  it('rejects develop-frontend straight into main-frontend', () => {
    expect(isAllowedPromotion('main-frontend', [merged('main-frontend', 'develop-frontend')])).toBe(
      false
    );
  });

  it('rejects a direct push (no associated PR)', () => {
    expect(isAllowedPromotion('main-frontend', [])).toBe(false);
  });

  it('rejects a PR that was not merged', () => {
    const open = { base: 'main-frontend', head: 'staging', merged_at: null };
    expect(isAllowedPromotion('main-frontend', [open])).toBe(false);
  });

  it('rejects a PR whose base is a different branch', () => {
    expect(isAllowedPromotion('main-frontend', [merged('staging', 'develop-frontend')])).toBe(
      false
    );
  });

  it('rejects an unknown branch', () => {
    expect(isAllowedPromotion('feature/x', [merged('feature/x', 'staging')])).toBe(false);
  });
});
