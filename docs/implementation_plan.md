# Milestone 2 — Application Shell & Architecture

## Overview

Build the complete application framework that all future features plug into. No business logic — only infrastructure, shell, routing, state, providers, components, animations, and audio.

> [!IMPORTANT]
> All dependencies are already installed: `react-router`, `zustand`, `framer-motion`, `@tanstack/react-query`, `lucide-react`, `sonner`, `class-variance-authority`.

---

## Architectural Decisions

| Decision | Choice | Rationale |
|:---|:---|:---|
| **Folder structure** | Feature-flat within `src/` | `stores/`, `providers/`, `lib/`, `components/layout/`, `components/ui/`, `pages/`, `hooks/`, `config/` — keeps imports predictable |
| **Component pattern** | Named exports, no default exports | Enables tree-shaking and refactor-safe imports |
| **State pattern** | Zustand slices with selectors | Minimal boilerplate, works outside React tree, no providers needed |
| **Provider stack** | Single `Providers.tsx` compositor | Clean `main.tsx`, easy to add/remove providers |
| **Route loading** | `React.lazy` + `Suspense` with `LoadingBoundary` | Code-splits every page, consistent loading UX |
| **Layout nesting** | React Router nested routes with `<Outlet />` | `AppShell` → `WorkspaceLayout` → `ContentLayout` → Page |
| **CSS approach** | Tailwind v4 utilities + design tokens from `globals.css` | Already configured in Milestone 1 |
| **Dark mode** | Class-based (`.dark` on `<html>`) via Zustand `theme.store` | Matches existing `globals.css` setup |

---

## Phase 2.1 — Application Shell

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/config/navigation.ts` | Sidebar nav items, route paths, icons, keyboard shortcuts |
| 2 | `src/components/layout/Sidebar.tsx` | Collapsible sidebar with nav links, workspace switcher, user menu |
| 3 | `src/components/layout/TopBar.tsx` | Top bar with breadcrumbs, search trigger, notifications, quick-add |
| 4 | `src/components/layout/MobileNav.tsx` | Bottom tab bar for mobile viewports |
| 5 | `src/components/layout/WorkspaceSwitcher.tsx` | Dropdown to switch between workspaces |
| 6 | `src/components/layout/UserMenu.tsx` | Avatar dropdown with profile, settings, sign-out |
| 7 | `src/components/layout/SearchTrigger.tsx` | `Ctrl+K` button that opens command palette |
| 8 | `src/components/layout/NotificationButton.tsx` | Bell icon with unread badge |
| 9 | `src/components/layout/QuickAddButton.tsx` | Floating `+` button for global task/habit creation |
| 10 | `src/components/layout/Breadcrumbs.tsx` | Dynamic breadcrumb trail from route hierarchy |
| 11 | `src/components/layout/index.ts` | Barrel exports |

---

## Phase 2.2 — Routing

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/config/routes.ts` | Route path constants and route metadata |
| 2 | `src/pages/DashboardPage.tsx` | Placeholder page shell |
| 3 | `src/pages/TasksPage.tsx` | Placeholder |
| 4 | `src/pages/TaskDetailPage.tsx` | Placeholder |
| 5 | `src/pages/HabitsPage.tsx` | Placeholder |
| 6 | `src/pages/StudyPage.tsx` | Placeholder |
| 7 | `src/pages/NotesPage.tsx` | Placeholder |
| 8 | `src/pages/CalendarPage.tsx` | Placeholder |
| 9 | `src/pages/AnalyticsPage.tsx` | Placeholder |
| 10 | `src/pages/AchievementsPage.tsx` | Placeholder |
| 11 | `src/pages/ActivityPage.tsx` | Placeholder |
| 12 | `src/pages/SettingsPage.tsx` | Placeholder |
| 13 | `src/pages/WorkspaceSettingsPage.tsx` | Placeholder |
| 14 | `src/pages/NotFoundPage.tsx` | 404 page with illustration |
| 15 | `src/pages/index.ts` | Lazy-loaded barrel exports |
| 16 | `src/components/ErrorBoundary.tsx` | Global error boundary with retry |
| 17 | `src/router.tsx` | React Router configuration with nested layouts |
| 18 | `src/App.tsx` | **Rewrite** — mounts router + providers |

---

## Phase 2.3 — Layouts

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/components/layout/AppShell.tsx` | Root layout: sidebar + topbar + content area |
| 2 | `src/components/layout/ContentLayout.tsx` | Scrollable content area with max-width container |
| 3 | `src/components/layout/PageHeader.tsx` | Reusable page title + description + actions |
| 4 | `src/components/layout/EmptyState.tsx` | Illustrated empty state with CTA |
| 5 | `src/components/layout/LoadingBoundary.tsx` | Suspense wrapper with skeleton fallback |
| 6 | `src/components/layout/ProtectedLayout.tsx` | Auth gate (wraps authenticated routes) |
| 7 | `src/components/layout/WorkspaceLayout.tsx` | Ensures workspace is selected/loaded |

---

## Phase 2.4 — Global Providers

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/providers/ThemeProvider.tsx` | Applies `.dark` class, syncs with system preference |
| 2 | `src/providers/QueryProvider.tsx` | TanStack Query client configuration |
| 3 | `src/providers/ToastProvider.tsx` | Sonner toast configuration |
| 4 | `src/providers/Providers.tsx` | Composes all providers into a single wrapper |

