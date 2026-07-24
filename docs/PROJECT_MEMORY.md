# Project Memory

## Why Orbit Exists
Orbit was created to solve the fragmentation of personal and collaborative productivity. Instead of using separate apps for tasks, habits, timers, and notes, Orbit centralizes them into one cohesive, gamified, and real-time synchronized platform.

## Long-term Vision
To become the default "operating system" for small teams, partners, and individuals looking to track and gamify their entire productivity lifecycle.

## Core Philosophy
- **All-in-One but Modular**: The system has many features, but they shouldn't overwhelm the user.
- **Gamification**: Progress should feel rewarding.
- **Speed**: Interactions must be instantaneous, backed by optimistic UI updates and real-time sockets.
- **Collaboration First**: Everything is built within the context of a "Workspace", even if used by one person.
- **Projects as Hubs**: Tasks, Habits, Notes, and Resources are not isolated; they exist within contextual "Projects" (or Spaces) like "AWS Restart Course" or "Home Chores", forming the backbone of the application.

## Non-negotiable Architectural Decisions
1. **Monorepo**: Turborepo + pnpm. Do not split the repo.
2. **Shared Types**: Use `@orbit/shared` for all DTOs and Zod schemas to ensure frontend/backend contract integrity.
3. **Prisma**: Do not write raw SQL; rely on Prisma for schema modeling and migrations.
4. **Tailwind v4 + shadcn/ui**: Do not install heavy component libraries like MUI or Ant Design.

## Things Intentionally NOT Implemented
- **Complex Project Management**: We are not Jira. Keep task management simple (Status, Priority, Assignee).
- **Native Mobile Apps (Yet)**: We focus on a responsive Web PWA first.

## Future Direction
- Deep calendar integrations (Google Calendar sync).
- AI summaries of notes and daily productivity.

## Lessons Learned
*(To be populated as development progresses)*
