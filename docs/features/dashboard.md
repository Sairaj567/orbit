# Dashboard & Productivity Insights

The Dashboard serves as the central command center for the Orbit Workspace, providing users with a comprehensive view of their work and progress.

## Overview
The Dashboard aggregates data across Tasks, Habits, Focus Sessions (Study Blocks), Projects, and Activity. It focuses on clarity, speed, and premium UI to help users stay on top of their priorities.

## Components
- **ProductivityCards**: High-level metrics for today and the current week (Tasks Completed, Focus Time, Habit Completion %, Current Streak, Weekly Productivity Score).
- **DashboardCharts**: Lightweight visual representations of Weekly Focus Hours and Tasks Completed.
- **RecentProjects**: Quick access to the most recently active projects with completion progress and member counts.
- **Today's Tasks & Habits**: Contextual lists of immediate priorities.
- **Activity Feed**: Reuses the core activity engine to display 10 recent events in the workspace.
- **DashboardQuickActions**: Keyboard shortcuts accessible via the Command Palette to quickly navigate to the dashboard, analytics, today's tasks, today's habits, or start a focus session.

## Backend Architecture
- **DashboardService**: A dedicated service in `@orbit/api` that runs optimized, aggregated Prisma queries to fetch and compute all dashboard data.
- **Realtime Integration**: The frontend `['dashboard', workspaceId]` React Query cache automatically invalidates and refetches when relevant events (e.g., `task.completed`, `habit.completed`, `studyBlock.completed`, `project.updated`) occur, ensuring the dashboard is always up-to-date without polling.

## Performance Considerations
To ensure the dashboard remains responsive even with thousands of records, computations are memoized where possible, and only active or recent records are aggregated (e.g., tasks due today, recent 4 projects, 10 activity items).
