import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import {
  BankConnectionError,
  createConnection,
  getConnection,
  listConnections,
  listProviders,
  listSyncRuns,
  proposeBank,
  revokeConnection,
  signConnection,
  syncConnection,
  uploadDocument,
} from '@/module/bank-connection/infrastructure/bankConnectionApi';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

const httpError = (status: number, data: unknown = {}) =>
  new AxiosError('failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: {} as never,
  });

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe('listProviders', () => {
  it('maps a provider and reads the list from any of the envelope shapes', async () => {
    const provider = {
      id: 'p1',
      bankName: 'Bank Contoh',
      bankCode: '014',
      logoUrl: 'https://cdn.example/l.svg',
      accountTypes: ['CORPORATE'],
      capabilities: ['FEED'],
      status: 'AVAILABLE',
      monthlyFee: { amount: 50000, currency: 'IDR' },
      requiredFields: ['accountNumber'],
      consentValidityMonths: 12,
    };
    const expected = [
      {
        id: 'p1',
        bankName: 'Bank Contoh',
        bankCode: '014',
        logoUrl: 'https://cdn.example/l.svg',
        accountTypes: ['CORPORATE'],
        status: 'AVAILABLE',
        monthlyFee: 50000,
        consentValidityMonths: 12,
      },
    ];
    for (const body of [
      { results: [provider] },
      { data: { results: [provider] } },
      { data: [provider] },
    ]) {
      get.mockResolvedValueOnce({ data: body } as never);
      expect(await listProviders()).toMatchObject(expected);
    }
    expect(get).toHaveBeenCalledWith('/v1/bank-providers', expect.anything());
  });

  it('says the feature is not available yet when the backend has no such resource', async () => {
    get.mockRejectedValue(httpError(404));
    await expect(listProviders()).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('treats a provider without a known status as coming soon', async () => {
    get.mockResolvedValue({
      data: { results: [{ id: 'p', bankName: 'B', status: 'WEIRD' }] },
    } as never);
    expect((await listProviders())[0].status).toBe('COMING_SOON');
  });
});

describe('connections', () => {
  const dto = {
    id: 'bc_1',
    providerId: 'p1',
    bankName: 'Bank Contoh',
    accountId: 'acc-1',
    accountType: 'CORPORATE',
    status: 'ACTIVE',
    bankAccountNumber: '1234567890',
    accountHolderName: 'PT Maju',
    lastSyncedAt: '2026-11-12T03:10:00Z',
    statementBalance: 125_000_000,
    statementBalanceAsOf: '2026-11-12T03:05:00Z',
    consent: { signedAt: '2026-01-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z' },
  };

  it('maps a connection, masking the account number and resolving the next action', async () => {
    get.mockResolvedValue({ data: { data: dto } } as never);
    const connection = await getConnection('bc_1');
    expect(connection).toMatchObject({
      id: 'bc_1',
      status: 'ACTIVE',
      nextAction: 'NONE',
      accountNumberMasked: '••••7890',
      statementBalance: 125_000_000,
      consentExpiresAt: '2027-01-01T00:00:00Z',
    });
    expect(JSON.stringify(connection)).not.toContain('1234567890');
  });

  it('prefers the masked number the server sends', async () => {
    get.mockResolvedValue({
      data: { data: { ...dto, bankAccountNumber: undefined, bankAccountNumberMasked: '••••4821' } },
    } as never);
    expect((await getConnection('bc_1')).accountNumberMasked).toBe('••••4821');
  });

  it('asks for the connections of one account and drops empty filters', async () => {
    get.mockResolvedValue({ data: { results: [dto] } } as never);
    await listConnections({ accountId: 'acc-1', status: '' });
    expect(get).toHaveBeenCalledWith('/v1/bank-connections', { params: { accountId: 'acc-1' } });
  });

  it('treats an unknown status from the server as an error state, not a crash', async () => {
    get.mockResolvedValue({ data: { data: { ...dto, status: 'SOMETHING_NEW' } } } as never);
    expect((await getConnection('bc_1')).status).toBe('ERROR');
  });
});

describe('writes', () => {
  it('creates a draft with the body as given', async () => {
    post.mockResolvedValue({
      data: {
        data: { id: 'bc_2', status: 'DRAFT', accountId: 'a', providerId: 'p', bankName: 'B' },
      },
    } as never);
    const body = {
      providerId: 'p',
      accountId: 'a',
      accountType: 'CORPORATE' as const,
      bankAccountNumber: '1',
      accountHolderName: 'x',
      signatory: { name: 's', nationalId: '3171234567890001' },
    };
    expect((await createConnection(body)).id).toBe('bc_2');
    expect(post).toHaveBeenCalledWith('/v1/bank-connections', body, expect.anything());
  });

  it('sends the reason with a revoke', async () => {
    post.mockResolvedValue({
      data: {
        data: { id: 'bc_1', status: 'REVOKED', accountId: 'a', providerId: 'p', bankName: 'B' },
      },
    } as never);
    await revokeConnection('bc_1', 'Ganti bank');
    expect(post).toHaveBeenCalledWith(
      '/v1/bank-connections/bc_1/revoke',
      { reason: 'Ganti bank' },
      expect.anything()
    );
  });

  it('returns the signing link when the backend asks for signing elsewhere', async () => {
    post.mockResolvedValue({
      data: {
        data: {
          id: 'bc_1',
          status: 'AWAITING_SIGNATURE',
          accountId: 'a',
          providerId: 'p',
          bankName: 'B',
          signingUrl: 'https://sign.example/abc',
        },
      },
    } as never);
    expect((await signConnection('bc_1')).signingUrl).toBe('https://sign.example/abc');
  });

  it('starts a sync and returns the run id', async () => {
    post.mockResolvedValue({ status: 202, data: { data: { syncRunId: 'run_9' } } } as never);
    expect(await syncConnection('bc_1')).toEqual({ syncRunId: 'run_9' });
  });
});

describe('errors', () => {
  it('turns a validation answer into messages per field', async () => {
    post.mockRejectedValue(
      httpError(400, { message: 'x', data: [{ field: 'bankAccountNumber', message: 'bad' }] })
    );
    const error = (await createConnection({} as never).catch((e) => e)) as BankConnectionError;
    expect(error).toBeInstanceOf(BankConnectionError);
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({ bankAccountNumber: 'bad' });
  });

  it('keeps the stable code of a business refusal', async () => {
    post.mockRejectedValue(
      httpError(409, { message: 'Akun sudah terhubung', errorCode: 'ACCOUNT_ALREADY_CONNECTED' })
    );
    await expect(createConnection({} as never)).rejects.toMatchObject({
      kind: 'conflict',
      code: 'ACCOUNT_ALREADY_CONNECTED',
      message: 'Akun sudah terhubung',
    });
  });

  it('tells a rate limit, a refusal of rights and a dropped connection apart', async () => {
    post.mockRejectedValueOnce(httpError(429, { errorCode: 'SYNC_RATE_LIMITED' }));
    await expect(syncConnection('bc_1')).rejects.toMatchObject({ kind: 'rateLimited' });
    get.mockRejectedValueOnce(httpError(403));
    await expect(listConnections()).rejects.toMatchObject({ kind: 'forbidden' });
    get.mockRejectedValueOnce(new Error('Network Error'));
    await expect(listSyncRuns('bc_1')).rejects.toMatchObject({ kind: 'network' });
  });

  it('never keeps the server stack', async () => {
    get.mockRejectedValue(httpError(500, { message: 'boom', stack: 'Error: boom\n at x' }));
    const error = (await getConnection('bc_1').catch((e) => e)) as BankConnectionError;
    expect(JSON.stringify(error)).not.toContain('stack');
    expect(error.kind).toBe('unknown');
  });
});

describe('proposeBank', () => {
  it('sends the bank code and the note', async () => {
    post.mockResolvedValue({ status: 201, data: {} } as never);
    await proposeBank({ bankCode: '002', note: 'Rekening utama kami' });
    expect(post).toHaveBeenCalledWith(
      '/v1/bank-provider-requests',
      { bankCode: '002', note: 'Rekening utama kami' },
      expect.anything()
    );
  });

  it('says the feature is not available yet when the backend has no such resource', async () => {
    post.mockRejectedValue(httpError(404));
    await expect(proposeBank({ bankCode: '002' })).rejects.toMatchObject({ kind: 'unavailable' });
  });
});

describe('uploadDocument', () => {
  it('sends the file with its type as multipart to the connection', async () => {
    post.mockResolvedValue({ status: 201, data: {} } as never);
    const ktp = new File(['x'], 'ktp.pdf', { type: 'application/pdf' });
    await uploadDocument('bc_1', 'IDENTITY', ktp);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/v1/bank-connections/bc_1/documents');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('type')).toBe('IDENTITY');
    expect((body as FormData).get('file')).toBe(ktp);
  });

  it('turns a failure into the module error', async () => {
    post.mockRejectedValue(httpError(400, { errorCode: 'DOCUMENT_UNREADABLE' }));
    await expect(
      uploadDocument('bc_1', 'ACCOUNT_PROOF', new File(['x'], 'a.pdf'))
    ).rejects.toMatchObject({ kind: 'refused', code: 'DOCUMENT_UNREADABLE' });
  });
});

describe('connection documents', () => {
  it('tells which documents the backend already holds, by type and file name only', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          id: 'bc_1',
          status: 'NEEDS_REVISION',
          documents: [
            { type: 'IDENTITY', fileName: 'ktp.pdf' },
            { type: 'OTHER', fileName: 'x' },
          ],
        },
      },
    } as never);
    expect((await getConnection('bc_1')).documents).toEqual([
      { type: 'IDENTITY', fileName: 'ktp.pdf' },
    ]);
  });
});

