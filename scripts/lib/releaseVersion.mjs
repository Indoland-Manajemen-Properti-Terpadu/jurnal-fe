// Next version and release notes from Conventional Commits. A release is made for every deploy of
// main-frontend that carries new work since the last v* tag (docs/branching-and-release.md).

const SEMVER_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
// Commit subjects: `type(scope)!: description (#123)`.
const SUBJECT = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/;
// Merge commits and release plumbing carry no work of their own.
const IGNORED = /^(Merge |chore\(release\))/;

export function parseTag(tag) {
  const match = SEMVER_TAG.exec(tag);
  return match ? match.slice(1).map(Number) : null;
}

/** The highest vMAJOR.MINOR.PATCH tag, or null when there is none. */
export function latestTag(tags) {
  const versions = tags
    .map((tag) => ({ tag, parts: parseTag(tag) }))
    .filter((entry) => entry.parts)
    .sort((a, b) => {
      for (let i = 0; i < 3; i += 1) if (a.parts[i] !== b.parts[i]) return b.parts[i] - a.parts[i];
      return 0;
    });
  return versions.length ? versions[0].tag : null;
}

/** Drops merge commits and release plumbing; what is left is the work that shipped. */
export function shippedCommits(commits) {
  return commits.filter((commit) => !IGNORED.test(commit.subject));
}

export function parseCommit(commit) {
  const match = SUBJECT.exec(commit.subject);
  const breaking = Boolean(match?.[3]) || /^BREAKING[ -]CHANGE:/m.test(commit.body ?? '');
  return {
    type: match ? match[1].toLowerCase() : 'other',
    scope: match?.[2] ?? '',
    description: match ? match[4] : commit.subject,
    breaking,
  };
}

/**
 * The bump the commits ask for: a breaking change is major (minor while the major is still 0, as
 * SemVer allows for initial development), a feat is minor, anything else is patch.
 */
export function bumpLevel(commits, major) {
  const parsed = commits.map(parseCommit);
  if (parsed.some((commit) => commit.breaking)) return major === 0 ? 'minor' : 'major';
  if (parsed.some((commit) => commit.type === 'feat')) return 'minor';
  return 'patch';
}

export function bump(tag, level) {
  const [major, minor, patch] = parseTag(tag);
  if (level === 'major') return `v${major + 1}.0.0`;
  if (level === 'minor') return `v${major}.${minor + 1}.0`;
  return `v${major}.${minor}.${patch + 1}`;
}

/** The next tag, or null when nothing shipped since the last one (a redeploy makes no release). */
export function nextVersion(lastTag, commits) {
  const shipped = shippedCommits(commits);
  if (shipped.length === 0) return null;
  const level = bumpLevel(shipped, parseTag(lastTag)[0]);
  return { tag: bump(lastTag, level), level, commits: shipped };
}

const SECTIONS = [
  ['feat', 'Fitur'],
  ['fix', 'Perbaikan'],
  ['perf', 'Performa'],
  ['refactor', 'Perapian kode'],
  ['docs', 'Dokumentasi'],
];
const OTHER_TITLE = 'Lainnya';

const line = ({ scope, description, breaking }) =>
  `- ${breaking ? '**BREAKING** ' : ''}${scope ? `**${scope}:** ` : ''}${description}`;

/** Release notes grouped by commit type, with a link to the full comparison. */
export function releaseNotes({ commits, lastTag, tag, repoUrl }) {
  const parsed = commits.map(parseCommit);
  const known = new Set(SECTIONS.map(([type]) => type));
  const groups = [
    ...SECTIONS.map(([type, title]) => [title, parsed.filter((c) => c.type === type)]),
    [OTHER_TITLE, parsed.filter((c) => !known.has(c.type))],
  ];
  const body = groups
    .filter(([, items]) => items.length > 0)
    .map(([title, items]) => `## ${title}\n\n${items.map(line).join('\n')}`)
    .join('\n\n');
  return `${body}\n\n**Perubahan lengkap**: ${repoUrl}/compare/${lastTag}...${tag}\n`;
}
