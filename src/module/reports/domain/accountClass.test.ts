import { accountClassOf, groupByAccountClass } from './accountClass';

describe('accountClassOf', () => {
  it('is the first digit of the number, 1 to 8, or other', () => {
    expect(accountClassOf('1-10001')).toBe('1');
    expect(accountClassOf(' 8-10000')).toBe('8');
    expect(accountClassOf('9-1')).toBe('other');
    expect(accountClassOf('X-1')).toBe('other');
    expect(accountClassOf('')).toBe('other');
  });
});

describe('groupByAccountClass', () => {
  const number = (item: { n: string }) => item.n;

  it('groups in chart order, keeps the order inside a group and leaves out empty classes', () => {
    const groups = groupByAccountClass(
      [{ n: '2-1' }, { n: '1-2' }, { n: '1-1' }, { n: '6-1' }],
      number
    );
    expect(groups.map((group) => group.key)).toEqual(['1', '2', '6']);
    expect(groups[0].items.map(number)).toEqual(['1-2', '1-1']);
  });

  it('puts an unknown class last', () => {
    const groups = groupByAccountClass([{ n: 'X-1' }, { n: '1-1' }], number);
    expect(groups.map((group) => group.key)).toEqual(['1', 'other']);
  });
});
