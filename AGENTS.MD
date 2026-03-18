# AGENTS.MD - Project Context & Working Rules

> For AI agents: read this file first. Prioritize UI quality and do not break data flow.

## 1. Project Snapshot
- Name: 孜保吃晚餐 (Dinner Picker + Expense Ledger)
- Stack: Nuxt 4 (SPA `ssr: false`), Vue 3 Composition API, TailwindCSS, Supabase, `@vite-pwa/nuxt`
- Dev server: `http://localhost:4211`
- Deployment shape: GitHub Pages base path `/dinner-picker/`
- Default rule: UI/UX tasks must not change business logic unless explicitly requested

## 2. Real Project Structure
- `pages/`
  - `index.vue` - 餐廳卡片首頁
  - `total/index.vue` - 全消費總覽（列表 + 統計 toggle）
  - `total/entry.vue` - 記帳頁（`ExpenseForm`）
  - `total/accounts.vue` - 帳戶管理（`AccountPanel`）
  - `total/add-account.vue` - 新增帳戶
- `components/`
  - Layout/Nav: `AppHeader.vue`, `AppSidebar.vue`, `MobileNav.vue`, `PwaInstallPrompt.vue`
  - Expense domain: `ExpenseForm.vue`, `ExpenseList.vue`, `ExpenseSummary.vue`, `AccountPanel.vue`
  - Restaurant domain: `RestaurantCard.vue`
  - Icons: `components/icons/*.vue`
- `composables/`
  - `useAuth.ts` - Google OAuth + session state
  - `useExpenses.ts` - 核心記帳資料流（含 `useTotalExpenses()`）
  - `useAccounts.ts` - 帳戶 CRUD + pending sync
  - `useRestaurants.ts` - 餐廳與距離排序
  - `useSupabase.ts` - Supabase client
  - `useSwipeNavigation.ts` - 手勢切頁
  - `usePwaInstall.ts`, `usePwaMode.ts` - PWA 安裝與模式
- `assets/css/main.css` - design tokens source of truth
- `plugins/pwa-init.client.ts` - 啟動 PWA install listener

## 3. Routes & Navigation
- `/` 首頁
- `/total/entry` 記帳
- `/total` 全消費總覽
- `/total/accounts` 帳戶管理
- `/total/add-account` 新增帳戶

Mobile bottom nav is fixed 4 items in this order:
`首頁 -> 記帳 -> 總覽 -> 帳戶`

## 4. Data & Logic Boundaries
- Do not move business rules into components.
- Use composables for all data operations.
- Expense/account sync uses:
  - local storage cache
  - pending queue retry
  - Supabase as remote source
- `useTotalExpenses` is an alias exported from `useExpenses.ts`; keep compatibility.
- If editing auth/supabase logic, treat as high risk and change only when asked.

## 5. Design System: Neo-Pixel Refined
Philosophy: Dieter Rams (order) + Linear (precision) + Pixel art identity.

Use CSS vars from `assets/css/main.css`:
- Typography:
  - Heading/number/badge: `--font-pixel` (`DotGothic16`)
  - Body/input/button: `--font-sans` (`Inter`, `Noto Sans TC`)
- Colors:
  - `--bg-body #f7f7f8`
  - `--bg-paper #ffffff`
  - `--ink #111827`
  - `--ink-light #6b7280`
  - `--border #e2e4e7`
  - `--primary #4f46e5`
- Geometry:
  - `--border-width 1px`
  - `--radius 12px`, `--radius-sm 8px`
  - `--shadow-sm`, `--shadow-md`
  - `--mobile-nav-height 76px`

## 6. UI Rules (RWD)
### `AppHeader.vue`
- Desktop: hero-like sticky top section.
- Mobile (`<=720px`): stacked layout; summary content in `bottom` slot.

### `ExpenseList.vue`
- Desktop: fixed 7-column list:
  `[Checkbox] [Date] [Amount] [Type] [Account] [Note] [Actions]`
- Mobile: single-line compact row per entry:
  checkbox + compact text + amount + edit
- Keep checkbox and edit action tappable.

### `ExpenseSummary.vue`
- Desktop grid cards; mobile single-column stack.

### `ExpenseForm.vue`
- 2-column desktop / 1-column mobile.
- Input tap targets around 44-48px height.

### `AccountPanel.vue`
- Desktop card grid; mobile single column.
- Edit/delete actions must stay visible on small screens.

### `MobileNav.vue`
- Keep 4 items.
- Preserve safe-area bottom padding.

## 7. Icon Rules
- Prefer icon-only action buttons over text.
- New icons must be Vue components under `components/icons/`.
- Every icon SFC must wrap SVG inside `<template>`.

## 8. Coding Conventions
1. Scoped CSS first for layout-heavy changes.
2. Avoid magic numbers; reuse tokens in `main.css`.
3. Keep templates clean; move presentation rules to scoped style.
4. Minimize side effects in pages/components.
5. Keep existing route paths and nav order stable.

## 9. Fast QA Checklist
- `/total` list remains compact and tappable on 360px width.
- `統計` toggle in `/total` does not overflow header on mobile.
- `/total/entry` form is usable one-handed on narrow screens.
- `/total/accounts` cards and action buttons remain accessible.
- Bottom nav still has 4 items with proper safe-area spacing.
- Desktop sidebar + mobile nav do not appear at the same time.

## 10. Notes for AI Edits
- This repo may already contain user in-progress changes. Do not revert unrelated modifications.
- Prefer incremental UI edits over broad rewrites.
- If a task asks for architecture understanding first, summarize current folders/composables before coding.
