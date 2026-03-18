<template>
  <div class="app-layout">
    <div class="sidebar-wrapper">
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
import { useAuth } from '~/composables/useAuth'
import { useRestaurants } from '~/composables/useRestaurants'
import { useTotalExpenses } from '~/composables/useExpenses'
import { useSwipeNavigation } from '~/composables/useSwipeNavigation'
import PwaInstallPrompt from '~/components/PwaInstallPrompt.vue'

const { initAuth, user } = useAuth()
const { fetchRestaurants } = useRestaurants()
const { loadEntries } = useTotalExpenses()
const { initSwipe, destroySwipe } = useSwipeNavigation()

const mainContentRef = ref<HTMLElement | null>(null)

onMounted(() => {
  initAuth()
  fetchRestaurants()
  initSwipe(mainContentRef.value)
})

onUnmounted(() => {
  destroySwipe(mainContentRef.value)
})

watch(user, () => {
  loadEntries()
}, { immediate: true })
</script>
<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar-wrapper {
  display: none; /* Mobile: sidebar hidden */
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
    width: 256px;
    flex-shrink: 0;
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
