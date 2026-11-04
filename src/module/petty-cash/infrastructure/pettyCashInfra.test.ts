import { AxiosError } from 'axios';
import { cleanParams } from '@/module/petty-cash/infrastructure/queryParams';
import {
  PettyCashError,
  toPettyCashError,
} from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { nextIdempotencyKey } from '@/module/petty-cash/infrastructure/idempotency';
import {
  toCashBook,
  toDateOnly,
  toFund,
  toVoucher,
} from '@/module/petty-cash/infrastructure/pettyCashMappers';
import type {
  CashBookDto,
  FundDto,
  VoucherDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';

const httpError = (status: number | undefined, data?: unknown) =>
  new AxiosError(
    'failed',
    String(status ?? ''),
    undefined,
    undefined,
    status === undefined
      ? undefined
      : { status, statusText: '', data, headers: {}, config: {} as never }
  );

describe('cleanParams', () => {
  it('drops undefined, null and empty values that the backend rejects', () => {
    expect(
      cleanParams({ fundId: '', status: undefined, from: null, search: '  ', page: 1, limit: 25 })
    ).toEqual({ page: 1, limit: 25 });
  });

  it('joins a status list with commas and keeps false booleans', () => {
    expect(cleanParams({ status: ['DRAFT', 'VOID'], overdue: false })).toEqual({
      status: 'DRAFT,VOID',
      overdue: false,
    });
    expect(cleanParams({ status: [] })).toEqual({});
  });
});

describe('toPettyCashError', () => {
  it('reads Joi field errors from an array', () => {
    const error = toPettyCashError(
      httpError(400, {
        code: 400,
        message: '"date" is required',
        data: [{ field: 'date', message: '"date" is required' }],
        stack: 'Error: /app/src/...',
      })
    );
    expect(error).toBeInstanceOf(PettyCashError);
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual([{ field: 'date', message: '"date" is required' }]);
    expect(error.message).not.toContain('/app/src');
  });

  it('reads a domain error code, message and details', () => {
    const error = toPettyCashError(
      httpError(400, {
        code: 400,
        message: 'Nominal melebihi kas tersedia (Rp3.589.000)',
        data: { errorCode: 'PETTY_CASH_INSUFFICIENT_BALANCE', details: { availableCash: 3589000 } },
      })
    );
    expect(error.kind).toBe('domain');
    expect(error.code).toBe('PETTY_CASH_INSUFFICIENT_BALANCE');
    expect(error.serverMessage).toBe('Nominal melebihi kas tersedia (Rp3.589.000)');
    expect(error.details).toEqual({ availableCash: 3589000 });
  });

  it('keeps a business message that arrives without data', () => {
    const error = toPettyCashError(
      httpError(400, { code: 400, message: 'Alasan wajib diisi karena ada selisih kas' })
    );
    expect(error.kind).toBe('domain');
    expect(error.code).toBeUndefined();
    expect(error.serverMessage).toBe('Alasan wajib diisi karena ada selisih kas');
  });

  it('separates a missing menu right from a SoD violation', () => {
    expect(toPettyCashError(httpError(403, { message: 'Forbidden Access Role' })).kind).toBe(
      'forbidden'
    );
    const sod = toPettyCashError(
      httpError(403, { message: 'Pembuat voucher...', data: { errorCode: 'SOD_VIOLATION' } })
    );
    expect(sod.kind).toBe('domain');
    expect(sod.code).toBe('SOD_VIOLATION');
  });

  it('classifies 401, network failures and unknown values', () => {
    expect(toPettyCashError(httpError(401, { message: 'Please authenticate' })).kind).toBe(
      'unauthorized'
    );
    expect(toPettyCashError(httpError(undefined)).kind).toBe('network');
    expect(toPettyCashError(new Error('boom')).kind).toBe('unknown');
  });

  it.each([408, 502, 503, 504])(
    'treats HTTP %i as an unknown outcome, like a dropped connection',
    (status) => {
      expect(toPettyCashError(httpError(status, '<html>Bad gateway</html>')).kind).toBe('network');
    }
  );

  it('treats a 5xx without the application envelope as unknown, but keeps an answered 500 as an answer', () => {
    expect(toPettyCashError(httpError(500, 'proxy page')).kind).toBe('network');
    expect(
      toPettyCashError(httpError(500, { code: 500, message: 'Internal Server Error' })).kind
    ).toBe('unknown');
  });

  it('returns the same instance when already normalized', () => {
    const error = toPettyCashError(httpError(404, { data: { errorCode: 'NOT_FOUND' } }));
    expect(toPettyCashError(error)).toBe(error);
  });
});

describe('nextIdempotencyKey', () => {
  let counter = 0;
  const create = () => {
    counter += 1;
    return `key-${counter}`;
  };

  beforeEach(() => {
    counter = 0;
  });

  it('reuses the key when the same request is retried', () => {
    const first = nextIdempotencyKey(null, 'body-a', create);
    expect(nextIdempotencyKey(first, 'body-a', create)).toEqual(first);
  });

  it('issues a new key when the body changes, so the server never answers 422', () => {
    const first = nextIdempotencyKey(null, 'body-a', create);
    expect(nextIdempotencyKey(first, 'body-b', create)).toEqual({
      key: 'key-2',
      fingerprint: 'body-b',
    });
  });
});

const fundDto: FundDto = {
  id: 'f1',
  code: 'PC-HQ',
  name: 'Kas Kecil HQ',
  account: { id: 'a1', name: 'Kas Kecil Kasir', accountNumber: '1-10002' },
  pagu: 5000000,
  custodian: { id: 'u1', name: 'Siti', email: 'siti@x.id' },
  warningThresholdPct: 20,
  voucherApprovalThreshold: 1000000,
  attachmentRequiredThreshold: 100000,
  requireCountBeforeReimbursement: false,
  requireWitness: true,
  singleUserOverride: false,
  advanceMaxAmount: 2000000,
  advanceApprovalThreshold: 0,
  advanceSettlementDays: 5,
  advanceExcludeSaturday: true,
  advanceExcludeSunday: true,
  status: 'ACTIVE',
  closedAt: null,
  cashBalance: 4575000,
  availableCash: 4575000,
  reservedAmount: 0,
  pendingVoucherAmount: 25000,
  outstandingAdvanceAmount: 400000,
  unsettledVariance: 0,
  replenishmentAmount: 25000,
  availableCashRatio: 91.5,
  needsReplenishment: false,
  isBalanced: true,
  lastCountAt: '2026-10-31T10:47:51.476Z',
  createdAt: '2026-10-31T10:43:11.523Z',
  updatedAt: '2026-10-31T10:48:05.760Z',
};

describe('mappers', () => {
  it('keeps the calendar date of an accounting date sent as UTC midnight', () => {
    expect(toDateOnly('2026-10-31T00:00:00.000Z')).toBe('2026-10-31');
    expect(toDateOnly('2026-10-31')).toBe('2026-10-31');
  });

  it('groups fund settings and server balances', () => {
    const fund = toFund(fundDto);
    expect(fund.custodian.id).toBe('u1');
    expect(fund.settings.voucherApprovalThreshold).toBe(1000000);
    expect(fund.balance).toMatchObject({
      cashBalance: 4575000,
      outstandingAdvanceAmount: 400000,
      isBalanced: true,
    });
  });

  it('maps pockets and treats a fund without them as having none', () => {
    expect(toFund(fundDto).pockets).toEqual([]);
    const fund = toFund({
      ...fundDto,
      pockets: [
        { code: 'TUNAI', name: 'Tunai', type: 'CASH', isActive: true, balance: 3000000 },
        {
          code: 'BCA-KK',
          name: 'Rekening BCA',
          type: 'BANK',
          provider: 'BCA',
          accountNumber: '123',
          isActive: false,
          balance: 0,
        },
      ],
    });
    expect(fund.pockets[0]).toMatchObject({ code: 'TUNAI', provider: null, accountHolder: null });
    expect(fund.pockets[1]).toMatchObject({ provider: 'BCA', isActive: false });
  });

  it('maps a voucher with net line amounts, tax and attachments defaulting to empty', () => {
    const dto: VoucherDto = {
      id: 'v1',
      fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u1' },
      voucherNumber: 'PCV/202610/0001',
      source: 'DIRECT',
      advance: null,
      transactionDate: '2026-10-31T00:00:00.000Z',
      beneficiary: 'Toko A',
      description: 'ATK',
      receiptNumber: 'A-1',
      taxInvoiceNumber: null,
      vendorTaxId: null,
      lines: [
        {
          lineNo: 1,
          expenseAccount: { id: 'e1', name: 'Beban Operasional', accountNumber: '6-10000' },
          description: 'Kertas',
          amount: 100000,
          tax: { id: 't1', name: 'PPN 11%', rate: 11 },
          taxAmount: 11000,
        },
      ],
      totalAmount: 111000,
      status: 'PENDING_REIMBURSE',
      requestedBy: { id: 'u1', name: 'Siti', email: 'siti@x.id' },
      submittedAt: '2026-10-31T10:43:51.429Z',
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      rejectedAt: null,
      voidReason: null,
      voidedAt: null,
      reimbursement: null,
      createdAt: '2026-10-31T10:43:51.413Z',
      updatedAt: '2026-10-31T10:43:51.413Z',
    };
    const voucher = toVoucher(dto);
    expect(voucher.transactionDate).toBe('2026-10-31');
    expect(voucher.fund.custodianId).toBe('u1');
    expect(voucher.lines[0]).toMatchObject({ amount: 100000, taxAmount: 11000 });
    expect(voucher.attachments).toEqual([]);
    expect(voucher.warnings).toEqual([]);
  });

  it('maps a list item whose lines carry only account and tax ids', () => {
    const dto = {
      id: 'v1',
      fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u1' },
      voucherNumber: 'PCV/202610/0002',
      source: 'DIRECT',
      advance: null,
      transactionDate: '2026-10-31T00:00:00.000Z',
      beneficiary: 'Toko B',
      description: 'ATK',
      receiptNumber: '',
      taxInvoiceNumber: null,
      vendorTaxId: null,
      lines: [
        {
          lineNo: 1,
          expenseAccount: '6acf271a97cb3015c86650ac',
          description: 'x',
          amount: 1100000,
          tax: null,
          taxAmount: 0,
        },
      ],
      totalAmount: 1100000,
      status: 'REIMBURSED',
      requestedBy: null,
      submittedAt: null,
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      rejectedAt: null,
      voidReason: null,
      voidedAt: null,
      reimbursement: null,
      createdAt: '2026-10-31T10:00:00.000Z',
      updatedAt: '2026-10-31T10:00:00.000Z',
    } as VoucherDto;
    const [line] = toVoucher(dto).lines;
    expect(line.expenseAccountId).toBe('6acf271a97cb3015c86650ac');
    expect(line.expenseAccount).toBeNull();
    expect(line.tax).toBeNull();
  });

  it('maps a cash book page with its opening and closing balance', () => {
    const dto: CashBookDto = {
      fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ' },
      openingBalance: 0,
      closingBalance: 4975000,
      results: [
        {
          id: 'c1',
          seq: 2,
          txnDate: '2026-10-25T00:00:00.000Z',
          type: 'VOUCHER',
          direction: 'OUT',
          amount: 25000,
          runningBalance: 4975000,
          refType: 'VOUCHER',
          refId: 'v1',
          journal: null,
          memo: 'PCV/202610/0011',
          createdAt: '2026-10-31T10:48:05.759Z',
        },
      ],
      page: 1,
      limit: 50,
      totalPages: 1,
      totalResults: 1,
    };
    const book = toCashBook(dto);
    expect(book.closingBalance).toBe(4975000);
    expect(book.entries.items[0]).toMatchObject({ txnDate: '2026-10-25', direction: 'OUT' });
    expect(book.entries.totalResults).toBe(1);
  });
});
