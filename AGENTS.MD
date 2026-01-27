# AGENTS.MD - Project Context & Guidelines

> **For AI Agents:** Read this file first to understand the design system, project structure, and coding conventions before making changes.

## 1. Project Overview
- **Name**: 孜保吃晚餐 (Dinner Picker & Expense Ledger)
- **Tech Stack**: Nuxt 3, Vue 3 (Composition API), TailwindCSS.
- **Core Logic**: Logic is centralized in `composables/` (`useAuth`, `useTotalExpenses`, `useRestaurants`). This is a logic-heavy client-side app (likely connected to Firebase/Supabase for auth/data).

## 2. Design System: "Neo-Pixel Refined"
**Philosophy**: A blend of **Dieter Rams** (Order, Less is More), **Linear App** (Precision, grid alignment), and **Pixel Art** (Identity).

### 🎨 Visual Tokens (Strict Rules)
- **Typography**:
    - **Headings / Numbers / badges**: `DotGothic16` (Pixel font).
    - **Body / Inputs**: `Noto Sans TC` (Clean Sans-serif).
- **Geometry**:
    - **Border Radius**: `8px` (Global standard).
    - **Border**: `2px solid var(--border)` (#1a202c).
    - **Shadows**: Crisp, solid offset (`4px 4px`), low opacity (`0.12`).
    - **Input/Button Height**: `48px` (Standard touch target).
    - **Spacing**: Base unit 4px. Standard content padding `24px`.
- **Colors**:
    - **Background**: White `#ffffff` (Cards), Light Gray `#f0f2f5` (Body).
    - **Primary**: Indigo `#4f46e5`.
    - **Text**: Ink `#1a202c`.

### 🧩 UI Patterns
- **Iconography**:
    - **Rule**: **Icons > Text** for action buttons (Edit, Delete, Add, Stats).
    - **Implementation**: Create Vue components in `components/icons/`.
    - **CRITICAL**: All Icon components **MUST** have a `<template>` tag wrapping the SVG.
- **Layouts**:
    - **Lists/Tables**: Use **CSS Grid** for Desktop (e.g., 7-column grid in `ExpenseList`), fallback to **Flex Column** (Cards) for Mobile.
    - **Forms**: Use **CSS Grid** (2-column on desktop, 1-column on mobile). Group related fields.
    - **Modals**: Centered overlays with dimmed backgrounds.

## 3. Key Components Documentation

### `components/ExpenseList.vue`
- **View**: Displays the ledger.
- **Structure**:
    - **Desktop**: A strict 7-column grid table: `[Checkbox] [Date] [Amount] [Type] [Account] [Note] [Actions]`.
    - **Mobile**: Stacked card view.
- **Features**: Sortable headers, Bulk Delete (Icon), Edit Modal.

### `components/ExpenseForm.vue`
- **View**: Add/Edit transactions.
- **Structure**: Responsive Grid form.
- **Widgets**: Segmented Control for Transaction Type (Expense/Income/Transfer).

### `components/AppHeader.vue`
- **Structure**: Flexbox alignment.
- **Slots**: `actions` slot is used for page-specific icon buttons.

## 4. Coding Conventions
1.  **Scoped CSS**: Prefer `style scoped` for complex layouts (Grids) over excessive Tailwind classes. Keep template clean.
2.  **State Management**: Do not put business logic in components. Use `composables/*.ts`.
3.  **Refactoring**: When modifying UI, **check `assets/css/main.css`** for global tokens first. Do not hardcode magic numbers (use vars or standard 8px/16px/24px).
4.  **Icons**: If you need a new icon, create a new `.vue` file in `components/icons/`. Do not inline SVGs in the main template unless trivial.

## 5. History & Context (Jan 2026)
- **Major Refactor**: Shifted from a mixed/chaotic design to the "Neo-Pixel Refined" system.
- **Fixes**:
    - Fixed `ExpenseList` layout collapse (added CSS Grid).
    - Fixed `ExpenseForm` inline toggle alignment (added Segmented Control).
    - Fixed Vue build errors caused by missing `<template>` tags in icons.
