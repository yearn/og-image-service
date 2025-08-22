# Copilot / Coding Agent Instructions

Purpose
- Short guidance for automated coding agents (Copilot / coding bot) when working on this repo.

How to help
- Make small, well-tested, and reversible edits that preserve existing API/behavior.
- Run the project's build and report pass/fail. Prefer Bun-first commands.
- When adding features, include minimal tests and update README or docs.

Key commands (run from repo root)
```bash
bun install
bun run dev
bunx --bun next build
```

Requirements & context (summary)
- This is a microservice under `yearn/og-image-service` for generating OG images.
- Edge API routes under `pages/api/og/**` (Bun + Edge runtime configured in `vercel.json`).
- Fonts and external fetches must honor `ALLOWED_HOSTS` and env-driven URIs.

Quality gates when changing code
- Build (Bun + Next): must pass.
- Lint/Typecheck: covered by Next build.
- Tests: add at least one small test when changing behavior.

Security constraints
- Do not add or leak secrets in commits.
- Keep SSRF safeguards (hostname resolution / allowed hosts / HTTPS-only fetches).

Branching / Pull Request expectations
- Make feature changes on a focused branch.
- Provide a short PR description with: change summary, files touched, and build/test status.

What to do now (for this repository)
1. Repo scaffold exists under the folder root. Build locally (commands above) to confirm.
2. Add brand assets or refine `BRANDS` map in `pages/api/og/vault/[chainID]/[address].tsx` as needed.
3. Consider adding `FONT_ORIGIN` env if you want to pin font host instead of relying on `ALLOWED_HOSTS`.

Deliverables for automated edits
- Small, focused commits with descriptive messages.
- Run the build after edits and include PASS/FAIL in the PR summary.

Contact / notes
- This file is intended to help ephemeral coding agents and contributors. Keep it short and up-to-date.
