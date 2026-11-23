import { toPurchaseRequest } from './requestMappers';
import type { PurchaseRequestDto } from './requestDto';

/** A trimmed copy of what the live service returned for an FPPBJ in procurement (2026-11-21). */
const dto = {
  id: 'pr1',
  transactionNumber: 'FPPBJ/2026/11/0011',
  transactionDate: '2026-11-21T00:00:00.000Z',
  requiredDate: '2026-12-15T00:00:00.000Z',
  createdBy: 'u1',
  createdAt: '2026-11-21T06:00:00.000Z',
  status: 'IN_PROCUREMENT',
  statusLabel: 'Dalam pengadaan',
  department: { id: 'd1', name: 'Engineering' },
  purpose: 'Langganan',
  memo: '',
  iom: { number: 'IOM/1', date: null, attachments: [] },
  items: [
    {
      _id: 'i1',
      kind: 'GOODS',
      description: '',
      specification: 'Paket tim',
      quantity: 6,
      unit: { id: 'u9', name: 'Bulan' },
      product: { id: 'p1', name: 'Claude Max', unit: { id: 'u9', name: 'Bulan' } },
    },
  ],
  isOwner: true,
  procurement: {
    route: 'BIDDING',
    status: 'SUBMITTED',
    singleReason: '',
    belowMinQuotesReason: 'Hanya dua vendor',
    winner: 'v1',
    reason: '',
    negotiationNote: '',
    quotes: [
      {
        _id: 'q1',
        vendor: { id: 'v1', displayName: 'PT Alfa' },
        quotationNumber: 'QT-1',
        validUntil: '2026-12-31T00:00:00.000Z',
        paymentTerm: 't1',
        termSnapshot: {
          paymentTerm: 't1',
          name: 'Termin proyek',
          advanceType: 'partial',
          billingSplit: 'milestone',
          hasDueTerm: true,
          hasRetention: true,
          advancePercent: 20,
          installments: 3,
          installmentPercents: [40, 30, 30],
          dueDays: 30,
          retentionPercent: 5,
          maintenanceMonths: 6,
        },
        leadDays: 7,
        withReceipt: true,
        lines: [
          {
            requestItem: 'i1',
            unitPrice: 900000,
            finalPrice: null,
            tax: { id: 'tax1', name: 'PPN 11%' },
          },
        ],
        scores: { price: 5, spec: 4, delivery: 4, term: 3 },
        attachments: [
          { id: 'a1', fileName: 'qt.pdf', filePath: 'uploads/qt.pdf', mimeType: 'application/pdf' },
        ],
      },
    ],
  },
  procurementView: {
    biddingNumber: 'BID/2026/11/0011',
    quotes: [
      {
        id: 'q1',
        complete: true,
        subtotal: 5400000,
        discountAmount: 0,
        taxAmount: 594000,
        shippingAmount: 0,
        total: 5994000,
        score: 4.35,
        vendorHistory: { orders: 2, lastOrderDate: '2026-10-01T00:00:00.000Z' },
      },
    ],
    cheapestVendor: 'v1',
    estimatedValue: 5994000,
    minQuotes: 2,
    submitErrors: ['Bidding butuh minimal 2 penawaran lengkap, sekarang baru ada 1'],
    scoreCriteria: [{ key: 'price', label: 'Harga', weight: 45 }],
    approvalPreview: [{ name: 'Chief Finance', mode: 'ANY', roles: ['Chief Finance'] }],
  },
  approvalPlan: [
    { name: 'Chief Finance', mode: 'ANY', roles: [{ role: 'r1', name: 'Chief Finance' }] },
  ],
  approvals: [],
  pendingApprovers: [
    {
      level: 0,
      name: 'Chief Finance',
      mode: 'ANY',
      roles: [{ id: 'r1', name: 'Chief Finance', approved: false }],
    },
  ],
  canDecide: true,
  purchaseOrderRefs: [
    {
      id: 'po1',
      transactionNumber: 'PO/2026/11/0001',
      isService: false,
      total: 5994000,
      status: 'DRAFT',
    },
  ],
  readyForOrder: false,
} as unknown as PurchaseRequestDto;

