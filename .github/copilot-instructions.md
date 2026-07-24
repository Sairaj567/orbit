# Copilot Instructions

These are repository-wide development rules for GitHub Copilot or any integrated AI.

- No `any`. Use strict TypeScript types.
- Prefer composition over inheritance.
- Run builds frequently (`pnpm build`).
- Keep documentation synchronized with codebase changes.
- Update `AI_HANDOFF.md` after every completed task.
- Treat `docs/` as the single source of truth.
- Use `cn()` for Tailwind class merging.
- Extract Zod schemas to `@orbit/shared` for validation on both ends.
