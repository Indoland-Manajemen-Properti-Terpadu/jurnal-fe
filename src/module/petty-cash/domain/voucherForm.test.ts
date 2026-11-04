import {
  approvalHint,
  attachmentRequired,
  MAX_AMOUNT,
  cashCheck,
  draftFromVoucher,
  draftNet,
  emptyDraft,
  toVoucherInput,
  validateAttachmentFiles,
  validateVoucherDraft,
  type VoucherDraft,
} from '@/module/petty-cash/domain/voucherForm';
import type { PettyCashVoucherRecord } from '@/module/petty-cash/domain/pettyCashEntities';

const TODAY = '2026-10-31';

const valid = (over: Partial<VoucherDraft> = {}): VoucherDraft => ({
  ...emptyDraft(TODAY),
  beneficiary: 'Toko Buku A',
  lines: [
    {
      key: 'l1',
      expenseAccountId: 'acc1',
      description: '',
      amount: 50000,
      taxId: null,
      tagIds: [],
    },
  ],
  ...over,
});

const paths = (draft: VoucherDraft) =>
  validateVoucherDraft(draft, TODAY).map((i) => `${i.path}:${i.code}`);

describe('validateVoucherDraft', () => {
  it('accepts a draft with a payee, a date and one valid line', () => {
    expect(paths(valid())).toEqual([]);
  });

  it('requires a payee, trimmed', () => {
    expect(paths(valid({ beneficiary: '   ' }))).toContain('beneficiary:REQUIRED');
  });

  it('requires a date and refuses one in the future', () => {
    expect(paths(valid({ date: '' }))).toContain('date:REQUIRED');
    expect(paths(valid({ date: '2026-11-01' }))).toContain('date:FUTURE_DATE');
    expect(paths(valid({ date: TODAY }))).toEqual([]);
  });

  it('needs at least one line', () => {
    expect(paths(valid({ lines: [] }))).toContain('lines:NO_LINES');
  });

  it('requires an account and a positive whole amount on every line', () => {
    const lines = [
      {
        key: 'a',
        expenseAccountId: null,
        description: '',
        amount: 1000 as number | '',
        taxId: null,
        tagIds: [],
      },
      {
        key: 'b',
        expenseAccountId: 'acc1',
        description: '',
        amount: '' as number | '',
        taxId: null,
        tagIds: [],
      },
      {
        key: 'c',
        expenseAccountId: 'acc1',
        description: '',
        amount: 0 as number | '',
        taxId: null,
        tagIds: [],
      },
      {
        key: 'd',
        expenseAccountId: 'acc1',
        description: '',
        amount: 10.5 as number | '',
        taxId: null,
        tagIds: [],
      },
    ];
    expect(paths(valid({ lines }))).toEqual([
      'lines.0.expenseAccountId:REQUIRED',
      'lines.1.amount:REQUIRED',
      'lines.2.amount:POSITIVE_AMOUNT',
      'lines.3.amount:WHOLE_RUPIAH',
    ]);
  });

  it('allows a tax code on a line only when a tax invoice number is given', () => {
    const lines = [
      {
        key: 'a',
        expenseAccountId: 'acc1',
        description: '',
        amount: 1000,
        taxId: 'tax1',
        tagIds: [],
      },
    ];
    expect(paths(valid({ lines }))).toContain('lines.0.taxId:TAX_NEEDS_INVOICE');
    expect(paths(valid({ lines, taxInvoiceNumber: '010.000-26.1' }))).toEqual([]);
  });
});

describe('draftNet', () => {
  it('sums the net amounts without float drift and ignores empty amounts', () => {
    const lines = [
      {
        key: 'a',
        expenseAccountId: 'x',
        description: '',
        amount: 100000 as number | '',
        taxId: null,
        tagIds: [],
      },
      {
        key: 'b',
        expenseAccountId: 'x',
        description: '',
        amount: 50000 as number | '',
        taxId: null,
        tagIds: [],
      },
      {
        key: 'c',
        expenseAccountId: 'x',
        description: '',
        amount: '' as number | '',
        taxId: null,
        tagIds: [],
      },
    ];
    expect(draftNet(valid({ lines }))).toBe(150000);
  });
});

