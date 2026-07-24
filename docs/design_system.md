# Orbit — Product Design Specification & Wireframes

This document contains the complete visual identity, interaction design system, responsiveness matrix, accessibility guidelines, page wireframes, and animation/sound specifications for Orbit.

---

## 1. Design System & Visual Language

Orbit’s design language is **high-fidelity, dark-first, structural, and tactile**. It draws direct inspiration from:
- **Linear**: Flat-hierarchy navigation, keyboard-first inputs, crisp borders, and monospaced indicators.
- **Arc Browser**: Translucent glassmorphism (`backdrop-filter`), vibrant glow-borders, and nested hierarchy tabs.
- **Notion**: Functional simplicity, rich metadata context, and deep customization.
- **Apple (macOS)**: Soft shadow physics, springy motion, and consistent focus states.
- **Raycast**: Command menus, compact action lists, and ultra-high-density micro-layouts.

### 1.1 Core Identity
- **Default Theme**: Dark-first, using rich neutral grays with subtle slate/blue undertones.
- **Accent Theme**: Vibrant violet (`oklch(0.60 0.22 285)`) used selectively for main actions, active states, and brand signatures.
- **Glow & Translucency**: Glassmorphism is applied to modal containers, floating menus, and sidebars.

---

### 1.2 Design Tokens (Visual Schema)

All visual tokens are defined via OKLCH values for perceptual uniformity, enabling flawless contrast scaling.

```json
{
  "color": {
    "dark": {
      "background": "oklch(0.12 0.015 256)",
      "card": "oklch(0.15 0.018 256 / 0.7)",
      "popover": "oklch(0.17 0.020 256)",
      "border": "oklch(0.24 0.015 256)",
      "border-light": "oklch(0.28 0.015 256)",
      "foreground": "oklch(0.96 0.005 256)",
      "muted": "oklch(0.55 0.015 256)",
      "accent": "oklch(0.60 0.22 285)",
      "accent-hover": "oklch(0.65 0.22 285)",
      "accent-muted": "oklch(0.60 0.22 285 / 0.15)",
      "success": "oklch(0.65 0.18 145)",
      "warning": "oklch(0.78 0.16 75)",
      "error": "oklch(0.60 0.22 25)",
      "info": "oklch(0.68 0.16 230)"
    },
    "light": {
      "background": "oklch(0.985 0.002 256)",
      "card": "oklch(1.0 0.0 0 / 0.8)",
      "popover": "oklch(1.0 0.0 0)",
      "border": "oklch(0.89 0.005 256)",
      "border-light": "oklch(0.92 0.005 256)",
      "foreground": "oklch(0.18 0.006 256)",
      "muted": "oklch(0.58 0.010 256)",
      "accent": "oklch(0.55 0.21 285)",
      "accent-hover": "oklch(0.50 0.21 285)",
      "accent-muted": "oklch(0.55 0.21 285 / 0.1)",
      "success": "oklch(0.62 0.17 145)",
      "warning": "oklch(0.72 0.15 75)",
      "error": "oklch(0.55 0.21 25)",
      "info": "oklch(0.62 0.17 230)"
    }
  },
  "spacing": {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1.0rem",
    "6": "1.5rem",
    "8": "2.0rem",
    "12": "3.0rem",
    "16": "4.0rem",
    "20": "5.0rem",
    "24": "6.0rem"
  },
  "font-size": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1.0rem",
    "md": "1.125rem",
    "lg": "1.25rem",
    "xl": "1.5rem",
    "2xl": "1.875rem",
    "3xl": "2.25rem",
    "4xl": "3.0rem"
  },
  "border-radius": {
    "xs": "4px",
    "sm": "6px",
    "md": "10px",
    "lg": "14px",
    "xl": "20px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
    "lg": "0 12px 24px -4px rgba(0, 0, 0, 0.5), 0 4px 12px -6px rgba(0, 0, 0, 0.4)",
    "xl": "0 24px 48px -8px rgba(0, 0, 0, 0.65), 0 8px 24px -10px rgba(0, 0, 0, 0.5)",
    "glow": "0 0 16px 2px var(--glow-color)"
  }
}
```

---

### 1.3 Color Palette (OKLCH Mapping)

Orbit defines specific semantic palettes to govern priority and progress:

