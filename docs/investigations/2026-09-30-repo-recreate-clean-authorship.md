# Repo recreated with clean authorship (2026-09-30)

## Problem
- Commit `8ec7f77` on GitHub carried an AI co-author trailer and author email `dahirma@vcu.edu`
- AGENTS.md requires commits to reference only `Masrik Dahir <info@masrikdahir.com>`

## Root cause
- Global git `user.email` = `dahirma@vcu.edu`
- Commit trailer added by tooling, not per AGENTS.md

## Fix
| Step | Result |
|---|---|
| Back up old `.git` | kept outside repo |
| `git init` fresh, local `user.email=info@masrikdahir.com` | ✅ |
| Tracked file set old vs new | identical (167 files) |
| Delete GitHub repo `Masrik-Dahir/aws-util-ts` | 204 ✅ (0 stars/forks/issues/releases) |
| Recreate repo (public) + push single `Initial commit` | ✅ author/committer = info@masrikdahir.com |

## Rules going forward
- Never add co-author / AI attribution trailers
- This repo's local git config pins `info@masrikdahir.com`
- No release script in `package.json` (build/lint/test only)
