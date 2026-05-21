<template>
  <div class="app-layout">
    <AppToast />
    <div class="sidebar-wrapper" :class="{ collapsed: isCollapsed }">
      <AppSidebar />
    </div>
    <div ref="mainContentRef" class="main-content">
      <div class="wrap">
        <slot />
      </div>
      <MobileNav />
    </div>
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import PwaInstallPrompt from '~/components/PwaInstallPrompt.vue'

const auth = useAuthStore()
const restaurants = useRestaurantsStore()
const expenses = useExpensesStore()
const budget = useBudgetStore()
const { initSwipe, destroySwipe } = useSwipeNavigation()
const { isCollapsed } = useSidebar()

const mainContentRef = ref<HTMLElement | null>(null)

onMounted(() => {
  auth.initAuth()
  restaurants.fetchRestaurants()
  initSwipe(mainContentRef.value)
})

onUnmounted(() => {
  destroySwipe(mainContentRef.value)
})

watch(() => auth.user, () => {
  if (auth.user) {
    expenses.loadEntries()
    budget.loadBudgetRules()
  }
}, { immediate: true })
</script>
<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar-wrapper {
  display: none;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-top: 0;
  padding-bottom: calc(var(--mobile-nav-height) + max(0px, env(safe-area-inset-bottom)));
}

.wrap {
  flex: 1;
  padding: 14px 12px 18px;
}

@media (min-width: 721px) {
  .sidebar-wrapper {
    display: block;
    width: 240px;
    flex-shrink: 0;
    transition: width 0.2s var(--ease-snappy);
  }

  .sidebar-wrapper.collapsed {
    width: 72px;
  }
  .mobile-nav {
    display: none;
  }

  .main-content {
    padding-top: 0;
    padding-bottom: 0;
  }

  .wrap {
    padding: 24px 16px;
  }
}
</style>
