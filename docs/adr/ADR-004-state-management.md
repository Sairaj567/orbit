# ADR-004: State Management

## Context
React applications often suffer from blurred lines between UI state (e.g., is a modal open) and Server state (e.g., the list of tasks fetched from the database).

## Decision
We will enforce a strict separation:
1. **Zustand** will be used exclusively for ephemeral client-side UI state.
2. **React Query (@tanstack/react-query)** will be used exclusively for fetching, caching, and mutating asynchronous server state.

## Consequences
- **Positive**: Avoids bloated global stores. Automatic caching, background refetching, and optimistic updates provided by React Query.
- **Negative**: Developers must learn two separate patterns instead of a unified one (like Redux Toolkit).

## Alternatives
- Redux: Rejected due to boilerplate.
- Context API: Rejected for server state due to lack of caching and excessive re-renders.

## Status
Approved
