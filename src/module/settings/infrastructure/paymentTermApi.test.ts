import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPaymentTerm,
  deletePaymentTerm,
  fetchPaymentTerm,
  fetchPaymentTerms,
  isPaymentTermInUseError,
  readPaymentTermError,
  setPaymentTermStatus,
  updatePaymentTerm,
} from './paymentTermApi';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const term = { id: 't1', name: 'Net 30', appliesTo: 'both' };
const payload = {
  name: 'Net 30',
  appliesTo: 'both',
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  hasRetention: false,
} as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchPaymentTerms', () => {
  it('asks for the terms under settings with camelCase filters', async () => {
    http.get.mockResolvedValue({
      data: { data: { data: [term], pagination: { total: 1, page: 2, limit: 50, totalPages: 1 } } },
    });

    const page = await fetchPaymentTerms({
      q: 'net',
      appliesTo: 'service',
      isActive: false,
      page: 2,
    });

    expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms', {
      params: { q: 'net', appliesTo: 'service', isActive: false, page: 2 },
    });
    expect(page.items[0]).toMatchObject({ id: 't1', name: 'Net 30' });
    expect(page.pagination.page).toBe(2);
  });

  it('leaves out a filter that is empty or not chosen, and keeps isActive false', async () => {
    http.get.mockResolvedValue({ data: { data: { data: [], pagination: undefined } } });

    await fetchPaymentTerms({ q: '  ', appliesTo: undefined, isActive: undefined, page: 1 });
    expect(http.get).toHaveBeenLastCalledWith('/v1/settings/payment-terms', {
      params: { page: 1 },
    });

    await fetchPaymentTerms({ isActive: false });
    expect(http.get).toHaveBeenLastCalledWith('/v1/settings/payment-terms', {
      params: { isActive: false },
    });
  });

  it('sends no params when called without filters', async () => {
    http.get.mockResolvedValue({ data: { data: { data: [] } } });
    await fetchPaymentTerms();
    expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms', { params: {} });
  });
});

describe('single term calls', () => {
  it('reads one term', async () => {
    http.get.mockResolvedValue({ data: { data: term } });
    expect(await fetchPaymentTerm('t1')).toMatchObject({ id: 't1' });
    expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms/t1');
  });

  it('creates a term with the payload as is', async () => {
    http.post.mockResolvedValue({ data: { data: term } });
    expect(await createPaymentTerm(payload)).toMatchObject({ id: 't1' });
    expect(http.post).toHaveBeenCalledWith('/v1/settings/payment-terms', payload);
  });

  it('updates a term with the whole payload', async () => {
    http.put.mockResolvedValue({ data: { data: term } });
    await updatePaymentTerm('t1', payload);
    expect(http.put).toHaveBeenCalledWith('/v1/settings/payment-terms/t1', payload);
  });

  it('switches the status with an isActive body and returns the updated term', async () => {
    http.patch.mockResolvedValue({ data: { data: { ...term, isActive: false } } });
    expect(await setPaymentTermStatus('t1', false)).toMatchObject({ isActive: false });
    expect(http.patch).toHaveBeenCalledWith('/v1/settings/payment-terms/t1/status', {
      isActive: false,
    });
  });

  it('deletes a term', async () => {
    http.delete.mockResolvedValue({ data: {} });
    await deletePaymentTerm('t1');
    expect(http.delete).toHaveBeenCalledWith('/v1/settings/payment-terms/t1');
  });
});

describe('readPaymentTermError', () => {
  const axiosError = (status: number, message?: string) =>
    new AxiosError('failed', 'ERR', undefined, undefined, {
      status,
      data: { message },
    } as never);

  it('reads the status and the message the API sent', () => {
    expect(readPaymentTermError(axiosError(409, 'Termin sudah dipakai'))).toEqual({
      status: 409,
      message: 'Termin sudah dipakai',
    });
  });

  it('has a status but no message when the API sent none', () => {
    expect(readPaymentTermError(axiosError(500))).toEqual({ status: 500, message: undefined });
  });

  it('returns an empty answer for an error that did not come from the API', () => {
    expect(readPaymentTermError(new Error('boom'))).toEqual({});
    expect(readPaymentTermError('x')).toEqual({});
  });
});

describe('isPaymentTermInUseError', () => {
  const failed = (status: number) =>
    new AxiosError('failed', 'ERR', undefined, undefined, { status, data: {} } as never);

  it('is true only for the 409 the API gives for a term that is in use', () => {
    expect(isPaymentTermInUseError(failed(409))).toBe(true);
    expect(isPaymentTermInUseError(failed(400))).toBe(false);
    expect(isPaymentTermInUseError(new Error('boom'))).toBe(false);
  });
});
