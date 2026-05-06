# Rule: Git and PR

Standar Git workflow dan Pull Request di `jurnal-fe`.

## Branch Naming

```
feature/JU-123-user-dashboard
bugfix/JU-456-fix-login-error
hotfix/JU-789-critical-auth-issue
refactor/user-module-cleanup
```

## Commit Message

```
feat: add user dashboard page
fix: resolve login redirect issue
refactor: simplify user service logic
docs: update README installation steps
test: add tests for useUserList hook
```

Format: `type: description`

Types:
- `feat`: Fitur baru.
- `fix`: Bug fix.
- `refactor`: Perubahan tanpa fitur/fix.
- `docs`: Dokumentasi.
- `test`: Testing.
- `chore`: Maintenance.

## PR Checklist

Sebelum request review:

- [ ] Branch up-to-date dengan `main-frontend`.
- [ ] `yarn typecheck` pass.
- [ ] `yarn lint` pass.
- [ ] `yarn build` pass.
- [ ] Test pass (jika ada).
- [ ] Tidak ada console.log yang terlupakan.
- [ ] PR description jelas.

## PR Title

- Singkat dan deskriptif.
- Gunakan prefix: `[Feature]`, `[Fix]`, `[Refactor]`.
- Max 70 karakter.

Contoh:
```
[Feature] Add user dashboard with stats
[Fix] Resolve login redirect loop
[Refactor] Simplify API service pattern
```

## PR Description

```markdown
## Summary
Ringkasan perubahan.

## Changes
- Add UserDashboard component
- Add useUserStats hook
- Update router with new route

## Test Plan
- [ ] Manual test dashboard render
- [ ] Test with empty data
- [ ] Test error state

## Screenshots
(jika ada UI change)

## Notes
Catatan tambahan untuk reviewer.
```

## Merge Rules

- Minimal 1 approval.
- Tidak ada open comments.
- CI pass.
- Squash merge ke `main-frontend`.

## Larangan

- Jangan force push ke shared branch.
- Jangan merge PR sendiri tanpa approval.
- Jangan commit langsung ke `main-frontend`.
