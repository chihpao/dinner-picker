<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconHome /></span>
    </NuxtLink>
    <NuxtLink to="/total/entry" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconEdit /></span>
    </NuxtLink>
    <NuxtLink to="/total" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconOverview /></span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" exact class="nav-item" active-class="active">
      <span class="icon-box"><IconBank /></span>
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
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 16px; /* Increased side padding */
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -6px 18px rgba(0,0,0,0.06);
  backdrop-filter: blur(8px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center vertically */
  text-decoration: none;
  color: var(--ink-light);
  padding: 8px;
  border-radius: 12px;
  transition: all 0.1s;
  min-height: 52px; /* Slightly tighter height since no text */
}

.icon-box {
  width: 28px; /* Larger icons */
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.icon-box :deep(svg) {
  width: 26px; /* Larger inner svg */
  height: 26px;
}

/* Removed label styles */

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
