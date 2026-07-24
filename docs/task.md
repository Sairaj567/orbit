# Milestone 1 - Foundation

## Root & Infrastructure
- [x] `pnpm-workspace.yaml`
- [x] `package.json` (root)
- [x] `turbo.json`
- [x] `tsconfig.base.json`
- [x] `.prettierrc`
- [x] `.prettierignore`
- [x] `.gitignore`
- [x] `.editorconfig`
- [x] `.env.example`
- [x] `eslint.config.mjs`
- [x] `.husky/pre-commit`
- [x] `.lintstagedrc.mjs`
- [x] `pnpm-lock.yaml`

## Shared Package (`packages/shared`)
- [x] `package.json`
- [x] `tsconfig.json`
- [x] `src/index.ts`
- [x] `src/types/` (api, workspace, user, task, habit, note, enums)
- [x] `src/constants/` (priorities, status)
- [x] `src/validators/`

## Web App (`apps/web`)
- [x] `package.json`
- [x] `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`
- [x] `vite.config.ts`
- [x] `index.html`
- [x] `components.json` (shadcn/ui)
- [x] `src/main.tsx`
- [x] `src/App.tsx`
- [x] `src/styles/globals.css` (design tokens + Tailwind v4)
- [x] `src/vite-env.d.ts`
- [x] `src/lib/utils.ts`
- [x] `public/manifest.json`

## API (`apps/api`)
- [x] `package.json`
- [x] `tsconfig.json` + `tsconfig.build.json`
- [x] `nest-cli.json`
- [x] `prisma/schema.prisma` (minimal foundation models)
- [x] `src/main.ts`
- [x] `src/app.module.ts`
- [x] `src/app.controller.ts`
- [x] `src/app.service.ts`
- [x] `src/config/configuration.ts`
- [x] `src/config/env.validation.ts`
- [x] `src/prisma/prisma.module.ts`
- [x] `src/prisma/prisma.service.ts`
- [x] `src/redis/redis.module.ts`
- [x] `src/redis/redis.service.ts`
- [x] `src/common/filters/` (http-exception, all-exceptions)
- [x] `src/common/interceptors/` (transform, logging)
- [x] `src/common/pipes/validation.pipe.ts`
- [x] `src/common/decorators/` (current-user, workspace-id)
- [x] `src/common/dto/` (api-response, pagination)

## Docker & CI/CD
- [x] `docker-compose.yml`
- [x] `docker-compose.dev.yml`
- [x] `docker/Dockerfile.web`
- [x] `docker/Dockerfile.api`
- [x] `docker/.dockerignore`
- [x] `docker/nginx.conf`
- [x] `.github/workflows/ci.yml`

## Verification
- [x] `pnpm install` succeeds
- [x] `pnpm db:generate` succeeds
- [x] `pnpm typecheck` succeeds
- [x] `pnpm lint` succeeds
- [x] `pnpm build` compiles (shared -> web + api)
- [ ] Docker Compose services start (PostgreSQL, Redis)
- [ ] API starts and responds to health check
- [x] Web dev server starts

## Notes
- The workspace is not currently a Git repository, so Husky reports `fatal: not in a git directory` during `prepare`; pnpm still completes successfully.
- Local verification used the bundled Codex pnpm at `C:\Users\saira\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd` because `pnpm` is not on the global PATH.
