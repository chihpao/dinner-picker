<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconHome /></span>
      <span class="label">首頁</span>
    </NuxtLink>
    <NuxtLink to="/total/entry" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconEdit /></span>
      <span class="label">記帳</span>
    </NuxtLink>
    <NuxtLink to="/total" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconOverview /></span>
      <span class="label">總覽</span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconBank /></span>
      <span class="label">帳戶</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import IconHome from '~/components/icons/IconHome.vue'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 10px;
  padding-top: max(12px, env(safe-area-inset-bottom)); /* Use padding-top for top nav */
  z-index: 100;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06); /* Shadow from top */
  backdrop-filter: blur(8px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--ink-light);
  padding: 8px 6px;
  border-radius: 12px;
  transition: all 0.1s;
  min-height: 56px;
}

.icon-box {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.icon-box :deep(svg) {
  width: 22px;
  height: 22px;
}

.label {
  font-family: var(--font-pixel);
  font-size: 11px;
  letter-spacing: 0.05em;
}

/* This is the unified active style */
.nav-item.active {
  color: var(--primary);
  font-weight: 700;
  background: var(--primary-light);
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.15);
}

.nav-item:active {
  transform: scale(0.96);
}

/* The desktop hiding is handled by `lg:hidden` in the parent layout */
</style>
