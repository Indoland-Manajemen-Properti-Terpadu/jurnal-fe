import { describe, expect, it } from 'vitest';
import { decisionRefreshInterval } from './useAssetDecisionCount';

describe('decisionRefreshInterval', () => {
  it('polls every 30 seconds while the count loads', () => {
    expect(decisionRefreshInterval('success')).toBe(30_000);
    expect(decisionRefreshInterval('pending')).toBe(30_000);
  });

  it('stops polling once the server refused, for example a user without access to assets', () => {
    expect(decisionRefreshInterval('error')).toBe(false);
  });
});
