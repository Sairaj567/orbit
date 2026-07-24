# 07 UI Guidelines

## Component Creation
- Favor extracting logic into custom hooks.
- Create dumb, purely presentational components when possible.
- Use `shadcn/ui` components as the foundation. Run the shadcn CLI or manually implement using Radix primitives if needed.

## Styling (Tailwind v4)
- Use semantic colors from the design system (e.g., `text-primary`, `bg-background`).
- Avoid arbitrary values (e.g., `w-[32px]`) unless strictly necessary; use the spacing scale.
- Use the `cn()` utility (clsx + tailwind-merge) for conditional classes.

## State Management
- **Zustand**: For ephemeral UI state (e.g., sidebar open, selected filters).
- **React Query**: For asynchronous server state. Do not store API responses in Zustand.

## Animations
- Use `framer-motion` for complex transitions (e.g., AnimatePresence for modals, layout animations for lists).
- Keep animations subtle and fast (duration < 300ms typically).

## Accessibility
- Always include `aria-labels` for icon-only buttons.
- Ensure keyboard navigability (handled mostly by Radix UI).
