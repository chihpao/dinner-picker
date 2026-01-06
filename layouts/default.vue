<template>
  <div class="wrap">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { initAuth, user } = useAuth()
const { fetchRestaurants } = useRestaurants()
const { loadEntries } = useFoodExpenses()

onMounted(() => {
  initAuth()
  fetchRestaurants()
})

watch(user, () => {
  loadEntries()
}, { immediate: true })
</script>