| Color Token | Dark Value | Light Value | Semantic Use |
| :--- | :--- | :--- | :--- |
| **Accent / Violet** | `oklch(0.60 0.22 285)` | `oklch(0.55 0.21 285)` | Primary interactive accents, focused states, signatures. |
| **Critical Priority**| `oklch(0.60 0.22 25)`  | `oklch(0.55 0.21 25)`  | Fatal errors, blocking tasks, delete/destruction actions. |
| **High Priority**    | `oklch(0.70 0.18 50)`  | `oklch(0.65 0.17 50)`  | High urgency tasks, warning states, attention triggers. |
| **Medium Priority**  | `oklch(0.80 0.16 85)`  | `oklch(0.75 0.15 85)`  | Medium priority items, normal status alerts. |
| **Low Priority**     | `oklch(0.65 0.18 155)` | `oklch(0.60 0.17 155)` | Low priority items, healthy checklist steps. |
| **Optional**         | `oklch(0.55 0.02 260)` | `oklch(0.58 0.02 260)` | Backlogs, optional habits, minor details. |

---

### 1.4 Typography & Spacing Systems
- **Base Grid**: 4px structural increments. All spacing tokens stack linearly to maintain vertical rhythm.
- **Font Stack**:
  - **Sans (Interface)**: `Inter`, ui-sans-serif, system-ui. Optimized for legibility with tight tracking (`letter-spacing: -0.015em`) for headers.
  - **Mono (Metrics/Code/Metadata)**: `JetBrains Mono`. Used for time logs, XP counts, shortcuts, and code blocks.
- **Visual Scale**:
  - `Display / 4xl`: 48px (Line-height: 56px) - Pitch titles, milestone rewards.
  - `H1 / 3xl`: 36px (Line-height: 44px) - Page main header.
  - `H2 / xl`: 24px (Line-height: 32px) - Content groups, dashboard cards.
  - `Body / base`: 16px (Line-height: 24px) - Rich text notes, details.
  - `Body / sm`: 14px (Line-height: 20px) - Task items, sidebar labels.
  - `Metadata / xs`: 12px (Line-height: 16px) - Shortcuts, dates, tags.

---

### 1.5 Elevation, Motion & Responsive Systems

#### Elevation Levels
1. **L0 (Base / Slate)**: Background area. Deep slate. Flat.
2. **L1 (Canvas / Cards)**: Inner sections, task list rows. Thin border `oklch(0.24 0.015 256)`, 10px radius, shadow `sm`.
3. **L2 (Overlay / Dialogs)**: Modals, quick-adds. Translucent backdrop filter (`blur(12px)`), glow-border `oklch(0.28 0.015 256 / 0.8)`, shadow `lg`.
4. **L3 (Floating / Tooltips)**: Context menus. Shadow `xl`, radius `xs`/`sm`, border-light.

#### Motion System (Framer Motion Specs)
- **Springs (Tactile Buttons/Toggles)**: `type: "spring", stiffness: 450, damping: 28`
- **Linear Slides (Menus/Sidebars)**: `type: "spring", stiffness: 300, damping: 30`
- **Soft Fades (Overlay/Modals)**: `transition: { duration: 0.15, ease: "easeInOut" }`

#### Responsive Breakpoints
- **Mobile (`sm`)**: `< 640px` (Single column, sticky bottom navigation drawer, full-screen modals).
- **Tablet (`md` to `lg`)**: `640px - 1024px` (Collapsible sidebar, dual-pane flex layouts).
- **Desktop (`xl` to `2xl`)**: `> 1024px` (Multi-pane layouts, sticky utility sidebar, overlay command popovers).

---

## 2. Component Inventory & Interaction States

All UI controls must support unified states:

```
[Idle State] ─(Hover)─> [Scale 1.02 + Glass Glow]
     │
  (Press)
     ▼
[Scale 0.98 + Shift Bg] ──(Release)──> [Success/Action Trigger]
```

### 2.1 Basic Component Rules
- **Interactive Targets**: Minimum `44px x 44px` on mobile, `32px x 32px` on desktop.
- **Keyboard Navigation**: Any element containing an action must support `focus-visible`, presenting a `2px` offset outline using `var(--color-accent)`.

### 2.2 Global State Feedback Templates

#### 1. Empty States
- **Design**: Centered abstract vector drawing or emoji floating inside a dotted container, paired with a distinct action button.
- **Motion**: 12px floating loop (`y: [-4, 4, -4]` over 4 seconds) to keep the screen feeling dynamic yet calm.
- **Copy**: Short, encouraging prompt rather than "No data". (e.g., *"Your day is clear. Draft a new task or start a study block."*)