describe('toPurchaseRequest, the procurement part', () => {
  const request = toPurchaseRequest(dto);
  const { procurement } = request;

  it('reads the route, the status and the reasons', () => {
    expect(request.route).toBe('BIDDING');
    expect(procurement).toMatchObject({
      route: 'BIDDING',
      status: 'SUBMITTED',
      winnerId: 'v1',
      belowMinQuotesReason: 'Hanya dua vendor',
      minQuotes: 2,
      biddingNumber: 'BID/2026/11/0011',
      estimatedValue: 5994000,
    });
  });

  it('reads a quote with its term snapshot, its lines and its files at a usable address', () => {
    const [quote] = procurement.quotes;

    expect(quote).toMatchObject({
      id: 'q1',
      number: 'QT-1',
      validUntil: '2026-12-31',
      paymentTermId: 't1',
      leadDays: 7,
      withReceipt: true,
      scores: { price: 5, spec: 4, delivery: 4, term: 3 },
    });
    expect(quote.vendor.name).toBe('PT Alfa');
    expect(quote.term).toMatchObject({
      advanceType: 'partial',
      advancePercent: 20,
      installments: 3,
      installmentPercents: [40, 30, 30],
      retentionPercent: 5,
    });
    expect(quote.lines[0]).toMatchObject({
      requestItemId: 'i1',
      unitPrice: 900000,
      finalPrice: null,
      taxId: 'tax1',
      taxName: 'PPN 11%',
    });
    expect(quote.attachments[0].name).toBe('qt.pdf');
    expect(quote.attachments[0].url.endsWith('/uploads/qt.pdf')).toBe(true);
  });

  it('keeps the totals of a quote by its id, as the service computed them', () => {
    expect(procurement.totals.q1).toEqual({
      complete: true,
      subtotal: 5400000,
      discountAmount: 0,
      taxAmount: 594000,
      shippingAmount: 0,
      total: 5994000,
      score: 4.35,
      vendorOrders: 2,
      vendorLastOrderDate: '2026-10-01',
    });
    expect(procurement.cheapestVendorId).toBe('v1');
  });

  it('carries what blocks submitting, the approvers to come and the orders made', () => {
    expect(procurement.submitErrors).toEqual([
      'Bidding butuh minimal 2 penawaran lengkap, sekarang baru ada 1',
    ]);
    expect(procurement.approvalPreview).toEqual([
      { name: 'Chief Finance', mode: 'ANY', roles: ['Chief Finance'] },
    ]);
    expect(procurement.approval.canDecide).toBe(true);
    expect(procurement.approval.pending[0].name).toBe('Chief Finance');
    expect(request.orders).toEqual([
      { id: 'po1', number: 'PO/2026/11/0001', isService: false, total: 5994000, status: 'DRAFT' },
    ]);
  });

  it('gives a request with no procurement yet an empty draft', () => {
    const bare = toPurchaseRequest({
      ...dto,
      status: 'VERIFIED',
      procurement: { route: null, status: 'DRAFT', quotes: [] },
      procurementView: null,
      purchaseOrderRefs: null,
    });

    expect(bare.route).toBeNull();
    expect(bare.procurement).toMatchObject({
      route: null,
      status: 'DRAFT',
      quotes: [],
      minQuotes: 1,
    });
    expect(bare.orders).toEqual([]);
  });
});

describe('toPurchaseRequest, quote discount', () => {
  const withDiscount = (extra: Record<string, unknown>) => {
    const base = dto as unknown as PurchaseRequestDto;
    const quote = { ...base.procurement?.quotes?.[0], ...extra };
    return toPurchaseRequest({
      ...base,
      procurement: { ...base.procurement, quotes: [quote] },
    } as PurchaseRequestDto).procurement.quotes[0];
  };

  it('reads a percent discount with its percent', () => {
    expect(
      withDiscount({ discountType: 'percentage', discountValue: 10, discountAmount: 0 })
    ).toMatchObject({
      discountType: 'percentage',
      discountValue: 10,
    });
  });

  it('reads a rupiah discount with its amount', () => {
    expect(
      withDiscount({ discountType: 'nominal', discountValue: 250000, discountAmount: 250000 })
    ).toMatchObject({
      discountType: 'nominal',
      discountValue: 250000,
    });
  });

  it('reads an older quote that has only an amount as a rupiah discount', () => {
    expect(
      withDiscount({ discountType: null, discountValue: 0, discountAmount: 125000 })
    ).toMatchObject({
      discountType: 'nominal',
      discountValue: 125000,
    });
  });
});

describe('toPurchaseRequest, delivery warehouse', () => {
  it('reads the warehouse the goods are delivered to', () => {
    const request = toPurchaseRequest({
      ...(dto as unknown as PurchaseRequestDto),
      deliveryWarehouse: { id: 'w1', code: 'GDG-001', name: 'Gudang Utama' },
    });
    expect(request.deliveryWarehouse).toEqual({ id: 'w1', code: 'GDG-001', name: 'Gudang Utama' });
  });

  it('has none for an older request or a request of services only', () => {
    expect(toPurchaseRequest(dto as unknown as PurchaseRequestDto).deliveryWarehouse).toBeNull();
  });
});
