<template>
  <div class="app-layout">
    <div class="sidebar-wrapper">
      <AppSidebar />
    </div>
    <div class="main-content">
      <div class="wrap">
        <slot />
      </div>
      <MobileNav />
    </div>
  </div>
</template>

<script setup lang="ts">
const { initAuth, user } = useAuth()
const { fetchRestaurants } = useRestaurants()
const { loadEntries } = useTotalExpenses()

onMounted(() => {
  initAuth()
  fetchRestaurants()
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
  display: none; /* Hidden by default (mobile) */
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex child overflow */
}

/* Desktop Styles */
@media (min-width: 900px) {
  .sidebar-wrapper {
    display: block;
  }
}
</style>