#### 2. Error States
- **Visuals**: Border glows red (`oklch(0.60 0.22 25)`). Subtle horizontal shake animation.
- **Micro-copy**: Human-readable descriptions explaining *why* it failed, coupled with a retry action. (e.g., *"Cannot connect to live server. Retrying in 4s..."*)

#### 3. Loading States
- **Skeletons**: Layout-matched shapes flashing slowly (`opacity: [0.3, 0.7, 0.3]` over 1.6s).
- **Progress Indicators**: Infinite micro-shimmer line (`h-0.5` gradient moving left-to-right at the top of the container).

#### 4. Success States
- **Action Complete**: Temporary border glow changes to low-priority green (`oklch(0.65 0.18 145)`).
- **Milestone Reached**: Center screen particle explosion (Confetti) using Canvas API, with custom success audio cue.

---

## 3. Detailed Wireframes & Page Layouts

Below are ASCII layouts outlining structure, responsive adjustments, and core design grids.

### 3.1 Page 1: Dashboard (Shared Hub)
Surfaces active workspaces, shared habit streaks, running timers, and a collaborative activity feed.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]             [Timer: Java Study 08:42 ⏸]  [Saira User] [Partner User]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Dashboard   │                                                                        │
│ ✓ Tasks (12)  │  GOOD EVENING, SAIRA & LIAM.                                           │
│ 📓 Notes (4)   │  "Progress is not linear."                                             │
│ ⏳ Study       │  ┌──────────────────────────────┐ ┌────────────────────────────────┐  │
│ 📈 Analytics   │  │ Shared Habits Streaks        │ │ Today's Focus Tasks            │  │
│ 📅 Calendar    │  │ ☕ Coffee break  🔥 12 days   │ │ [ ] Refactor Prisma    !! Crit  │  │
│ 🏆 Trophies    │  │ 🌐 Duolingo      🔥  4 days   │ │ [ ] AWS Practice       ! High   │  │
│               │  │ 📚 Java Study    🔥 18 days   │ │ [ ] Chess Daily        - Opt    │  │
│               │  └──────────────────────────────┘ └────────────────────────────────┘  │
│ [Liam typing] │  ┌──────────────────────────────────────────────────────────────────┐  │
│ Settings      │  │ Collaborative Activity Feed (Real-Time)                          │  │
│               │  │ • Liam completed "Dishes" (10 XP)                     10m ago    │  │
│               │  │ • Saira started "AWS Study Block"                     25m ago    │  │
│               │  └──────────────────────────────────────────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Sidebar folds into a bottom navigation bar. Columns stack vertically: Timer banner first, then Shared Habits, Today's Focus, and finally Activity Feed.
- **Tablet Reflow**: Sidebar collapses to an icon-only ribbon. The two cards stack horizontally; the Activity feed takes up the bottom viewport width.

---

### 3.2 Page 2: Tasks (Workspace List)
Highly structured Kanban-like column list showing groupings by status, priority, or category.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]             [Filter: All ▾] [Sort: Priority ▾]          [+ New Task]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  TASKS                                                                 │
│               │  ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────┐│
│               │  │ TO DO (3)              │ │ IN PROGRESS (1)        │ │ DONE (22)    ││
│               │  ├────────────────────────┤ ├────────────────────────┤ ├──────────────┤│
│               │  │ [ ] Refactor API       │ │ [/] Build DB Schema    │ │ [x] git init ││
│               │  │     !! Crit • ☕ Chores │ │     ! High • 🛠 Eng    │ │     - Opt    ││
│               │  │                        │ │                        │ │              ││
│               │  │ [ ] Setup Auth         │ │                        │ │              ││
│               │  │     ! High • 🔐 Sec    │ │                        │ │              ││
│               │  └────────────────────────┘ └────────────────────────┘ └──────────────┘│
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Columns convert to flat tabs (*To Do*, *In Progress*, *Done*). Users swipe horizontally to switch columns. Task card expands full-width.
- **Tablet Reflow**: Keeps columns but drops detailed metadata (category, subtask counts) to maintain layout balance.

---

### 3.3 Page 3: Task Detail (Side Panel / Overlay)
Detailed view containing subtasks, description, assignees, activity history, and comments.

