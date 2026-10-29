import { describe, expect, it } from 'vitest';
import { compareToBaseline, countByRule, parseEslintOutput } from './ratchet.mjs';

const file = (...ruleIds) => ({
  filePath: 'x.ts',
  messages: ruleIds.map((ruleId) => ({ ruleId, severity: 2 })),
});

describe('parseEslintOutput', () => {
  it('throws on empty output', () => {
    expect(() => parseEslintOutput('')).toThrow();
  });

  it('throws on non-JSON output', () => {
    expect(() => parseEslintOutput('Error: boom')).toThrow();
  });

  it('returns the parsed array for valid JSON', () => {
    expect(parseEslintOutput('[{"messages":[]}]')).toEqual([{ messages: [] }]);
  });
});

describe('countByRule', () => {
  it('counts every message of a rule across files', () => {
    expect(countByRule([file('a', 'a'), file('a', 'b')])).toEqual({ a: 3, b: 1 });
  });

  it('counts a message without ruleId as parse-error', () => {
    expect(countByRule([file(null)])).toEqual({ 'parse-error': 1 });
  });
});

describe('compareToBaseline', () => {
  it('reports a regression when a count rises', () => {
    const { regressions } = compareToBaseline({ a: 3 }, { a: 2 });
    expect(regressions).toEqual([{ rule: 'a', baseline: 2, current: 3 }]);
  });

  it('reports an improvement and no regression when a count falls', () => {
    const result = compareToBaseline({ a: 1 }, { a: 2 });
    expect(result.regressions).toEqual([]);
    expect(result.improvements).toEqual([{ rule: 'a', baseline: 2, current: 1 }]);
  });

  it('treats a rule absent from the baseline as a regression from zero', () => {
    const { regressions } = compareToBaseline({ fresh: 1 }, {});
    expect(regressions).toEqual([{ rule: 'fresh', baseline: 0, current: 1 }]);
  });

  it('reports nothing when counts are equal', () => {
    expect(compareToBaseline({ a: 2 }, { a: 2 })).toEqual({ regressions: [], improvements: [] });
  });

  it('reports a rule that disappeared as an improvement', () => {
    const { improvements } = compareToBaseline({}, { gone: 4 });
    expect(improvements).toEqual([{ rule: 'gone', baseline: 4, current: 0 }]);
  });
});
