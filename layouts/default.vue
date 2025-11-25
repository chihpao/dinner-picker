<template>
  <div class="wrap">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { initAuth } = useAuth()
const { fetchRestaurants } = useRestaurants()
const { loadEntries } = useExpenses()

onMounted(() => {
  initAuth()
  fetchRestaurants()
  loadEntries()
})
</script>
