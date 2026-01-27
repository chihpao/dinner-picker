<template>
  <nav class="mobile-nav">
    <NuxtLink to="/" class="nav-item" active-class="active">
      <span class="icon-box">🏠</span>
      <span class="label">首頁</span>
    </NuxtLink>
    <NuxtLink to="/total" class="nav-item" active-class="active">
      <span class="icon-box">📝</span>
      <span class="label">總覽</span>
    </NuxtLink>
    <NuxtLink to="/total/accounts" class="nav-item" active-class="active">
      <span class="icon-box">🏦</span>
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
  background: #fff;
  border-top: 2px solid var(--border);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 0 rgba(0,0,0,0.02);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--ink-light);
  padding: 4px 0;
  border-radius: 8px;
  transition: all 0.1s;
}

.icon-box {
  font-size: 24px;
}

.label {
  font-family: var(--font-pixel);
  font-size: 12px;
}

.nav-item.active {
  color: var(--ink);
  font-weight: 700;
  background: #f8fafc;
}

.nav-item:active {
  transform: scale(0.96);
}

@media (min-width: 900px) {
  .mobile-nav { display: none; }
}
</style>