<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-brand">
      <div class="brand-content" v-if="!isCollapsed">
        <div class="brand-text">Dinner Picker</div>
      </div>
      
      <button class="toggle-btn-header" @click="toggleCollapse" :aria-label="isCollapsed ? '展開選單' : '收起選單'">
        <span class="arrow" :class="{ flipped: isCollapsed }">◀</span>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-group">
        <NuxtLink to="/" class="nav-item" active-class="active" title="首頁">
          <span class="icon">🏠</span>
          <span class="text" v-if="!isCollapsed">首頁</span>
        </NuxtLink>
      </div>

      <div class="nav-group">
        <div class="nav-label" v-if="!isCollapsed">快速記帳</div>
        <div class="nav-divider" v-else></div>
        <NuxtLink to="/expense-entry" class="nav-item" active-class="active" title="食物記帳">
          <span class="icon">🍱</span>
          <span class="text" v-if="!isCollapsed">食物記帳</span>
        </NuxtLink>
      </div>

      <div class="nav-group">
        <div class="nav-label" v-if="!isCollapsed">數據總覽</div>
        <div class="nav-divider" v-else></div>
        <NuxtLink to="/expenses" class="nav-item" active-class="active" title="食物紀錄">
          <span class="icon">📊</span>
          <span class="text" v-if="!isCollapsed">食物紀錄</span>
        </NuxtLink>
        <NuxtLink to="/total" class="nav-item" active-class="active" title="全消費總覽">
          <span class="icon">📚</span>
          <span class="text" v-if="!isCollapsed">全消費總覽</span>
        </NuxtLink>
        <NuxtLink to="/total/accounts" class="nav-item" active-class="active" title="帳戶管理">
          <span class="icon">🏦</span>
          <span class="text" v-if="!isCollapsed">帳戶管理</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="pixel-deco" v-if="!isCollapsed"></div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--bg-paper);
  border-right: var(--border-width) solid var(--ink);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 50;
  transition: width 0.2s ease-in-out;
  overflow: hidden; /* Disable scrolling */
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-brand {
  padding: 0 16px;
  height: 64px;
  border-bottom: var(--border-width) solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between logo/text and toggle button */
  background: var(--primary);
  color: #fff;
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 0;
  flex-direction: column;
  gap: 4px;
  height: 80px; /* Slightly taller to fit stacked logo and button */
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-box {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: #fff;
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 2px 2px 0 var(--ink);
  color: var(--ink);
}

.brand-text {
  font-weight: 700;
  font-size: 18px;
  text-shadow: 2px 2px 0 var(--ink);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.toggle-btn-header {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.toggle-btn-header:hover {
  color: #fff;
  transform: scale(1.1);
}

.sidebar.collapsed .toggle-btn-header {
  transform: rotate(180deg); /* Flip the whole button or just arrow */
  width: 100%;
  height: 20px;
}

.arrow {
  display: inline-block;
  font-size: 12px;
}

.sidebar-nav {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow: hidden; /* Ensure no scroll */
}

.sidebar.collapsed .sidebar-nav {
  padding: 24px 10px;
  align-items: center; /* Center icons */
}

.nav-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px; /* Gap between items in group */
}

.sidebar.collapsed .nav-group {
  align-items: center;
}

.nav-label {
  font-size: 12px;
  color: var(--ink-dim);
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-left: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.nav-divider {
  height: 1px;
  width: 32px;
  background: var(--ink-dim);
  margin: 0 auto 12px;
  opacity: 0.3;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: var(--ink);
  text-decoration: none;
  border: 2px solid transparent;
  transition: all 0.1s;
  font-size: 15px;
  white-space: nowrap;
  border-radius: 4px;
  width: 100%;
}

.sidebar.collapsed .nav-item {
  padding: 10px;
  justify-content: center;
  width: 44px; /* Square-ish for icon */
}

.nav-item:hover {
  background: var(--bg-body);
  border-color: var(--ink-dim);
  box-shadow: 2px 2px 0 var(--ink-dim);
}

.nav-item.active {
  background: var(--bg-body);
  border-color: var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  font-weight: 700;
  color: var(--primary);
}

.sidebar.collapsed .nav-item.active {
  box-shadow: 2px 2px 0 var(--ink);
}

.nav-item:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--ink);
}

.icon {
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: var(--border-width) solid var(--ink);
  background: var(--bg-body);
}

.pixel-deco {
  height: 8px;
  background-image: repeating-linear-gradient(
    45deg,
    var(--ink-dim) 0,
    var(--ink-dim) 2px,
    transparent 2px,
    transparent 6px
  );
  opacity: 0.2;
}
</style>
