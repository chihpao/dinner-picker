<template>
  <div>
    <AppHeader title="今晚吃哪家？">
      <template #actions>
        <button 
          v-if="!userLocation && !hasAllowedLocation" 
          @click="requestLocation" 
          class="btn danger whitespace-nowrap"
          aria-label="允許目前位置"
        >
          📍 <span class="mobile-hidden-text">允許目前位置</span>
        </button>
      </template>
    </AppHeader>

    <main id="app-main">
      <div v-if="isLoading" class="loader">
        <div class="loader-lines"></div>
        <p>読み込み中...</p>
      </div>
      <div v-else class="grid">
        <RestaurantCard 
          v-for="restaurant in processedRestaurants" 
          :key="restaurant.id" 
          :restaurant="restaurant" 
        />
      </div>
    </main>

    <div class="tooltip" role="tooltip" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#e3f2fd' }
  ]
})

const { processedRestaurants, isLoading, userLocation, requestLocation, hasAllowedLocation } = useRestaurants()
</script>
