<template>
  <nav class="mobile-nav">
    <div class="nav-indicator" :style="{ transform: `translateX(${activeIndex * 100}%)` }">
      <div class="nav-line"></div>
    </div>
    
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IconHome from '~/components/icons/IconHome.vue'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'

const route = useRoute()
const activeIndex = computed(() => {
  if (route.path === '/total/entry') return 1
  if (route.path === '/total') return 2
  if (route.path.startsWith('/total/account')) return 3
  return 0
})
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(3, 3, 5, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(168, 85, 247, 0.3);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 0;
  padding-bottom: calc(12px + max(0px, env(safe-area-inset-bottom)));
  z-index: 100;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
}

.nav-indicator {
  position: absolute;
  top: auto;
  bottom: calc(max(0px, env(safe-area-inset-bottom)) + 2px);
  left: 0;
  width: 25%;
  height: 10px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  /* Instant snap, no smooth sliding */
  transition: none;
  z-index: 10;
}

.nav-line {
  width: 10px;
  height: 10px;
  background: var(--primary-light);
  transform: rotate(45deg) translateY(4px);
  box-shadow: 0 0 12px var(--primary-light);
  border: 1px solid rgba(168, 85, 247, 0.5);
  animation: navPulse 2s infinite;
}

@keyframes navPulse {
  0%, 100% { box-shadow: 0 0 8px var(--primary-light); }
  50% { box-shadow: 0 0 20px var(--primary-light), 0 0 30px rgba(147, 51, 234, 0.3); }
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--ink-light);
  gap: 2px;
  padding: 6px 0;
  transition: all 0.2s;
  min-height: 58px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  padding: 4px;
}

.icon-box :deep(svg) {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  line-height: 1;
  font-family: var(--font-pixel);
  letter-spacing: 0.03em;
  font-weight: 700;
}

.nav-item.active {
  color: var(--ink);
}

.nav-item.active .nav-label {
  color: var(--primary-light);
  text-shadow: 0 0 6px rgba(147, 51, 234, 0.5);
}

.nav-item.active .icon-box {
  color: var(--primary-light);
  filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.7));
  animation: glitch 250ms cubic-bezier(0, 1, 0, 1);
}

.nav-item:active {
  transform: scale(0.95);
}

@keyframes glitch {
  0% { transform: translate(0) skewX(0); filter: drop-shadow(0 0 10px #9333EA); }
  20% { transform: translate(-4px, 2px) skewX(20deg); filter: drop-shadow(4px 0 0 #9333EA); color: #22D3EE; }
  40% { transform: translate(4px, -2px) skewX(-20deg); filter: drop-shadow(-4px 0 0 #E53E3E); color: #FFFFFF; }
  60% { transform: translate(-2px, 0) skewX(10deg); filter: drop-shadow(2px 0 0 #9333EA); color: #E53E3E; }
  80% { transform: translate(2px, -2px) skewX(-10deg); filter: drop-shadow(-2px 0 0 #E53E3E); color: #9333EA; }
  100% { transform: translate(0) skewX(0); filter: drop-shadow(0 0 10px #9333EA); }
}

@media (max-width: 400px) {
  .nav-item {
    min-height: 56px;
  }
  .nav-label {
    font-size: 10px;
  }
}
</style>
