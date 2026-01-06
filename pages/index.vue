<template>
  <div>
    <AppHeader title="今晚吃哪家？">
      <template #actions>
        <NuxtLink to="/expense-entry?from=/" class="btn" aria-label="開啟食物記帳">🍱 食物記帳</NuxtLink>
        <NuxtLink to="/expenses" class="btn" aria-label="查看食物總覽">📊 食物總覽</NuxtLink>
        <NuxtLink to="/total" class="btn" aria-label="開啟全消費總覽">📚 全消費總覽</NuxtLink>
      </template>
      <template #bottom>
        <div id="toolbar" class="toolbar">
          <button v-if="!userLocation && !hasAllowedLocation" @click="requestLocation" class="btn danger">📍 允許目前位置</button>
        </div>
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