> [!NOTE]
> Socket, Command Palette, Dialog, Tooltip, Sound, Animation, Auth, and Workspace providers are registered in `Providers.tsx` but their full implementations will use the stores from Phase 2.5. Tooltip/Dialog/Command use Radix primitives via shadcn when components are built in Phase 2.7.

---

## Phase 2.5 — Global State (Zustand)

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/stores/ui.store.ts` | Sidebar open/collapsed, mobile menu, command palette, modals |
| 2 | `src/stores/theme.store.ts` | Theme preference (dark/light/system), accent color |
| 3 | `src/stores/workspace.store.ts` | Active workspace, member list, workspace settings |
| 4 | `src/stores/notification.store.ts` | Unread count, notification items, mark-read |
| 5 | `src/stores/presence.store.ts` | Online members, typing indicators |
| 6 | `src/stores/sound.store.ts` | Sound enabled/disabled, volume, individual sound toggles |
| 7 | `src/stores/accessibility.store.ts` | Reduced motion, high contrast, font size |
| 8 | `src/stores/index.ts` | Barrel exports |

---

## Phase 2.6 — Utilities

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/lib/date.ts` | Relative time, format date, calendar helpers |
| 2 | `src/lib/format.ts` | Number formatting, pluralization, truncation |
| 3 | `src/lib/priority.ts` | Priority label, color, icon mapping |
| 4 | `src/lib/animation.ts` | Framer Motion variant presets, spring configs |
| 5 | `src/lib/color.ts` | Status colors, user avatar colors, priority badge colors |
| 6 | `src/lib/routes.ts` | Route builder helpers, workspace-scoped paths |
| 7 | `src/lib/permissions.ts` | Role-based permission checks |
| 8 | `src/lib/keyboard.ts` | Keyboard shortcut registration and handling |

---

## Phase 2.7 — Design Components

Uses `class-variance-authority` for variant-driven styling. Each component follows the shadcn pattern.

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/components/ui/button.tsx` | Multi-variant button with loading state |
| 2 | `src/components/ui/card.tsx` | Card container with header/content/footer |
| 3 | `src/components/ui/input.tsx` | Text input with label and error states |
| 4 | `src/components/ui/textarea.tsx` | Multi-line text input |
| 5 | `src/components/ui/avatar.tsx` | User avatar with fallback initials |
| 6 | `src/components/ui/badge.tsx` | Status/priority badge with color variants |
| 7 | `src/components/ui/progress.tsx` | Linear progress bar |
| 8 | `src/components/ui/tabs.tsx` | Tab navigation |
| 9 | `src/components/ui/dialog.tsx` | Modal dialog with overlay |
| 10 | `src/components/ui/dropdown-menu.tsx` | Action dropdown menu |
| 11 | `src/components/ui/popover.tsx` | Floating popover |
| 12 | `src/components/ui/tooltip.tsx` | Hover tooltip |
| 13 | `src/components/ui/command.tsx` | Command palette (cmdk-based) |
| 14 | `src/components/ui/search-input.tsx` | Search field with icon and clear button |
| 15 | `src/components/ui/skeleton.tsx` | Loading skeleton shapes |
| 16 | `src/components/ui/separator.tsx` | Horizontal/vertical divider |
| 17 | `src/components/ui/scroll-area.tsx` | Custom scrollbar container |
| 18 | `src/components/ui/sheet.tsx` | Slide-out drawer panel |
| 19 | `src/components/ui/stat-card.tsx` | Metric card with label, value, trend |
| 20 | `src/components/ui/section-header.tsx` | Section title with optional action |
| 21 | `src/components/ui/responsive-grid.tsx` | Auto-responsive CSS grid container |
| 22 | `src/components/ui/index.ts` | Barrel exports |

> [!NOTE]
> Most shadcn primitives (dialog, dropdown, popover, tooltip, command, tabs, scroll-area, sheet) will be installed via `npx shadcn@latest add` before manual customization. This gives us Radix UI accessibility for free.

---

## Phase 2.8 — Animations

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/components/motion/PageTransition.tsx` | Animate page entry/exit on route change |
| 2 | `src/components/motion/MotionDiv.tsx` | Reusable animated div with preset variants |
| 3 | `src/components/motion/AnimateList.tsx` | Staggered list animation wrapper |
| 4 | `src/components/motion/ReducedMotion.tsx` | HOC that disables animations when `prefers-reduced-motion` |
| 5 | `src/hooks/useReducedMotion.ts` | Hook to detect reduced motion preference |
| 6 | `src/components/motion/index.ts` | Barrel exports |

> Sidebar, modal, drawer, hover, and press animations are built into the individual components using the animation presets from `src/lib/animation.ts`.

---

## Phase 2.9 — Audio

| # | File | Purpose |
|:--|:---|:---|
| 1 | `src/lib/sounds.ts` | Web Audio API sound engine with synthesized tones |
| 2 | `src/hooks/useSound.ts` | Hook to play sounds with respect to user preferences |
| 3 | `src/hooks/index.ts` | Barrel exports for all hooks |

---

## Verification Plan

### Build Check
```bash
pnpm build
```
All 3 packages must compile without errors.

### Manual Verification
- Sidebar collapses/expands on desktop
- Mobile bottom nav appears below `640px`
- Every route renders its placeholder page
- `Ctrl+K` opens command palette overlay
- Theme toggles between dark and light
- Page transitions animate on route change
- Sound plays on interaction (when enabled)
- Reduced motion disables animations
- 404 page renders for unknown routes
- Error boundary catches rendering errors
