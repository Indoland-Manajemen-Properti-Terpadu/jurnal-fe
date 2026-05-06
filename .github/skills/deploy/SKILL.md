---
name: deploy
description: "Use when: preparing deployment readiness, running release checklist, and compiling rollback plan for jurnal-fe."
---

# Skill: Deploy

## Tujuan
Validasi kesiapan rilis/deploy secara aman.

## Checklist
1. `yarn typecheck` pass.
2. `yarn lint` pass.
3. `yarn build` pass.
4. Test minimal pass.
5. Env vars valid.
6. Risiko dan rollback plan tersedia.

## Output
- Ready/Blocked.
- Alasan blocking.
- Langkah rollback ringkas.
