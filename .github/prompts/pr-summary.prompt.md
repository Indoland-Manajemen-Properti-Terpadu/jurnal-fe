---
mode: ask
description: 'Use when: generating concise, reviewer-friendly pull request summary with risks, testing, and rollout notes.'
---

Follow the canonical [project context](../../.codex/PROJECT_CONTEXT.md). Base the summary and verification notes only on the supplied change evidence.

Buat PR summary profesional dari perubahan berikut:

${input:changes}

Wajib output:

1. Summary (3-5 bullet)
2. Files/areas impacted
3. Risk assessment (low/med/high + alasan)
4. Test evidence
5. Rollout notes
6. Rollback notes