describe('fee rules and refresh usage', () => {
  it('reads the fee rule of each account type of a provider', async () => {
    get.mockResolvedValue({
      data: {
        results: [
          {
            id: 'p',
            bankName: 'B',
            status: 'AVAILABLE',
            feeRules: [
              {
                accountType: 'CORPORATE',
                monthly: 50000,
                includedRefreshes: 500,
                extraRefreshFee: 100,
                autoRefreshesPerMonth: 180,
                billing: 'AUTO_DEBIT',
              },
              { accountType: 'WEIRD', monthly: 1 },
            ],
          },
        ],
      },
    } as never);
    expect((await listProviders())[0].fees).toEqual({
      CORPORATE: {
        monthly: 50000,
        includedRefreshes: 500,
        extraRefreshFee: 100,
        autoRefreshes: 180,
        autoDebit: true,
      },
    });
  });

  it('reads how many refreshes of the month a connection has used', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          id: 'bc',
          status: 'ACTIVE',
          refreshUsage: { used: 120, included: 500, extraRefreshFee: 100 },
        },
      },
    } as never);
    expect((await getConnection('bc')).refreshUsage).toEqual({
      used: 120,
      included: 500,
      extraRefreshFee: 100,
    });
  });

  it('has no usage when the backend sends none', async () => {
    get.mockResolvedValue({ data: { data: { id: 'bc', status: 'ACTIVE' } } } as never);
    expect((await getConnection('bc')).refreshUsage).toBeUndefined();
  });
});
