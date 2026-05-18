<template>
  <div class="page-container">
    <AppHeader title="🍱 今晚吃哪家？" hideAuth />

    <main id="app-main">
      <div v-if="isLoading" class="grid">
        <RestaurantCard v-for="i in 6" :key="i" loading />
      </div>
      <div v-else class="home-content">
        <section class="list-section">
          <div class="section-header">
            <h3 class="section-title">餐廳清單</h3>
            <span class="pill">共 {{ processedRestaurants.length }} 家</span>
          </div>
          <div class="grid">
            <RestaurantCard
              v-for="restaurant in processedRestaurants"
              :key="restaurant.id"
              :restaurant="restaurant"
            />
          </div>
        </section>
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
    { name: 'theme-color', content: '#f7f7f8' }
  ]
})

const { processedRestaurants, isLoading } = useRestaurants()
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s var(--ease-snappy);
}

/* ── List Section ──────────────────── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.section-title {
  font-family: var(--font-pixel);
  font-size: 16px;
  margin: 0;
}

.pill {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: 99px;
  color: var(--ink-light);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 721px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
}
</style>