#### Desktop Layout (Split View / Flyout)
```
┌─────────────────────────────────────────────────────────┬──────────────────────────────┐
│ TASKS                                                   │ TASK DETAIL              [X] │
│ ┌────────────────────────┐ ┌────────────────────────┐   ├──────────────────────────────┤
│ │ TO DO                  │ │ IN PROGRESS            │   │ Title: Build DB Schema       │
│ ├────────────────────────┤ ├────────────────────────┤   │ Status: [In Progress ▾]      │
│ │ [ ] Refactor API       │ │ [/] Build DB Schema ◄──┼───┤ Priority: [! High ▾]         │
│ │                        │ │                        │   │ Assignee: [Saira ▾]          │
│ │                        │ │                        │   ├──────────────────────────────┤
│ │                        │ │                        │   │ Subtasks:                    │
│ │                        │ │                        │   │ [x] Write schema.prisma      │
│ │                        │ │                        │   │ [ ] Run prisma migration     │
│ │                        │ │                        │   ├──────────────────────────────┤
│ │                        │ │                        │   │ Activity Log:                │
│ │                        │ │                        │   │ • Created by Liam 2d ago     │
│ └────────────────────────┘ └────────────────────────┘   │ • Status -> In Progress      │
└─────────────────────────────────────────────────────────┴──────────────────────────────┘
```
- **Mobile Reflow**: Cover modal shifts from the bottom (`y: [100%, 0]`), overlaying 100% of the screen.
- **Tablet Reflow**: Floats as a standard right-hand side panel, sliding out from the right (`x: [100%, 0]`).

---

### 3.4 Page 4: Quick Add (Command Popover)
Global shortcut-triggered interface (`CMD+K` or `C`) designed to parse language input inline.

#### Universal Layout (Overlay HUD)
```
                     ┌──────────────────────────────────────────────┐
                     │  🔍 Add task, habit, or search...            │
                     ├──────────────────────────────────────────────┤
                     │  "Clean kitchen tomorrow at 9am #chore !high" │
                     ├──────────────────────────────────────────────┤
                     │  Parsed Metadata (Preview):                  │
                     │  🗓 Tomorrow, 9:00 AM | 🏷 chore | 🔴 High   │
                     ├──────────────────────────────────────────────┤
                     │  Press [Enter] to save   |   [ESC] to cancel │
                     └──────────────────────────────────────────────┘
```
- **Mobile Reflow**: Anchors to the top of the viewport above the software keyboard, occupying the full width.
- **Tablet & Desktop**: Centered HUD overlay with backdrop filter blur.

---

### 3.5 Page 5: Notes (Structured Knowledge)
Dual-pane editor featuring a folder structure/tree on the left and a clean, distraction-free markdown canvas on the right.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]                                                        [Publish ▾] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │ Folders         │ # AWS Certification Study Guide                      │
│               │ 📂 Cloud (2)    │                                                      │
│               │   📝 AWS Cert ◄─┼── This guide covers core services needed to pass...  │
│               │   📝 IAM Setup  │                                                      │
│               │ 📂 Java         │ ## Core Services                                     │
│               │ 📂 Recipes      │ - **IAM**: Access management and user keys           │
│               │                 │ - **VPC**: Isolated cloud networking                 │
│               │                 │                                                      │
│               │                 │ 💡 Tip: Practice setting up security groups!         │
│               │                 │                                                      │
└───────────────┴─────────────────┴──────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Drill-down hierarchy. View 1: Folder/Note list. View 2: Editor (taking up the entire screen, with a back button).
- **Tablet Reflow**: Left folders list collapses to an icon list. The editor takes up 80% of the screen width.

---

### 3.6 Page 6: Study (Gamified Focus)
Pomodoro timer integrated with active study resources, live playlist selection, and XP progression metrics.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]                                                  [XP: 2,420 • Lvl 4]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  STUDY MODE                                                            │
│               │  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
│               │  │          JAVA MASTER            │ │ Active Reference Material    │  │
│               │  │             24:59               │ │ 🔗 LeetCode: Binary Tree     │  │
│               │  │      [ START / PAUSE ]          │ │ 📓 Java Notes              │  │
│               │  │    [o] Pomodoro  [ ] Stopwatch  │ └──────────────────────────────┘  │
│               │  └─────────────────────────────────┘ ┌──────────────────────────────┐  │
│               │  ┌─────────────────────────────────┐ │ Ambient Soundtrack           │  │
│               │  │ Current Session Target:         │ │ 🎵 Lofi Focus Beats     ▾ 🔊 │  │
│               │  │ Solve 3 LeetCode problems       │ │ [⏮] [▶] [⏭]                 │  │
│               │  └─────────────────────────────────┘ └──────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Stacks into a unified layout. The large timer remains at the top, while ambient sound selections and reference materials stack below.
- **Tablet Reflow**: The timer takes up the left column; reference materials and audio settings stack in the right column.