describe('toVoucherInput', () => {
  it('sends only what is filled in, trimmed, because the backend clears omitted optional fields', () => {
    const draft = valid({
      beneficiary: '  Toko Buku A  ',
      description: '   ',
      receiptNumber: ' R-1 ',
      lines: [
        {
          key: 'a',
          expenseAccountId: 'acc1',
          description: ' Kertas ',
          amount: 50000,
          taxId: null,
          tagIds: [],
        },
      ],
    });
    expect(toVoucherInput(draft)).toEqual({
      date: TODAY,
      beneficiary: 'Toko Buku A',
      receiptNumber: 'R-1',
      lines: [{ expenseAccountId: 'acc1', description: 'Kertas', amount: 50000 }],
    });
  });

  it('keeps a tax code only together with the tax invoice number and drops it otherwise', () => {
    const lines = [
      {
        key: 'a',
        expenseAccountId: 'acc1',
        description: '',
        amount: 1000,
        taxId: 'tax1',
        tagIds: [],
      },
    ];
    expect(
      toVoucherInput(valid({ lines, taxInvoiceNumber: ' 010.1 ', vendorTaxId: ' 01.2 ' }))
    ).toMatchObject({
      taxInvoiceNumber: '010.1',
      vendorTaxId: '01.2',
      lines: [{ taxId: 'tax1' }],
    });
    expect(toVoucherInput(valid({ lines })).lines[0]).not.toHaveProperty('taxId');
  });
});

describe('draftFromVoucher', () => {
  it('turns a stored voucher back into an editable draft', () => {
    const voucher = {
      transactionDate: '2026-10-25',
      beneficiary: 'Toko A',
      receiptNumber: '',
      description: 'ATK',
      taxInvoiceNumber: '010.1',
      vendorTaxId: null,
      lines: [
        {
          lineNo: 1,
          expenseAccountId: 'acc1',
          expenseAccount: null,
          description: 'Kertas',
          amount: 100000,
          tax: { id: 'tax1', name: 'PPN 11%', rate: 11 },
          taxAmount: 11000,
          tagIds: [],
        },
      ],
    } as unknown as PettyCashVoucherRecord;
    const draft = draftFromVoucher(voucher, () => 'k1');
    expect(draft).toMatchObject({
      date: '2026-10-25',
      beneficiary: 'Toko A',
      receiptNumber: '',
      description: 'ATK',
      taxInvoiceNumber: '010.1',
      vendorTaxId: '',
    });
    expect(draft.lines).toEqual([
      {
        key: 'k1',
        expenseAccountId: 'acc1',
        description: 'Kertas',
        amount: 100000,
        taxId: 'tax1',
        tagIds: [],
      },
    ]);
  });
});

describe('cashCheck', () => {
  it('flags an amount above the cash available and gives what would remain', () => {
    expect(cashCheck(450000, 3450000)).toEqual({ exceeds: false, remaining: 3000000 });
    expect(cashCheck(3450000, 3450000)).toEqual({ exceeds: false, remaining: 0 });
    expect(cashCheck(3450001, 3450000)).toEqual({ exceeds: true, remaining: -1 });
  });
});

describe('attachmentRequired', () => {
  it('requires a receipt from the fund threshold upward', () => {
    expect(attachmentRequired(99999, 100000)).toBe(false);
    expect(attachmentRequired(100000, 100000)).toBe(true);
  });
});

describe('validateAttachmentFiles', () => {
  const file = (name: string, size: number, type: string) => ({ name, size, type });
  const MB = 1024 * 1024;

  it('accepts jpg, png and pdf up to 10 MB', () => {
    expect(
      validateAttachmentFiles(
        [
          file('a.jpg', MB, 'image/jpeg'),
          file('b.png', MB, 'image/png'),
          file('c.pdf', 10 * MB, 'application/pdf'),
        ],
        0
      )
    ).toEqual([]);
  });

  it('flags a wrong type and an oversized file by name', () => {
    expect(
      validateAttachmentFiles(
        [file('a.gif', MB, 'image/gif'), file('b.pdf', 10 * MB + 1, 'application/pdf')],
        0
      )
    ).toEqual([
      { name: 'a.gif', code: 'TYPE' },
      { name: 'b.pdf', code: 'SIZE' },
    ]);
  });

  it('allows at most five files per voucher, counting the ones already attached', () => {
    const three = [
      file('1.png', 1, 'image/png'),
      file('2.png', 1, 'image/png'),
      file('3.png', 1, 'image/png'),
    ];
    expect(validateAttachmentFiles(three, 2)).toEqual([]);
    expect(validateAttachmentFiles(three, 3)).toEqual([{ name: '', code: 'COUNT' }]);
  });
});

