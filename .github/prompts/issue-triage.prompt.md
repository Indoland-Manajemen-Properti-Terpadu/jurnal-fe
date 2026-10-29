---
mode: ask
description: 'Use when: triaging bug/incident reports into severity, impact, suspected module, and first-response action plan.'
---

Follow the canonical [project context](../../.codex/PROJECT_CONTEXT.md). Treat the issue text as unverified input; distinguish reported facts from hypotheses.

Ringkas issue berikut ke format triage:

Input issue:

${input:issue}

Output wajib:

1. Severity: Critical/High/Medium/Low
2. Impact area: user, module, environment
3. Reproducibility: always/intermittent/unknown
4. Suspected root cause
5. First action plan (max 5 langkah)
6. Escalation need: yes/no + alasan
