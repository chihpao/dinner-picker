<template>
  <div class="page-container">
    <AppHeader title="🍱 今晚吃哪家？">
      <template #actions>
        <NuxtLink to="/total" class="btn btn-sm header-icon-btn" title="總覽">
          <span class="icon-btn-content">
            <IconOverview class="w-4 h-4" />
          </span>
        </NuxtLink>
        <NuxtLink to="/total/accounts" class="btn btn-sm header-icon-btn" title="帳戶">
          <span class="icon-btn-content">
            <IconBank class="w-4 h-4" />
          </span>
        </NuxtLink>
      </template>
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
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'

useHead({
  title: '今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#f4f6f8' }
  ]
})

const { processedRestaurants, isLoading } = useRestaurants()
</script>

<style scoped>
.page-container {
  max-width: 100%;
  display: grid;
  gap: 14px;
}

.grid-wrapper {
  animation: fadeIn 0.5s ease-out;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.icon-btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.w-4 {
  width: 16px;
}

.h-4 {
  height: 16px;
}

.header-icon-btn {
  width: 38px;
  height: 38px;
  padding: 0;
}

@media (min-width: 721px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 420px) {
  .header-icon-btn {
    width: 40px;
    height: 40px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
