import { describe, expect, it } from 'vitest';
import {
  bump,
  bumpLevel,
  latestTag,
  nextVersion,
  parseCommit,
  releaseNotes,
  shippedCommits,
} from './releaseVersion.mjs';

const c = (subject, body = '') => ({ subject, body });

describe('latestTag', () => {
  it('picks the highest version, not the newest string', () => {
    expect(latestTag(['v0.2.0', 'v0.10.0', 'v0.9.9', 'archive/x'])).toBe('v0.10.0');
  });

  it('is null without a version tag', () => {
    expect(latestTag(['archive/oauth-login'])).toBeNull();
  });
});

describe('parseCommit', () => {
  it('reads type, scope and description', () => {
    expect(parseCommit(c('feat(sales): add filter (#195)'))).toEqual({
      type: 'feat',
      scope: 'sales',
      description: 'add filter (#195)',
      breaking: false,
    });
  });

  it('marks a bang or a BREAKING CHANGE footer', () => {
    expect(parseCommit(c('feat(api)!: new contract')).breaking).toBe(true);
    expect(parseCommit(c('fix: x', 'BREAKING CHANGE: y')).breaking).toBe(true);
  });

  it('keeps a subject that is not conventional as "other"', () => {
    expect(parseCommit(c('Update readme')).type).toBe('other');
  });
});

describe('shippedCommits', () => {
  it('drops merges and release plumbing', () => {
    const list = [
      c('Merge pull request #1 from x/y'),
      c('chore(release): back-merge'),
      c('fix(sales): a'),
    ];
    expect(shippedCommits(list)).toEqual([c('fix(sales): a')]);
  });
});

describe('bumpLevel and bump', () => {
  it('asks for a minor on a feat and a patch otherwise', () => {
    expect(bumpLevel([c('feat: a'), c('fix: b')], 0)).toBe('minor');
    expect(bumpLevel([c('fix: b'), c('docs: c')], 0)).toBe('patch');
  });

  it('keeps a breaking change at minor while the major is 0, major after', () => {
    expect(bumpLevel([c('feat!: a')], 0)).toBe('minor');
    expect(bumpLevel([c('feat!: a')], 1)).toBe('major');
  });

  it('resets the lower numbers', () => {
    expect(bump('v0.2.3', 'minor')).toBe('v0.3.0');
    expect(bump('v1.2.3', 'major')).toBe('v2.0.0');
    expect(bump('v0.2.3', 'patch')).toBe('v0.2.4');
  });
});

describe('nextVersion', () => {
  it('makes no release when only merges and plumbing came in', () => {
    expect(nextVersion('v0.2.0', [c('Merge pull request #2'), c('chore(release): x')])).toBeNull();
  });

  it('computes the tag from the work that shipped', () => {
    const next = nextVersion('v0.2.0', [
      c('fix(a): x'),
      c('feat(b): y'),
      c('Merge pull request #3'),
    ]);
    expect(next.tag).toBe('v0.3.0');
    expect(next.level).toBe('minor');
    expect(next.commits).toHaveLength(2);
  });
});

describe('releaseNotes', () => {
  it('groups by type, leaves empty groups out and links the comparison', () => {
    const notes = releaseNotes({
      commits: [c('feat(sales): a (#1)'), c('fix(settings): b'), c('ci: c')],
      lastTag: 'v0.2.0',
      tag: 'v0.3.0',
      repoUrl: 'https://github.com/o/r',
    });
    expect(notes).toContain('## Fitur\n\n- **sales:** a (#1)');
    expect(notes).toContain('## Perbaikan\n\n- **settings:** b');
    expect(notes).toContain('## Lainnya\n\n- c');
    expect(notes).not.toContain('## Performa');
    expect(notes).toContain('https://github.com/o/r/compare/v0.2.0...v0.3.0');
  });
});