---

### 3.7 Page 7: Analytics (Activity Insights)
Visual dashboard showcasing task completion rates, habit streaks, time allocation, and collaborative charts.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]             [Range: Last 30 Days ▾]               [Export Report]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  ANALYTICS                                                             │
│               │  ┌──────────────────────────────────────────────────────────────────┐  │
│               │  │ Task Completion Over Time                                        │  │
│               │  │  30 |       *                                                    │  │
│               │  │  15 |   *  * *  *                                                │  │
│               │  │   0 └─┴─┴─┴─┴─┴─┴─>                                              │  │
│               │  │       Mon  Wed  Fri                                              │  │
│               │  └──────────────────────────────────────────────────────────────────┘  │
│               │  ┌──────────────────────────────┐ ┌────────────────────────────────┐  │
│               │  │ Time Allocation              │ │ Streak Leaderboard             │  │
│               │  │ ◼ Study: 42h  ◼ Chores: 12h  │ │ 🥇 Saira: 18d streak (Java)    │  │
│               │  │ ◼ Habits: 18h ◼ Other: 5h    │ │ 🥈 Liam: 12d streak (Coffee)   │  │
│               │  └──────────────────────────────┘ └────────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Charts compress down to simplified, single-column sparklines or summary stats cards.
- **Tablet Reflow**: Cards adjust to a 2-column layout; the primary chart spans across both columns.

---

### 3.8 Page 8: Settings (Workspace Controls)
Control panel for managing profile details, custom themes, notification channels, and active workspace invitations.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  SETTINGS                                                              │
│               │  ┌──────────────────────────────────────────────────────────────────┐  │
│               │  │ Profile Preference                                               │  │
│               │  │ Display Name: [Saira          ]  Timezone: [Asia/Kolkata (GMT+5:3)▾]│  │
│               │  └──────────────────────────────────────────────────────────────────┘  │
│               │  ┌──────────────────────────────────────────────────────────────────┐  │
│               │  │ Discord Webhook (Workspace Shared)                               │  │
│               │  │ URL: [https://discord.com/api/webhooks/...                      ]│  │
│               │  └──────────────────────────────────────────────────────────────────┘  │
│               │  ┌──────────────────────────────┐ ┌────────────────────────────────┐  │
│               │  │ Sound & Motion Settings      │ │ Active Workspace Members       │  │
│               │  │ [x] Play completion chime    │ │ • Saira (Owner)                │  │
│               │  │ [x] Enable spring animations │ │ • Liam (Member)    [Remove]    │  │
│               │  └──────────────────────────────┘ └────────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Shifts to a single menu list that drills down into subsections (Account, Notifications, Theme, Workspace).
- **Tablet Reflow**: Sidebar-less layout featuring full-width settings blocks.

---

### 3.9 Page 9: Calendar (Schedule Grid)
Multi-view calendar displaying scheduled tasks, calendar events, habits, and deadlines.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]                 [ Month ▾ ] [ < July 2026 > ]         [+ Add Event]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  CALENDAR                                                              │
│               │  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐             │
│               │  │ Sun   │ Mon   │ Tue   │ Wed   │ Thu   │ Fri   │ Sat   │             │
│               │  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤             │
│               │  │ 28    │ 29    │ 30    │ 1     │ 2     │ 3     │ 4     │             │
│               │  │       │       │       │ • Java│       │ • AWS │       │             │
│               │  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤             │
│               │  │ 5     │ 6     │ 7     │ 8     │ 9     │ 10    │ 11    │             │
│               │  │       │ • Gym │       │       │       │       │       │             │
│               │  └───────┴───────┴───────┴───────┴───────┴───────┴───────┘             │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Converts to an Agenda list view sorted chronologically. Swiping horizontally at the top moves through different weeks.
- **Tablet Reflow**: Displays a 3-day split column view rather than the full month grid to avoid crowding.

---

