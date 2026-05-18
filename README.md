# 孜保吃晚餐 (Dinner Picker & Expense Ledger)

這是一個結合了「晚餐挑選」與「記帳」功能的個人化 Web App。專為情侶或小家庭設計，特別包含「孜保平分」功能。

## 主要功能

- 🍱 **餐廳挑選**：快速瀏覽附近餐廳，協助決定晚餐。
- 💰 **消費記帳**：
  - 一般支出、收入紀錄。
  - **孜保平分**：專屬標籤，自動計算兩人平分後的負擔額。
  - **轉帳功能**：支援不同帳戶間的資金移動。
- 📊 **消費統計**：週、月、年視圖，快速掌握財務狀況。
- 🏦 **帳戶管理**：追蹤多個錢包、銀行帳戶餘額。
- 📱 **PWA 支援**：可安裝至手機桌面，離線可用，手勢切換頁面。

## 技術棧

- **框架**: Nuxt 4 (SPA)
- **前端**: Vue 3, TailwindCSS
- **後端/資料庫**: Supabase
- **離線支援**: Vite PWA Plugin, LocalStorage Cache with Pending Sync

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## 部署

專案部屬在 GitHub Pages 上。

```bash
npm run build
npm run preview
```
