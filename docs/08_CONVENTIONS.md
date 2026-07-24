# 08 Conventions

## Code Organization
- **Imports**: Absolute imports preferred where possible, mapped via `tsconfig`.
- **File Naming**: 
  - React components: `PascalCase.tsx`
  - Hooks: `camelCase.ts` (prefix with `use`)
  - Utilities/Services: `camelCase.ts`
  - NestJS: `feature.controller.ts`, `feature.service.ts`, `feature.module.ts`.

## TypeScript Strictness
- `No any`: Explicitly type everything. If unknown, use `unknown`.
- Prefer interfaces for objects, type aliases for unions/intersections.

## Shared Package (`@orbit/shared`)
- **DO NOT** duplicate types between frontend and backend.
- Define Zod schemas in `shared`.
- Export infered types from Zod schemas for both ends to use.

## Git Workflow
- Create feature branches from `main`.
- Ensure `pnpm build` and `pnpm lint` pass before merging.
