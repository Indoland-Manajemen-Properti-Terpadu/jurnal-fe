export function parseEslintOutput(stdout) {
  if (!stdout || !stdout.trim()) {
    throw new Error('ESLint produced no output');
  }
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(`ESLint output is not JSON: ${stdout.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error('ESLint JSON output is not an array');
  }
  return parsed;
}

export function countByRule(results) {
  const counts = {};
  for (const file of results) {
    for (const message of file.messages) {
      const rule = message.ruleId ?? 'parse-error';
      counts[rule] = (counts[rule] ?? 0) + 1;
    }
  }
  return counts;
}

export function compareToBaseline(current, baseline) {
  const regressions = [];
  const improvements = [];
  for (const rule of new Set([...Object.keys(current), ...Object.keys(baseline)])) {
    const now = current[rule] ?? 0;
    const before = baseline[rule] ?? 0;
    if (now > before) regressions.push({ rule, baseline: before, current: now });
    if (now < before) improvements.push({ rule, baseline: before, current: now });
  }
  return { regressions, improvements };
}
