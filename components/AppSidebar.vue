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
          <span class="icon"><IconHome /></span>
          <span class="text" v-if="!isCollapsed">首頁</span>
        </NuxtLink>
      </div>

      <div class="nav-group">
        <NuxtLink to="/total/entry" class="nav-item" active-class="active" title="一般記帳">
          <span class="icon"><IconEdit /></span>
          <span class="text" v-if="!isCollapsed">一般記帳</span>
        </NuxtLink>
      </div>

      <div class="nav-group">
        <NuxtLink to="/total" class="nav-item" active-class="active" title="全消費總覽">
          <span class="icon"><IconOverview /></span>
          <span class="text" v-if="!isCollapsed">全消費總覽</span>
        </NuxtLink>
        <NuxtLink to="/total/accounts" class="nav-item" active-class="active" title="帳戶管理">
          <span class="icon"><IconBank /></span>
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
import IconHome from '~/components/icons/IconHome.vue'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconList from '~/components/icons/IconList.vue'
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'
import IconBento from '~/components/icons/IconBento.vue'

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
  overflow: hidden;
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
  justify-content: space-between;
  background: var(--primary);
  color: #fff;
  flex-shrink: 0;
  transition: padding 0.2s;
}

.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 0;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
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
  transform: rotate(180deg);
}

.arrow {
  display: inline-block;
  font-size: 12px;
}

.sidebar-nav {
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.sidebar.collapsed .sidebar-nav {
  padding: 24px 8px;
  align-items: center;
}

.nav-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar.collapsed .nav-group {
  align-items: center;
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
  width: 44px;
  height: 44px;
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
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: var(--border-width) solid var(--ink);
  background: var(--bg-body);
  height: 40px; /* Fixed height for footer as well */
  display: flex;
  align-items: center;
}

.pixel-deco {
  height: 8px;
  width: 100%;
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