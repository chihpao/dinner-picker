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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue' // Import all necessary Vue functions
import { useAuth } from '~/composables/useAuth'
import { useRestaurants } from '~/composables/useRestaurants'
import { useTotalExpenses } from '~/composables/useExpenses' // Assuming this is where loadEntries comes from
import { useSwipeNavigation } from '~/composables/useSwipeNavigation'

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
  min-width: 0; /* Prevent flex child overflow */
}

/* Desktop Styles */
@media (min-width: 721px) { /* Based on AGENTS.MD 720px breakpoint */
  .sidebar-wrapper {
    display: block;
    width: 256px; /* Equivalent to w-64 */
    flex-shrink: 0;
  }
  .mobile-nav {
    display: none; /* Desktop: mobile nav hidden */
  }
}
</style>
