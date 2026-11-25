import { toBillSource } from './billSourceMappers';
import type { BillSourceDto } from './billSourceDto';

const dto = (overrides: Partial<BillSourceDto> = {}): BillSourceDto =>
  ({
    id: 'po1',
    transactionNumber: 'SPK/2026/11/0005',
    transactionDate: '2026-11-24T00:00:00.000Z',
    vendor: { id: 'v1', displayName: 'PT Geruite' },
    ...overrides,
  }) as unknown as BillSourceDto;

describe('toBillSource, advance flags', () => {
  it('marks an order that still has an open advance line, and the one the page was opened for', () => {
    const doc = toBillSource(dto({ hasAdvance: true, selected: true }));

    expect(doc).toMatchObject({ hasAdvance: true, selected: true });
  });

  it('treats a source that says nothing as having no advance and not selected', () => {
    expect(toBillSource(dto())).toMatchObject({ hasAdvance: false, selected: false });
  });
});
