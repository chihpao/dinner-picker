# Skill.MD - Dinner Picker Project Skill

## Skill Name
`dinner-picker-ui-maintainer`

## Goal
在不破壞既有商業邏輯與資料同步流程下，快速完成本專案的 UI/UX、RWD、元件與導覽調整。

## When To Use
- 使用者要求先檢視專案架構再動手改 UI
- 調整 `pages/total*` 相關頁面布局
- 調整 `ExpenseList`、`ExpenseForm`、`ExpenseSummary`、`AccountPanel`
- 新增或替換 icon component
- 修正 mobile 導覽列、safe-area、點擊區域

## Core Constraints
1. 預設不得改動 business logic（尤其 `composables/useExpenses.ts`、`useAccounts.ts`）
2. 視覺 token 以 `assets/css/main.css` 為準，不硬寫魔術數字
3. 動作按鈕優先 icon，不回退成純文字
4. 新 SVG icon 必須放在 `components/icons/` 且包在 `<template>`
5. 保持底部導覽 4 項：`/`、`/total/entry`、`/total`、`/total/accounts`

## Architecture Quick Read Order
1. `AGENTS.MD`
2. `nuxt.config.ts` (baseURL, PWA, build mode)
3. `layouts/default.vue` (desktop/sidebar + mobile nav 結構)
4. `pages/total/*.vue` (實際頁面組合方式)
5. `components/*` (要修改的呈現元件)
6. `composables/*` (只讀理解資料流，非必要不改)

## Execution Workflow
1. 先盤點檔案結構與路由，確認影響範圍
2. 明確區分 UI 層與資料層改動
3. 只改必要元件與 scoped CSS
4. 檢查 mobile (`<=720px`) 版面是否維持單欄、可點擊、無溢出
5. 檢查 desktop 與 mobile 切換是否符合既有 layout 行為
6. 回報變更檔案與驗證結果

## Mobile QA Minimum
- `/total` 單列資料可讀、可點
- `/total/entry` 在 360px 下可用
- `/total/accounts` 卡片動作鍵可見
- 底部 nav 安全區 padding 正常
- Header 與 summary 區不互相擠壓

## Output Format (for agent replies)
- 先給結果摘要（改了什麼）
- 再列出改動檔案清單
- 最後附驗證與風險（若未測試需明確說明）
