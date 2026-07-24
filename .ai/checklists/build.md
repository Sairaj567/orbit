# Build Checklist

Before finalizing any PR or major commit:

- [ ] Run `pnpm install` if dependencies changed.
- [ ] Run `pnpm db:generate` to refresh Prisma client.
- [ ] Run `pnpm typecheck` from root to verify TS strictness.
- [ ] Run `pnpm lint` to ensure ESLint passes.
- [ ] Run `pnpm build` to verify Turborepo pipeline completes without errors.
