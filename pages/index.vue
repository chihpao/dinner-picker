<template>
  <div class="page-container">
    <AppHeader title="🍱 今晚吃哪家？">
      <!-- Actions can go here if needed -->
    </AppHeader>

    <main id="app-main">
      <div v-if="isLoading" class="loader">
        <div class="loader-lines"></div>
        <p>Loading...</p>
      </div>
      
      <div v-else class="grid-wrapper">
        <div class="grid">
          <RestaurantCard 
            v-for="restaurant in processedRestaurants" 
            :key="restaurant.id" 
            :restaurant="restaurant" 
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#f4f6f8' } /* Updated to match new body bg */
  ]
})

const { processedRestaurants, isLoading } = useRestaurants()
</script>

<style scoped>
.page-container {
  max-width: 100%;
}

.grid-wrapper {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
