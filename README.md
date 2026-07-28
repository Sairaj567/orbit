# Orbit — Collaborative Productivity Platform

Orbit is a shared productivity and life management system built to co-manage tasks, habits, study blocks, notes, and analytics with real-time synchronization, gamification, and deep integrations. It is architected as a modular, containerized monorepo built to scale from two users to multi-tenant workspaces.

---

## 1. Current Project State

As of completion of **Milestone 1 (Foundation)**, the project structure, dependency pipelines, shared types, and build scripts are fully functional and compile successfully. The **Milestone 2 (Design System)** specifications have also been drafted.

### Monorepo Structure

Orbit utilizes **Turborepo** and **pnpm Workspaces** to manage the frontend application, backend application, and shared package.

- **`/apps/web`**: Single Page Application built with React 19, Vite, Tailwind CSS v4, and shadcn/ui.
- **`/apps/api`**: Application backend built with NestJS, integrated with Prisma ORM, Redis caching/messaging, BullMQ background queues, and Clerk Auth.
- **`/packages/shared`**: A compiled internal package exporting shared interfaces, TypeScript types (e.g. enums, DTO models), status/priority constants, and Zod validator schemas used by both the frontend and backend.

---

## 2. Directory Map

Below is the structured layout of the workspace:

```
orbit/
├── .github/workflows/       # CI GitHub Actions configuration
│   └── ci.yml               # Automated linting, type-checking, and building
├── apps/
│   ├── api/                 # NestJS Application
│   │   ├── prisma/          # Prisma database schema configuration
│   │   ├── src/             # Backend source files
│   │   │   ├── auth/        # Clerk guards, decorators, and strategies
│   │   │   ├── common/      # Global interceptors, filters, decorators, and DTOs
│   │   │   ├── config/      # Environment configurations and validation
│   │   │   ├── prisma/      # Database client services
│   │   │   └── redis/       # Redis configuration services
│   │   └── package.json
│   └── web/                 # React Frontend Application
│       ├── public/          # Static assets and PWA manifest.json
│       ├── src/             # Frontend source files
│       │   ├── components/  # Reusable UI component libraries
│       │   ├── lib/         # Utility functions (cn class merging)
│       │   ├── styles/      # Globals.css containing Tailwind v4 design tokens
│       │   └── App.tsx      # Main React application entry point
│       └── package.json
├── docker/                  # Docker container build scripts
│   ├── Dockerfile.api       # Multi-stage production API image build
│   └── Dockerfile.web       # Multi-stage production Web static server image build
├── packages/
│   └── shared/              # Shared package workspace
│       ├── src/             # Core shared constants, types, and zod validation schemas
│       └── package.json
├── docker-compose.dev.yml   # Docker development overrides (pgAdmin)
├── docker-compose.yml       # Production-ready PostgreSQL and Redis services
├── package.json             # Root monorepo script orchestrations
├── pnpm-workspace.yaml      # Monorepo workspaces definition
├── tsconfig.base.json       # Base strict TypeScript configurations
└── turbo.json               # Turborepo caching pipelines
```

---

## 3. Technology Stack

| Layer                | Technology       | Status / Usage                                      |
| :------------------- | :--------------- | :-------------------------------------------------- |
| **Monorepo Manager** | Turborepo + pnpm | Project building orchestration & dependency caching |
| **Frontend**         | React 19 + Vite  | UI framework and developer build server             |
| **Styling**          | Tailwind CSS v4  | CSS-first custom theme design tokens                |
| **Backend**          | NestJS           | Robust modular application backend framework        |
| **Database ORM**     | Prisma           | PostgreSQL interface & type-safe queries            |
| **Caching/Queuing**  | Redis            | Caching, bullMQ runner, and pub/sub gateway         |
| **Auth Gateway**     | Clerk            | MFA, OAuth session handshakes, and route guards     |

---

## 4. How to Get Started (Local Setup)

Follow these steps to configure, build, and run Orbit in your local development environment.

### 4.1 Prerequisites

- **Node.js**: `>=20.0.0`
- **pnpm**: `^9.15.0`
- **Docker & Docker Compose**: Installed and active.

### 4.2 Installation

Install all dependencies across the monorepo from the root:

```bash
pnpm install
```

### 4.3 Configure Environment Variables

1. Copy the template `.env.example` file in the root directory to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the required keys (specifically `DATABASE_URL`, `REDIS_URL`, and Clerk authentication keys).

### 4.4 Build & Generate Code

1. Start the Docker containers for PostgreSQL and Redis:
   ```bash
   docker compose up -d
   ```
2. Generate the Prisma Client locally:
   ```bash
   pnpm db:generate
   ```
3. Run the project build to compile `@orbit/shared` and verify workspaces:
   ```bash
   pnpm build
   ```

### 4.5 Run Local Development Servers

Run the development servers concurrently with cache-disabled rebuilds:

```bash
pnpm dev
```

- **Web App**: Accessible at `http://localhost:5173`
- **API Server**: Running at `http://localhost:3001`

---

## 5. Next Steps

With Milestone 1 fully compiled and verified, the next phase focuses on translating the draft **[design_system.md](file:///C:/Users/saira/.gemini/antigravity/brain/b2e75374-312d-4cfe-9f83-7c3e5038cce1/design_system.md)** spec into core UI component libraries, layout frameworks, and responsive pages.

---

## 6. Architecture Constraints

### Realtime State & Deployment

- **Single Instance Constraint:** The `RealtimeGateway` (Socket.IO server) currently maintains in-memory maps of connected users to support rapid eviction workflows and caching updates across the client. The backend MUST remain explicitly deployed as a single Node.js process (single instance) to prevent event delivery failures and desynchronization.
- **Future Scale:** Multi-instance deployments and load balancing will require the introduction of the `@nestjs/platform-socket.io` Redis Adapter and refactoring of local memory maps to Redis-backed session tracking.
