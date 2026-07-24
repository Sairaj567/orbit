# AI Context

This file contains concise, strict instructions for every AI working on the Orbit project.

- **Architecture is frozen.** Do not attempt to migrate away from Turborepo, NestJS, React, Prisma, or Tailwind v4.
- **Always build before finishing.** Run `pnpm build` to verify shared types compile correctly across the monorepo.
- **Never redesign without approval.** Adhere strictly to the design system and UI guidelines (`docs/07_UI_GUIDELINES.md`).
- **Use strict TypeScript.** Do not use `any`. Define all interfaces.
- **Follow Clean Architecture in NestJS.** Controllers handle routing; Services handle logic.
- **Reuse existing abstractions.** Do not write raw fetch calls; use React Query. Do not write raw SQL; use Prisma. Do not write custom UI primitives if shadcn/ui provides them.
- **Update documentation after every milestone.**
- **No placeholder documents.** Every file must have meaning.
