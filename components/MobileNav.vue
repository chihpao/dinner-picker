<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" class="nav-item" exact-active-class="active" aria-label="首頁">
      <span class="icon-box"><IconHome /></span>
      <span class="nav-label">首頁</span>
    </NuxtLink>
    <NuxtLink to="/total/entry" class="nav-item" exact-active-class="active" aria-label="記帳">
      <span class="icon-box"><IconEdit /></span>
      <span class="nav-label">記帳</span>
    </NuxtLink>
    <NuxtLink to="/total" class="nav-item" exact-active-class="active" aria-label="總覽">
      <span class="icon-box"><IconOverview /></span>
      <span class="nav-label">總覽</span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" class="nav-item" exact-active-class="active" aria-label="帳戶">
      <span class="icon-box"><IconBank /></span>
      <span class="nav-label">帳戶</span>
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
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  border-top: 1px solid var(--glass-border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 10px;
  padding-bottom: calc(12px + max(0px, env(safe-area-inset-bottom)));
  z-index: 100;
  box-shadow: 0 -6px 18px rgba(0,0,0,0.04);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #9ca3af;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 12px;
  transition: all 0.2s var(--ease-snappy);
  min-height: 58px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  padding: 4px 12px;
  border-radius: 12px;
  background: transparent;
  transition: all 0.2s var(--ease-snappy);
}

.icon-box :deep(svg) {
  width: 21px;
  height: 21px;
}

.nav-label {
  font-size: 11px;
  line-height: 1;
  font-family: var(--font-pixel);
  letter-spacing: 0.03em;
  transition: opacity 0.2s;
}

.nav-item.active {
  color: var(--primary);
  font-weight: 700;
}

.nav-item.active .icon-box {
  background: #eef2ff;
  color: var(--primary);
  transform: scale(1.05);
}

.nav-item:active {
  transform: scale(0.98);
}

@media (max-width: 400px) {
  .mobile-nav {
    gap: 4px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .nav-item {
    min-height: 56px;
    padding: 6px 6px;
  }

  .nav-label {
    font-size: 10px;
  }
}
</style>