### 3.10 Page 10: Achievements (Trophies & Gamification)
Gamified dashboard showcasing unlocked badges, level XP progress, and upcoming milestone cards.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]                                                 [ Level 4: 85% XP ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  TROPHIES & ACHIVEMENTS                                                │
│               │  ┌──────────────────────────────┐ ┌────────────────────────────────┐  │
│               │  │ 🏆 Deep Focus (Unlocked)     │ │ 🏆 Early Bird (Unlocked)       │  │
│               │  │ Done a 4-hour study block.   │ │ Check in a habit before 7:00 AM│  │
│               │  │ Earned: 2d ago  • +150 XP    │ │ Earned: 5d ago  • +100 XP      │  │
│               │  └──────────────────────────────┘ └────────────────────────────────┘  │
│               │  ┌──────────────────────────────┐ ┌────────────────────────────────┐  │
│               │  │ 🔒 Century Mark (Locked)     │ │ 🔒 Sync Crew (Locked)          │  │
│               │  │ Complete 100 tasks.          │ │ Co-complete 5 tasks.           │  │
│               │  │ Progress: [=======---] 74%   │ │ Progress: [==----------] 20%   │  │
│               │  └──────────────────────────────┘ └────────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Grid collapses to a single column scroll list. Locked/upcoming badges collapse into compact progress bars.
- **Tablet Reflow**: 2-column layout with locked and unlocked trophies separated by tabs.

---

### 3.11 Page 11: Activity (Shared History Feed)
Audit log displaying all actions in the workspace: creations, updates, completions, and streak check-ins.

#### Desktop Layout (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORBIT  [WS: Home ▾]             [Filter: All Actors ▾]                     [Clear Logs]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ☰ Sidebar     │  SHARED ACTIVITY LOG                                                   │
│               │  ┌──────────────────────────────────────────────────────────────────┐  │
│               │  │ TODAY                                                            │  │
│               │  │ • Liam checked in Duolingo 🔥 Streak: 4 days             09:12 AM│  │
│               │  │ • Saira completed "Write schema.prisma" (+20 XP)        08:45 AM│  │
│               │  │                                                                  │  │
│               │  │ YESTERDAY                                                        │  │
│               │  │ • Liam updated "Refactor API" deadline -> 15th July      04:30 PM│  │
│               │  │ • Saira created Note: "AWS Study Guide"                  02:15 PM│  │
│               │  └──────────────────────────────────────────────────────────────────┘  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```
- **Mobile Reflow**: Stacks events in a simple scrollable feed. Swiping left on an event reveals quick action buttons (e.g. Emoji reply, Details).
- **Tablet Reflow**: Layout matches desktop but filters collapse into an overlay menu.

---

## 4. Interactive Experience Specification

### 4.1 Keyboard Navigation & Shortcuts

Orbit is fully navigable without a mouse. The keyboard shortcuts are split into three layers:

```
[System Focus] ──(CMD + K)──> [Command Popover HUD]
     │
 (G then T)
     ▼
[Route to Tasks Page]
```

- **Global Actions**:
  - `CMD + K` or `Ctrl + K`: Open Quick Add/Search HUD.
  - `C`: Open Quick Task Add Input directly.
  - `ESC`: Exit dialog, input focus, or active panel.
- **Navigation Shortcuts**:
  - `g` then `d`: Go to Dashboard.
  - `g` then `t`: Go to Tasks.
  - `g` then `n`: Go to Notes.
  - `g` then `s`: Go to Study.
  - `g` then `a`: Go to Analytics.
- **Task Interaction (When focused on list row)**:
  - `Enter`: Open detail side-panel.
  - `e`: Quick archive task.
  - `Space`: Toggle complete status.
  - `1` to `5`: Set priority (`1` for Critical, `5` for Optional).

---

### 4.2 Detailed Animation & Transition Specifications

All animations are designed to feel light and reactive.

```
       Modal Out: y = 20px -> 0px (Ease Out)
            ┌──────────────┐
            │              │
            │  [ Dialog ]  │
            │              │
            └──────────────┘
       Backdrop Fade In: opacity = 0 -> 1 (Linear)
```

#### 1. Page Navigation Transitions
- **Behavior**: Smooth horizontal slide.
- **Direction**:
  - Going forward (menu down): Page enters from right (`x: [24px, 0]`, `opacity: [0, 1]`).
  - Page exiting: Fades out (`opacity: 0`, `x: [0, -12px]`).
- **Timing**: duration: `0.22s`, ease: `[0.16, 1, 0.3, 1]` (custom cubic-bezier).

#### 2. Task Row Completion Transition
- **Trigger**: Checking off a task.
- **Micro-animation**:
  - Custom checkbox springs inward (`scale: 0.85`), then expands (`scale: 1.1`) as the checkmark draws via path offset.
  - Strikethrough line animates left-to-right (`scaleX: [0, 1]`, `originX: 0`).
  - Row card fades slightly (`opacity: 0.5`) and moves down the list after `350ms`.

#### 3. Quick Add HUD Open/Close
- **Open**: Scales up and fades in (`scale: [0.94, 1]`, `opacity: [0, 1]`) using a spring curve.
- **Close**: Drops down slightly and fades (`scale: 0.98`, `y: 8px`, `opacity: 0`).
- **Timing**: duration: `180ms`.

#### 4. Timer Animation (Study Mode)
- **Active State**: Pulsing indicator ring (`scale: [1, 1.03, 1]` over 3s) using a smooth sine curve.
- **Pulse Transition**: Pausing the timer freezes the animation immediately; resuming triggers a spring transition back into the loop.

---

### 4.3 Interface Sound Design Specification

Sounds are synthesized programmatically using the Web Audio API, keeping assets lightweight and customizable.

```
        Chime Waveform (Sine + Triangle Mix)
          f1 (523.25Hz) ───\
                            ├─── Synthesis ──> Output
          f2 (1046.5Hz) ───/
```

#### 1. Task Completion Chime
- **Triggers on**: Task checkmark completion.
- **Synthesis**: A crisp, double-tone chime in C-major.
  - Tone 1: `523.25 Hz` (C5), duration `0.08s`, volume `0.3`, sine wave.
  - Tone 2: `1046.5 Hz` (C6), duration `0.22s`, volume `0.25`, triangle wave.
  - Overlap: Tone 2 begins `0.04s` after Tone 1.
  - Decay: Exponential curve to `0.001` over `0.18s`.

#### 2. Click State / Soft Indicator
- **Triggers on**: Checklist item toggle, habit check-in click.
- **Synthesis**: A soft woodblock click.
  - Frequency: `880 Hz` (A5) pitch sweep down to `440 Hz` over `0.02s`.
  - Duration: `0.03s`, volume `0.12`, triangle wave.

#### 3. Timer Start/Pause
- **Triggers on**: Pomodoro start or pause action.
- **Synthesis**:
  - Start: Two ascending tones (`330 Hz` -> `440 Hz`, duration `0.1s` each).
  - Pause: Two descending tones (`440 Hz` -> `330 Hz`, duration `0.1s` each).

#### 4. Trophy Unlocked Fanfare
- **Triggers on**: Achievement unlocked milestone.
- **Synthesis**: A triumphant triad chime.
  - Arpeggio: `523.25 Hz` (C5) for `0.06s` -> `659.25 Hz` (E5) for `0.06s` -> `783.99 Hz` (G5) for `0.35s`.
  - Mix: 50% sine wave, 50% square wave (filtered with low-pass filter at `1800 Hz` to avoid harsh high frequencies).

#### 5. Warning / Error Alert
- **Triggers on**: Validation errors, deletion alerts.
- **Synthesis**: A low, soft alarm.
  - Tone: `180 Hz`, duration `0.18s`, volume `0.25`, sawtooth wave.
  - Filter: Low-pass filter at `400 Hz` for a deeper alert sound.

---

## 5. Accessibility Rules (WCAG 2.2 Compliance)

1. **Color Contrast**:
   - All text elements must maintain a contrast ratio of at least `4.5:1` against the background (`3:1` for large text > 18pt).
   - Interactive borders must maintain a contrast ratio of at least `3:1`.
2. **Keyboard Control**:
   - A logical focus loop must be maintained when navigating components (e.g. modals must trap focus).
   - Pressing `ESC` must close active overlays, modals, and dropdowns.
3. **Screen Reader Integration**:
   - Use descriptive `aria-label` tags for icon-only buttons (e.g., `<button aria-label="Add new subtask">`).
   - Live regions (`aria-live="polite"`) must be declared for status updates, such as task completions or timer completions.
4. **Reduced Motion**:
   - Support `prefers-reduced-motion` media queries globally.
   - When enabled, high-movement transitions are disabled or converted to simple opacity fades.
