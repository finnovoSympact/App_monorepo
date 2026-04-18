---
description: Pre-commit gate — typecheck, lint, build, and summarize changes
---

Run, in this order, stopping on first failure:

1. `pnpm typecheck` — report any error verbatim.
2. `pnpm lint` — report any error verbatim.
3. `pnpm format:check` — if it fails, run `pnpm format` and retry.
4. `pnpm build` — report first error verbatim if it fails.
5. `git status` + `git diff --stat` — show changed files and line deltas.

If everything passes, propose a commit message in conventional-commit format based on the diff, but do NOT commit. Wait for the user.
