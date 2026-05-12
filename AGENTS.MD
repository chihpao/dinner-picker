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
  - Budget: `BudgetPanel.vue`
  - Icons: `components/icons/*.vue`
- `composables/`
  - `useAuth.ts` - Google OAuth + session state
  - `useExpenses.ts` - 核心記帳資料流（含 `useTotalExpenses()`）
  - `useAccounts.ts` - 帳戶 CRUD + pending sync
  - `useBudget.ts` - 預算設定與進度追蹤（localStorage）
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

## 11. 孜保平分（Zibao Split）— 完整邏輯規範

> **⚠️ 此章節是「孜保平分」功能的權威文件。修改任何與 `zibao`、`sub_type`、`孜保平分` 相關的程式碼前，必須先讀此章節。**

### 11.1 資料模型

`ExpenseEntry.sub_type` 欄位只有三種有效值：

| 值 | 意義 | 建立場景 |
|---|---|---|
| `'general'` | 一般記帳（預設值） | 新增支出/收入時 |
| `'zibao'` | 孜保平分 | 使用者在類型下拉選擇「孜保平分」 |
| `'transfer'` | 轉帳 | 轉帳功能自動寫入 |

- 當 `sub_type` 為 `null`/`undefined` 時，一律回退為 `'general'`（`entry.sub_type ?? 'general'`）。
- **不要新增其他 sub_type 值。**

### 11.2 轉帳判斷函式 `isTransferEntry()`

```ts
const isTransferEntry = (entry: ExpenseEntry) => {
  if (entry.sub_type === 'transfer') return true
  return Boolean(entry.note && entry.note.includes('[轉帳]'))  // 向下相容舊紀錄
}
```

- 此函式存在於 `useExpenses.ts` 和 `ExpenseList.vue` 兩處，**邏輯必須一致**。
- `sub_type === 'zibao'` **不是**轉帳。

### 11.3 ExpenseForm.vue — 新增記帳

- 類型下拉（`一般` / `孜保平分`）**僅在非轉帳模式下顯示**（`form.type !== 'transfer'`）。
- 轉帳模式固定寫入 `sub_type: 'transfer'`，不顯示此下拉。
- 提交後 `resetForm()` 將 `sub_type` 重置為 `'general'`。

### 11.4 ExpenseList.vue — 列表顯示與篩選

**類型徽章**（判斷優先順序：轉帳 > 孜保 > 一般）：
- `type-general`：灰底灰字，文字「一般」
- `type-zibao`：淺紫底紫字（`var(--primary)`），文字「孜保」
- `type-transfer`：淺藍底藍字，文字「轉帳」

**篩選邏輯**：
- 選「孜保」篩選時：`entry.sub_type === 'zibao' && !isTransferEntry(entry)`

**編輯表單規則**：
- 轉帳紀錄的 sub_type **不可修改**，顯示為唯讀「轉帳」。
- 只有「支出」類型且非轉帳時，才能選擇「一般 / 孜保平分」。
- 收入類型時，不顯示 sub_type 選單。
- 儲存時：轉帳紀錄永遠保持 `sub_type: 'transfer'`。

### 11.5 ExpenseSummary.vue — 統計摘要

**資料來源**（`useExpenses.ts`）：
```ts
const zibaoSummaries = computed(() => calculateSummaries((e) => e.sub_type === 'zibao'))
```
- `calculateSummaries` 內部先排除所有轉帳紀錄，再套用 filter。

**孜保模式行為**：

| 行為 | 說明 |
|---|---|
| 時間維度鎖定 | 強制 `viewMode = 'week'`，禁用月/年切換 |
| 支出/收入卡片 | 顯示孜保專屬的週支出/收入金額 |
| 第三張卡片 | **「本週平均」 = `weekExpense / 2`**（兩人平分，不是除以天數） |
| 提示文字 | `本週平均 = 本週孜保支出 ÷ 2` |
| 視覺 | `.highlight` 樣式：淺紫邊框 `#c7c6f7` + 漸層背景，金額文字紫色 |

### 11.6 Supabase 同步

所有讀寫 Supabase 時都帶上 `sub_type`，null 回退為 `'general'`。
資料表：`total_expenses`，欄位：`sub_type`（text）。

### 11.7 不可違反的規則

1. `sub_type` 只有三種值：`'general'`、`'zibao'`、`'transfer'`，不要新增。
2. 轉帳紀錄永遠是 `sub_type: 'transfer'`，不可改為其他值。
3. 孜保平均是**除以 2**（兩人平分），不是除以天數。
4. 孜保模式只看**週**，不可擴展到月或年。
5. 統計計算順序：排除轉帳 → 再篩選孜保，順序不可反。
6. 類型下拉只在支出/收入（非轉帳）時顯示。
7. 編輯轉帳紀錄時 sub_type 是唯讀的。
8. `isTransferEntry()` 在兩個檔案中邏輯必須一致。
