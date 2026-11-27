# Jira QA Ticket Workflow

For a bug ticket written by QA, and for a request that arrives as a Jira comment. Use it together with [issue-fix](issue-fix.md); this page adds what is specific to tickets.

## Pick the work

1. Find the tickets assigned to the user. Bug tickets come in pairs: an `(FE)` ticket and a `(BE)` ticket with the next number. Only the FE ticket is frontend work; the BE ticket is where backend needs go.
2. Read each description and every comment, including ones that mention the user. A later comment can change or confirm a finding.
3. Rank the findings by the priority marks of the ticket. Work the 🔴 and 🟡 findings that are frontend only, unless the user names more. List the rest as not done instead of dropping them silently.

## Decide where the bug lives

4. Before deciding "frontend" or "backend", check the real behaviour against the sandbox API (see the sandbox reference the user keeps in the agent memory) and write down the request and the answer. A finding the ticket calls "FE + BE" often has one side already right.
5. A finding may already be fixed by an earlier change, or QA may have used a stale bundle. Check the code and the release before writing new code, and say so in the reply instead of changing code twice.

## Fix

6. Reproduce the finding with a failing test first when the screen can be rendered in a test. When it cannot (for example a table of a library that renders nothing in jsdom), say that no test covers it.
7. Fix the frontend side only. A rule the backend should also enforce is not a reason to skip the frontend guard, and a frontend guard is not a reason to skip the backend ticket.
8. One commit per ticket, named with the ticket key. Update the README of the feature when a rule changes.
9. Leave the data created while testing and name it clearly ("Uji ...", notes "Data uji FE"), so QA can see it.

## Report back

10. Comment on each FE ticket after the change is live, not before. A comment says, in the language of the ticket: what changed for every finding that was worked, what was not done and why (for example "needs the backend"), and a short list of what to check when retesting. Say plainly what was not verified, such as "not tried in a browser". Ask QA to hard refresh first.
11. Move the ticket to Need to Test. Never to Done: QA closes it.
12. Put what the backend must fix on the paired BE ticket, mentioning its assignee, with the request, the answer received and the steps to reproduce. When a finding involves a UI-vs-backend mismatch against the [Jurnal ProApps UI reference](https://jurnalproapps.vercel.app), confirm or mention the relevant owner on Jira (**Raga** for UI/UX, PM, QA; **Aldi** & **Zaki** for Backend, with **Zaki** also occasionally handling Frontend).
13. When the work is finished, give the user feedback: what was done, what was not done, risks of the change (for example a dropdown that now hides old data), what the backend still owes, and what QA should be told. Feedback is part of the task, not an extra.

## Release

14. Open, merge or promote pull requests only when the user asks for it. Follow [branching-and-release](../../branching-and-release.md). The release gate asks for a manual smoke test; when it was not done, write that in the pull request instead of ticking it.
