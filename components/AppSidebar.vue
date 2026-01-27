<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-brand">
      <div class="brand-content" v-if="!isCollapsed">
        <div class="brand-text">Dinner Picker</div>
      </div>
      
      <button class="toggle-btn" @click="toggleCollapse">
        <span class="arrow" :class="{ flipped: isCollapsed }">◀</span>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-group">
        <NuxtLink to="/" class="nav-item" active-class="active">
          <span class="icon"><IconHome /></span>
          <span class="text" v-if="!isCollapsed">首頁</span>
        </NuxtLink>
      </div>



      <div class="nav-group">
        <NuxtLink to="/total/entry" class="nav-item" active-class="active">
          <span class="icon"><IconEdit /></span>
          <span class="text" v-if="!isCollapsed">一般記帳</span>
        </NuxtLink>
        <NuxtLink to="/total" class="nav-item" active-class="active">
          <span class="icon"><IconOverview /></span>
          <span class="text" v-if="!isCollapsed">全消費總覽</span>
        </NuxtLink>
        <NuxtLink to="/total/accounts" class="nav-item" active-class="active">
          <span class="icon"><IconBank /></span>
          <span class="text" v-if="!isCollapsed">帳戶管理</span>
        </NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import IconHome from '~/components/icons/IconHome.vue'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'

const isCollapsed = ref(false)
const toggleCollapse = () => isCollapsed.value = !isCollapsed.value
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--bg-paper); /* Keep sidebar white/paper */
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 50;
  transition: width 0.2s var(--ease-snappy);
}

.sidebar.collapsed { width: 72px; }

.sidebar-brand {
  height: 56px; /* Match header height roughly */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 8px;
}

.sidebar.collapsed .sidebar-brand { justify-content: center; padding: 0; }

.brand-text {
  font-family: var(--font-pixel);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.05em;
  color: var(--ink);
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
  color: var(--ink-light);
  padding: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.toggle-btn:hover { opacity: 1; }

.sidebar.collapsed .toggle-btn .arrow {
  display: inline-block;
  transform: rotate(180deg);
}

.sidebar-nav {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-light);
  padding: 12px 12px 4px 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-sans);
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  color: var(--ink-light);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.1s var(--ease-snappy);
  font-weight: 500;
  font-size: 14px;
  font-family: var(--font-sans);
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 8px;
}

.nav-item:hover {
  background: #f3f4f6;
  color: var(--ink);
}

.nav-item.active {
  background: #f3f4f6; /* Subtle active background */
  color: var(--ink);
  font-weight: 600;
}

.nav-item .icon {
  width: 20px;
  height: 20px;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Linear-style icon color for active */
.nav-item.active .icon {
  color: var(--primary);
}
</style>