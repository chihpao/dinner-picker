# AGENTS.MD - Project Context & Working Rules

> **For AI Agents:** Read this file first. This file is the fast path to correct UI/UX changes without breaking logic.

## 1. Project Snapshot
- **Name**: 孜保吃晚餐 (Dinner Picker & Expense Ledger)
- **Stack**: Nuxt 3, Vue 3 (Composition API), TailwindCSS.
- **Logic Location**: `composables/` (`useAuth`, `useTotalExpenses`, `useRestaurants`, `useAccounts`).
- **Default Rule**: **UI tasks must not change business logic** unless explicitly requested.

## 2. Routes & Navigation (High Signal)
- `/`：首頁
- `/total`：全消費總覽
- `/total/entry`：一般記帳
- `/total/accounts`：帳戶管理
- `/total/add-account`：新增帳戶

**Mobile bottom nav** lives in `components/MobileNav.vue` and must include:
- `首頁` → `/`
- `記帳` → `/total/entry`
- `總覽` → `/total`
- `帳戶` → `/total/accounts`

## 3. Design System: "Neo-Pixel Refined"
**Philosophy**: Dieter Rams (Order), Linear App (Precision), Pixel Art (Identity).

### Visual Tokens (Source of truth: `assets/css/main.css`)
Use CSS vars whenever possible:
- **Typography**:
  - Headings / numbers / badges: `DotGothic16`
  - Body / inputs: `Noto Sans TC` (via `--font-sans`, which also includes Inter)
- **Colors**:
  - `--bg-body: #f7f7f8`
  - `--bg-paper: #ffffff`
  - `--ink: #111827`, `--ink-light: #6b7280`
  - `--border: #e2e4e7`
  - `--primary: #4f46e5`
- **Geometry**:
  - `--border-width: 1px`
  - `--radius: 12px`
  - `--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)`
  - `--mobile-nav-height: 76px`

### Icon Rules
- **Icons > Text** for action buttons (Edit/Delete/Add/Stats).
- New icons must be **Vue components** in `components/icons/`.
- **CRITICAL**: SVG must be wrapped in a `<template>` tag.

## 4. Layout Rules (RWD)
### `components/AppHeader.vue`
- Desktop: sticky header (hero).
- Mobile (`<=720px`): header stacks vertically; summary panel uses the `bottom` slot.

### `components/ExpenseList.vue`
- **Desktop**: strict 7-column grid  
  `[Checkbox] [Date] [Amount] [Type] [Account] [Note] [Actions]`
- **Mobile**: **one-line row per entry** (checkbox + compact line + amount + edit).
  - Compact line = date + type badge + account (short) + note (ellipsis).
  - Ensure checkbox + edit button remain tappable.

### `components/ExpenseSummary.vue`
- Grid cards; on mobile collapse to **single column**.

### `components/ExpenseForm.vue`
- Form grid: 2 columns on desktop, 1 column on mobile.
- Inputs should be ~44–48px height.

### `components/AccountPanel.vue`
- Card grid on desktop, single column on mobile.
- Action icons must stay visible on mobile.

## 5. Coding Conventions
1. **Scoped CSS first** for layout-heavy components.
2. **No business logic** in components. Use `composables/*.ts`.
3. **No magic numbers**: check `assets/css/main.css` tokens first.
4. Keep templates clean; move layout logic into scoped CSS.

## 6. Fast Dev Checklist (Mobile QA)
- `/total` list rows are single-line, clear, and tappable.
- Bottom nav has 4 items and safe-area padding.
- `統計` toggle in `/total` doesn’t break header layout.
- `/total/entry` is easy to use on 360px width.
- `/total/accounts` cards readable and action buttons accessible.

## 7. Recent Context (Feb 2026)
- Mobile bottom nav expanded to 4 items (includes **記帳**).
- Mobile expense list changed to **single-line compact rows**.
- Header uses stacked layout on mobile to avoid overflow.
