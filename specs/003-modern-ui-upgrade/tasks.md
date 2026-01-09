# Tasks: Modern UI/UX Upgrade

**Input**: Design documents from `/specs/003-modern-ui-upgrade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-reference.md, quickstart.md

**Tests**: Tests are OPTIONAL for this feature. The specification does not explicitly request TDD approach. Test tasks are NOT included below. Focus is on visual/UX delivery.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All file paths are absolute from repository root

## Path Conventions

- **Frontend**: `frontend/src/` for all UI components
- **Backend**: NO backend changes - this is frontend-only feature
- **Tests**: Not included (optional, not requested)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure tools, establish foundation for visual system

- [X] T001 Install Motion (Framer Motion) package in frontend/package.json
- [X] T002 Install Lucide React icons package in frontend/package.json
- [X] T003 [P] Configure Tailwind CSS with glassmorphism utilities in frontend/src/app/global.css
- [X] T004 [P] Create custom CSS file for glassmorphism effects in frontend/src/styles/glass.css
- [X] T005 Update root layout to import glass.css and add theme provider in frontend/src/app/layout.tsx

**Checkpoint**: Dependencies installed, Tailwind configured, CSS utilities ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core visual infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create ThemeProvider component with light/dark/system modes in frontend/src/components/theme-provider.tsx
- [X] T007 [P] Create ThemeToggle component with sun/moon icon rotation in frontend/src/components/theme-toggle.tsx
- [X] T008 [P] Create AnimatedBackground component with gradient mesh in frontend/src/components/animated-background.tsx
- [X] T009 [P] Create GlassCard reusable component with variants in frontend/src/components/glass-card.tsx
- [X] T010 [P] Create GlassButton component with hover effects in frontend/src/components/glass-button.tsx
- [X] T011 Integrate ThemeProvider and AnimatedBackground into root layout in frontend/src/app/layout.tsx
- [X] T012 Configure Next.js for Motion and Lucide React tree-shaking in frontend/next.config.ts

**Checkpoint**: Foundation ready - theme system, animated background, glass components available for all pages ✅

---

## Phase 3: User Story 1 - Enhanced Visual Experience (Priority: P1) 🎯 MVP

**Goal**: Establish modern, professional visual design with premium styling, animated gradients, and glassmorphism across all pages

**Independent Test**: Open any page (signin, dashboard, create task) and observe modern glassmorphism design, smooth animations, and professional styling. No functional interaction required - just visual inspection.

### Implementation for User Story 1

- [X] T013 [P] [US1] Convert sign-in page to glassmorphism design in frontend/src/app/(auth)/signin/page.tsx
- [X] T014 [P] [US1] Convert sign-up page to glassmorphism design in frontend/src/app/(auth)/signup/page.tsx
- [X] T015 [P] [US1] Create Toast notification system component in frontend/src/components/toast.tsx
- [X] T016 [US1] Update root redirect page with animated transition in frontend/src/app/page.tsx
- [X] T017 [US1] Test theme toggle functionality and visual quality across all pages

**Checkpoint**: At this point, User Story 1 should be fully functional - all pages have modern glassmorphism design with smooth animations and professional styling

---

## Phase 4: User Story 4 - Professional Authentication Flow (Priority: P2)

**Goal**: Deliver polished sign-in/sign-up experience with real-time validation, loading states, and smooth transitions

**Independent Test**: Go through complete sign-up and sign-in flows, observing real-time validation feedback, loading animations, and professional page transitions

### Implementation for User Story 4

- [X] T018 [P] [US4] Add real-time validation feedback to sign-in form fields in frontend/src/app/(auth)/signin/page.tsx
- [X] T019 [P] [US4] Add real-time validation feedback to sign-up form fields in frontend/src/app/(auth)/signup/page.tsx
- [X] T020 [US4] Implement loading state animations during form submission in frontend/src/app/(auth)/signin/page.tsx
- [X] T021 [US4] Implement loading state animations during form submission in frontend/src/app/(auth)/signup/page.tsx
- [X] T022 [US4] Add smooth page transition animation from auth to dashboard in frontend/src/app/template.tsx
- [X] T023 [US4] Style Google OAuth button with prominent glassmorphism design in frontend/src/app/(auth)/signup/page.tsx

**Checkpoint**: At this point, User Story 4 should be fully functional - authentication flows have real-time validation, loading states, and smooth transitions

---

## Phase 5: User Story 2 - Intuitive Task Management (Priority: P2)

**Goal**: Deliver visually clear task management with immediate visual feedback, organized task list, and smooth animations for all task operations

**Independent Test**: Create, view, edit, delete tasks while observing visual cues, animations, and feedback throughout each operation

### Implementation for User Story 2

- [X] T024 [P] [US2] Create StatsCard component with counting animation in frontend/src/components/stats-card.tsx
- [X] T025 [P] [US2] Create TaskCard component with status animations in frontend/src/components/task-card.tsx
- [X] T026 [P] [US2] Create Checkbox component with SVG path drawing in frontend/src/components/checkbox.tsx
- [X] T027 [US2] Implement dashboard page with bento grid stats layout in frontend/src/app/(dashboard)/page.tsx
- [X] T028 [US2] Add quick add task input with glassmorphism design in frontend/src/app/(dashboard)/page.tsx
- [X] T029 [US2] Create task list with staggered entrance animations in frontend/src/app/(dashboard)/page.tsx
- [X] T030 [P] [US2] Create task creation form with floating labels in frontend/src/app/(dashboard)/create/page.tsx
- [X] T031 [P] [US2] Create task detail page with glassmorphism card in frontend/src/app/(dashboard)/tasks/[id]/page.tsx
- [X] T032 [P] [US2] Create task edit form with validation feedback in frontend/src/app/(dashboard)/tasks/[id]/edit/page.tsx
- [X] T033 [US2] Add filter tabs with sliding indicator animation in frontend/src/app/(dashboard)/page.tsx
- [X] T034 [US2] Implement optimistic UI updates for task creation in frontend/src/app/(dashboard)/page.tsx
- [X] T035 [US2] Implement optimistic UI updates for task completion in frontend/src/components/task-card.tsx

**Checkpoint**: At this point, User Story 2 should be fully functional - all task management operations have clear visual feedback and smooth animations

---

## Phase 6: User Story 3 - Delightful Micro-Interactions (Priority: P3)

**Goal**: Deliver polished micro-interactions throughout the app - hover states, focus effects, loading animations, celebratory animations, and thoughtful transitions

**Independent Test**: Observe small interactive elements (buttons, inputs, checkboxes, loading states) throughout the application for smooth, natural transitions and delightful feedback

### Implementation for User Story 3

- [X] T036 [P] [US3] Add hover effects (scale, lift, glow) to all buttons in frontend/src/components/glass-button.tsx
- [X] T037 [P] [US3] Add hover effects to all task cards in frontend/src/components/task-card.tsx
- [X] T038 [P] [US3] Add focus states with smooth transitions to all form inputs in frontend/src/app/(auth)/signin/page.tsx
- [X] T039 [P] [US3] Add focus states to all form inputs in frontend/src/app/(auth)/signup/page.tsx
- [X] T040 [US3] Add focus states to task creation form inputs in frontend/src/app/(dashboard)/create/page.tsx
- [X] T041 [P] [US3] Add focus states to task edit form inputs in frontend/src/app/(dashboard)/tasks/[id]/edit/page.tsx
- [X] T042 [US3] Implement confetti burst animation on task completion in frontend/src/components/task-card.tsx
- [X] T043 [US3] Add task add scale bounce animation in frontend/src/app/(dashboard)/page.tsx
- [X] T044 [US3] Add gradient border pulse on validation success in frontend/src/app/(auth)/signup/page.tsx
- [X] T045 [US3] Add gradient border pulse on validation success in frontend/src/app/(dashboard)/create/page.tsx
- [X] T046 [US3] Create empty state component with floating animation in frontend/src/components/empty-state.tsx
- [X] T047 [US3] Add error shake animations to all forms in frontend/src/app/(auth)/signin/page.tsx
- [X] T048 [US3] Add error shake animations to all forms in frontend/src/app/(auth)/signup/page.tsx
- [X] T049 [US3] Add success checkmark animations to auth forms in frontend/src/app/(auth)/signin/page.tsx
- [X] T050 [US3] Implement elegant loading spinner component in frontend/src/components/loading-spinner.tsx
- [X] T051 [US3] Add loading animations to all async operations throughout the app in frontend/src/app/(dashboard)/page.tsx
- [X] T052 [US3] Add swipe-to-delete gesture with undo toast in frontend/src/components/task-card.tsx

**Checkpoint**: At this point, User Story 3 should be fully functional - all micro-interactions feel responsive and delightful

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility compliance, progressive enhancement, final polish

- [X] T053 [P] Create device capability detection hook in frontend/src/lib/hooks.ts
- [X] T054 [P] Implement progressive enhancement logic for animation complexity in frontend/src/lib/hooks.ts
- [X] T055 [P] Add prefers-reduced-motion detection and respect throughout app in frontend/src/components/theme-provider.tsx
- [X] T056 [P] Add ARIA labels to all interactive elements in frontend/src/components/glass-button.tsx
- [X] T057 [P] Add ARIA labels to task checkboxes in frontend/src/components/checkbox.tsx
- [X] T058 [P] Ensure keyboard navigation works for all interactive elements in frontend/src/app/(dashboard)/page.tsx
- [X] T059 [P] Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text) across all components
- [X] T060 [P] Add visible focus indicators to all interactive elements in frontend/src/components/glass-button.tsx
- [X] T061 [P] Configure LazyMotion for code splitting in frontend/src/app/layout.tsx
- [X] T062 [P] Optimize bundle size with tree-shaking configuration in frontend/next.config.ts
- [X] T063 Run Lighthouse performance audit and achieve 90+ score
- [X] T064 Run Lighthouse accessibility audit and achieve 90+ score
- [X] T065 Test responsive design on mobile (320px+), tablet (768px+), desktop (1024px+)
- [X] T066 Test animations on low-end devices with CPU throttling
- [X] T067 Test with prefers-reduced-motion enabled
- [X] T068 Manual testing of all user flows for visual quality and animation smoothness
- [X] T069 Code cleanup and removal of unused imports
- [X] T070 Validate quickstart.md setup instructions work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - Provides visual foundation for all pages
- **User Story 4 (Phase 4)**: Depends on Foundational phase - Can proceed in parallel with US1 (different pages)
- **User Story 2 (Phase 5)**: Depends on Foundational phase + US1 (for visual consistency)
- **User Story 3 (Phase 6)**: Depends on US1, US4, US2 completion (adds polish to existing components)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - Provides visual foundation
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Auth pages are separate from dashboard, can parallel with US1
- **User Story 2 (P2)**: Should wait for US1 to ensure visual consistency, but technically independent
- **User Story 3 (P3)**: Depends on US1, US4, US2 - Adds micro-interactions to existing components

### Within Each User Story

- Glass components (parallelizable) before page implementations
- Page implementations before integration
- Core functionality before polish
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All tasks marked [P] (T003, T004) can run in parallel
- **Phase 2**: All component tasks marked [P] (T007, T008, T009, T010) can run in parallel
- **US1**: T013, T014, T015 can run in parallel (different pages/components)
- **US4**: T018, T019 can run in parallel (sign-in and sign-up are separate)
- **US2**: T024, T025, T026 can run in parallel (different components)
- **US3**: All hover/focus effect tasks (T036-T041) can run in parallel
- **Phase 7**: All accessibility and performance tasks (T053-T062) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all page conversions together:
Task: "Convert sign-in page to glassmorphism design in frontend/src/app/(auth)/signin/page.tsx"
Task: "Convert sign-up page to glassmorphism design in frontend/src/app/(auth)/signup/page.tsx"
Task: "Create Toast notification system component in frontend/src/components/toast.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all core components together:
Task: "Create StatsCard component with counting animation in frontend/src/components/stats-card.tsx"
Task: "Create TaskCard component with status animations in frontend/src/components/task-card.tsx"
Task: "Create Checkbox component with SVG path drawing in frontend/src/components/checkbox.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all hover/focus effect tasks together:
Task: "Add hover effects to all buttons in frontend/src/components/glass-button.tsx"
Task: "Add hover effects to all task cards in frontend/src/components/task-card.tsx"
Task: "Add focus states to sign-in form inputs in frontend/src/app/(auth)/signin/page.tsx"
Task: "Add focus states to sign-up form inputs in frontend/src/app/(auth)/signup/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (T013-T017)
4. **STOP and VALIDATE**: Test all pages for visual quality - glassmorphism design, animations, theme toggle
5. **MVP COMPLETE**: App has modern, professional visual design

### Incremental Delivery

1. **Sprint 1**: Setup + Foundational → Base visual system ready (T001-T012)
2. **Sprint 2**: User Story 1 → Visual design complete (T013-T017) - **MVP checkpoint**
3. **Sprint 3**: User Story 4 → Auth flows polished (T018-T023)
4. **Sprint 4**: User Story 2 → Task management complete (T024-T035)
5. **Sprint 5**: User Story 3 → Micro-interactions added (T036-T052)
6. **Sprint 6**: Polish & Optimization → Production ready (T053-T070)

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Developer A**: User Story 1 (auth pages, toast system)
2. **Developer B**: User Story 4 (auth validation, loading states)
3. **Developer C**: User Story 2 (task management components)

Then converge for:
- **All**: User Story 3 (micro-interactions polish)
- **All**: Phase 7 (optimization and accessibility)

---

## Notes

- [P] tasks = different files, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable (except US3 which enhances others)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are optional and not included (not requested in spec)
- Focus on visual quality and animation smoothness over comprehensive test coverage
- Avoid: vague tasks, same file conflicts, breaking existing functionality
- Backend is UNCHANGED - all work is frontend presentation layer
- All existing Phase II API endpoints remain unchanged
- Progressive enhancement is required - must detect device capabilities and adjust animations
