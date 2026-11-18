import { describe, expect, it, vi } from 'vitest';
import { fetchAssetDecisionCount } from './assetDecisionApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

describe('fetchAssetDecisionCount', () => {
  it('counts only the pending reports the user can decide', async () => {
    http.get.mockResolvedValue({
      data: { data: { data: [{ canDecide: true }, { canDecide: false }, { canDecide: true }] } },
    });
    expect(await fetchAssetDecisionCount()).toBe(2);
    expect(http.get).toHaveBeenCalledWith('/v1/asset-reports', {
      params: { page: 1, limit: 100, status: 'PENDING_APPROVAL' },
    });
  });

  it('reads an empty answer as zero', async () => {
    http.get.mockResolvedValue({ data: {} });
    expect(await fetchAssetDecisionCount()).toBe(0);
  });
});
