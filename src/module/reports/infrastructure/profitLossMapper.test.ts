import { mapProfitLossPage } from './profitLossMapper';

const body = {
  code: 200,
  data: {
    startDate: '2026-11-01',
    endDate: '2026-11-10',
    sections: [{ key: 'revenue', title: 'Pendapatan', total: '1500' }],
    summary: { totalRevenue: 1500, grossProfit: 1500, profitAfterTax: '900.5' },
    rows: [
      {
        type: 'head',
        account: { accountNumber: '4-10000', name: 'Pendapatan', isContra: false },
        label: 'Pendapatan',
        amount: null,
      },
      {
        type: 'account',
        account: { accountNumber: '4-30001', name: 'Retur Penjualan', isContra: true },
        label: 'Retur Penjualan',
        amount: -50,
      },
      { type: 'total', account: null, label: 'TOTAL PENDAPATAN', amount: '1500' },
      { type: 'unknown', account: null, label: '', amount: null },
    ],
    pagination: { page: 1, totalPages: 2 },
  },
};

describe('mapProfitLossPage', () => {
  const { report, pagination } = mapProfitLossPage(body);

  it('reads the period, the sections and the summary, with numbers as numbers', () => {
    expect(report.startDate).toBe('2026-11-01');
    expect(report.sections[0]).toEqual({ key: 'revenue', title: 'Pendapatan', total: 1500 });
    expect(report.summary.profitAfterTax).toBe(900.5);
    expect(report.summary.totalTaxes).toBe(0);
  });

  it('keeps each line with its account number, sign and contra flag', () => {
    expect(report.rows[0]).toMatchObject({
      type: 'head',
      accountNumber: '4-10000',
      amount: null,
    });
    expect(report.rows[1]).toMatchObject({ type: 'account', amount: -50, isContra: true });
    expect(report.rows[2]).toMatchObject({ type: 'total', accountNumber: '', amount: 1500 });
  });

  it('keeps the markers the server puts on a line', () => {
    const { report: marked } = mapProfitLossPage({
      data: {
        rows: [
          {
            type: 'head',
            account: { id: 'h1', accountNumber: '4-10000' },
            label: 'P',
            amount: null,
          },
          { type: 'account', account: { id: 'a1' }, parentId: 'h1', label: 'A', amount: 1 },
          { type: 'subtotal', account: null, groupId: 'h1', label: 'S', amount: 1 },
          { type: 'total', account: null, key: 'revenue', label: 'T', amount: 1 },
        ],
      },
    });
    expect(marked.rows[0]).toMatchObject({ accountId: 'h1', key: null, parentId: null });
    expect(marked.rows[1].parentId).toBe('h1');
    expect(marked.rows[2].groupId).toBe('h1');
    expect(marked.rows[3].key).toBe('revenue');
  });

  it('reads gross, contra and net revenue, and copes with a server that sends none', () => {
    expect(
      mapProfitLossPage({
        data: {
          summary: { grossRevenue: 120, totalContra: -20, netRevenue: 100, totalRevenue: 100 },
        },
      }).report.summary
    ).toMatchObject({ grossRevenue: 120, totalContra: -20, netRevenue: 100 });
    expect(
      mapProfitLossPage({ data: { summary: { totalRevenue: 70 } } }).report.summary
    ).toMatchObject({ grossRevenue: 70, totalContra: 0, netRevenue: 70 });
  });

  it('treats a line of an unknown type as a blank', () => {
    expect(report.rows[3].type).toBe('blank');
  });

  it('reads the paging and copes with a body that is not an object', () => {
    expect(pagination).toEqual({ page: 1, totalPages: 2 });
    expect(mapProfitLossPage(null).report.rows).toEqual([]);
    expect(mapProfitLossPage(null).pagination).toEqual({ page: 1, totalPages: 1 });
  });
});
