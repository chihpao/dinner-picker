<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" class="nav-item" active-class="active">
      <span class="icon">🏠</span>
      <span class="label">首頁</span>
    </NuxtLink>
    <NuxtLink to="/total" class="nav-item" active-class="active">
      <span class="icon">📝</span>
      <span class="label">總覽</span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" class="nav-item" active-class="active">
      <span class="icon">🏦</span>
      <span class="label">帳戶</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-paper);
  border-top: var(--border-width) solid var(--ink);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 100;
  box-shadow: 0 -4px 0 rgba(0,0,0,0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--ink-dim);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-item .icon {
  font-size: 20px;
}

.nav-item.active {
  color: var(--primary);
  background: rgba(61, 90, 254, 0.05);
}

.nav-item.active .icon {
  transform: scale(1.1);
}

@media (min-width: 640px) {
  .mobile-nav {
    display: none;
  }
}
</style>