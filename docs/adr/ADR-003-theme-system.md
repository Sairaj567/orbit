# ADR-003: Theme System

## Context
We need a UI component and styling strategy that allows for rapid development, accessibility, and high customization to meet Orbit's premium design requirements without fighting an opinionated framework.

## Decision
We will use Tailwind CSS v4 in combination with shadcn/ui.

## Consequences
- **Positive**: Complete control over component markup and styling. Accessible by default via Radix primitives.
- **Negative**: Components are owned by the codebase, meaning updates require manual intervention rather than a simple npm bump.

## Alternatives
- Material UI (MUI): Rejected as it is too opinionated and difficult to override visually.
- Chakra UI: Evaluated but shadcn provides better fine-grained control and zero runtime CSS-in-JS overhead.

## Status
Approved