describe('amounts that cannot be represented', () => {
  const huge = [
    {
      key: 'a',
      expenseAccountId: 'x',
      description: '',
      amount: 100000000000000 as number | '',
      taxId: null,
      tagIds: [],
    },
  ];
  const sub = [
    {
      key: 'a',
      expenseAccountId: 'x',
      description: '',
      amount: 100.123 as number | '',
      taxId: null,
      tagIds: [],
    },
  ];

  it('does not crash the running total, and the validation flags them instead', () => {
    expect(() => draftNet(valid({ lines: huge }))).not.toThrow();
    expect(() => draftNet(valid({ lines: sub }))).not.toThrow();
    expect(paths(valid({ lines: huge }))).toContain('lines.0.amount:TOO_LARGE');
    expect(paths(valid({ lines: sub }))).toContain('lines.0.amount:WHOLE_RUPIAH');
  });

  it('accepts an amount right at the limit and refuses one above it', () => {
    const at = [
      {
        key: 'a',
        expenseAccountId: 'x',
        description: '',
        amount: MAX_AMOUNT as number | '',
        taxId: null,
        tagIds: [],
      },
    ];
    const over = [
      {
        key: 'a',
        expenseAccountId: 'x',
        description: '',
        amount: (MAX_AMOUNT + 1) as number | '',
        taxId: null,
        tagIds: [],
      },
    ];
    expect(paths(valid({ lines: at }))).toEqual([]);
    expect(paths(valid({ lines: over }))).toContain('lines.0.amount:TOO_LARGE');
  });

  it('keeps the cash check alive for an amount that cannot be represented', () => {
    expect(() => cashCheck(100.123, 1000)).not.toThrow();
    expect(cashCheck(100000000000000, 1000).exceeds).toBe(true);
  });
});

describe('approvalHint', () => {
  it('requires approval when the net already reaches the threshold', () => {
    expect(approvalHint(1000000, 1000000, false)).toBe('REQUIRED');
    expect(approvalHint(1050000, 1000000, true)).toBe('REQUIRED');
  });

  it('says approval is possible when a tax code could push the total over the threshold', () => {
    expect(approvalHint(950000, 1000000, true)).toBe('POSSIBLE');
  });

  it('shows no hint for a small amount without tax, or no amount at all', () => {
    expect(approvalHint(950000, 1000000, false)).toBe('NONE');
    expect(approvalHint(0, 1000000, true)).toBe('NONE');
  });
});

describe('voucher pocket', () => {
  it('omits the pocket when none was chosen, so the backend uses the cash box', () => {
    expect(toVoucherInput(valid({ pocket: '' }))).not.toHaveProperty('pocket');
  });

  it('sends the chosen pocket', () => {
    expect(toVoucherInput(valid({ pocket: 'BCA-KK' })).pocket).toBe('BCA-KK');
  });
});

describe('voucher line tags', () => {
  const lineWith = (tagIds: string[]) =>
    valid({
      lines: [
        {
          key: 'l1',
          expenseAccountId: 'acc1',
          description: '',
          amount: 50000,
          taxId: null,
          tagIds,
        },
      ],
    });

  it('sends the tag ids of a line, and none when the line has no tag', () => {
    expect(toVoucherInput(lineWith(['t1', 't2'])).lines[0].tagIds).toEqual(['t1', 't2']);
    expect(toVoucherInput(lineWith([])).lines[0]).not.toHaveProperty('tagIds');
  });

  it('keeps the tags of a stored voucher when it is edited, because an update replaces the lines', () => {
    const record = {
      transactionDate: TODAY,
      beneficiary: 'Toko',
      receiptNumber: '',
      description: '',
      taxInvoiceNumber: null,
      vendorTaxId: null,
      pocket: 'TUNAI',
      lines: [
        {
          lineNo: 1,
          expenseAccountId: 'acc1',
          expenseAccount: null,
          description: '',
          amount: 1000,
          tax: null,
          taxAmount: 0,
          tagIds: ['t9'],
        },
      ],
    } as unknown as PettyCashVoucherRecord;
    const draft = draftFromVoucher(record, () => 'k1');
    expect(draft.lines[0].tagIds).toEqual(['t9']);
    expect(toVoucherInput(draft).lines[0].tagIds).toEqual(['t9']);
  });
});
