<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" exact class="nav-item" active-class="active" aria-label="首頁">
      <span class="icon-box"><IconHome /></span>
      <span class="nav-label">首頁</span>
    </NuxtLink>
    <NuxtLink to="/total/entry" exact class="nav-item" active-class="active" aria-label="記帳">
      <span class="icon-box"><IconEdit /></span>
      <span class="nav-label">記帳</span>
    </NuxtLink>
    <NuxtLink to="/total" exact class="nav-item" active-class="active" aria-label="總覽">
      <span class="icon-box"><IconOverview /></span>
      <span class="nav-label">總覽</span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" exact class="nav-item" active-class="active" aria-label="帳戶">
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
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 10px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -6px 18px rgba(0,0,0,0.06);
  backdrop-filter: blur(10px);
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--ink-light);
  gap: 3px;
  padding: 6px 8px;
  border-radius: 10px;
  transition: all 0.1s;
  min-height: 58px;
}

.icon-box {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
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
}

/* This is the unified active style */
.nav-item.active {
  color: var(--primary);
  font-weight: 700;
  background: linear-gradient(180deg, #eef2ff 0%, #e6ebff 100%);
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.2);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 50%;
  width: 22px;
  height: 3px;
  border-radius: 999px;
  background: var(--primary);
  transform: translateX(-50%);
}

.nav-item:active {
  transform: scale(0.96);
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

/* The desktop hiding is handled by `lg:hidden` in the parent layout */
</style>
