# Feature Checklist

Before considering a feature complete, ensure:

- [ ] Database schema is updated in `schema.prisma`.
- [ ] Migrations are generated (`pnpm db:migrate:dev`).
- [ ] Shared DTOs/Zod schemas are added to `@orbit/shared`.
- [ ] NestJS Service handles business logic.
- [ ] NestJS Controller exposes REST endpoints.
- [ ] React Query hooks are created for the new endpoints.
- [ ] UI components are built using Tailwind v4 and shadcn/ui.
- [ ] Feature documentation is updated in `docs/features/`.
