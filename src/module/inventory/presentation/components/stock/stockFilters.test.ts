import { describe, expect, it } from 'vitest';
import { applyFilterPatch, readFilters } from './stockFilters';

const TODAY = '2026-11-22';
const read = (query = '') => readFilters(new URLSearchParams(query), TODAY);

describe('readFilters', () => {
  it('starts on the balances tab, this month, with nothing filtered', () => {
    expect(read()).toEqual({
      tab: 'balances',
      warehouse: '',
      asOf: '',
      search: '',
      from: '2026-11-01',
      to: TODAY,
      product: '',
      type: '',
      page: 1,
      transferStatus: '',
      transferPage: 1,
    });
  });

  it('reads what a link carries, so a warehouse can open the history already filtered', () => {
    expect(read('tab=history&warehouse=w1&from=2026-01-01&to=2026-06-30&product=p1')).toMatchObject(
      {
        tab: 'history',
        warehouse: 'w1',
        from: '2026-01-01',
        to: '2026-06-30',
        product: 'p1',
      }
    );
  });

  it('falls back to the balances tab for a tab it does not know', () => {
    expect(read('tab=nope').tab).toBe('balances');
  });

  it('treats a bad page as the first page', () => {
    expect(read('page=0').page).toBe(1);
    expect(read('page=abc').page).toBe(1);
    expect(read('page=3').page).toBe(3);
    expect(read('tpage=-2').transferPage).toBe(1);
  });
});

describe('applyFilterPatch', () => {
  it('writes a value and removes it again when it is emptied', () => {
    const withWarehouse = applyFilterPatch(new URLSearchParams(), { warehouse: 'w1' });
    expect(withWarehouse.get('warehouse')).toBe('w1');

    const cleared = applyFilterPatch(withWarehouse, { warehouse: '' });
    expect(cleared.has('warehouse')).toBe(false);
  });

  it('goes back to the first page when a filter changes, but not when only the page does', () => {
    const onPageThree = new URLSearchParams('tab=history&page=3');

    expect(applyFilterPatch(onPageThree, { warehouse: 'w1' }).has('page')).toBe(false);
    expect(applyFilterPatch(onPageThree, { page: 4 }).get('page')).toBe('4');
  });

  it('keeps the filters when the tab changes', () => {
    const next = applyFilterPatch(new URLSearchParams('warehouse=w1&from=2026-10-01'), {
      tab: 'transfers',
    });

    expect(next.get('tab')).toBe('transfers');
    expect(next.get('warehouse')).toBe('w1');
    expect(next.get('from')).toBe('2026-10-01');
  });

  it('does not keep the default tab in the address', () => {
    expect(
      applyFilterPatch(new URLSearchParams('tab=history'), { tab: 'balances' }).has('tab')
    ).toBe(false);
  });

  it('resets the transfer page when the transfer status changes', () => {
    const next = applyFilterPatch(new URLSearchParams('tab=transfers&tpage=2'), {
      transferStatus: 'VOID',
    });

    expect(next.get('tstatus')).toBe('VOID');
    expect(next.has('tpage')).toBe(false);
  });
});
