<template>
  <div class="page-container">
    <AppHeader title="🍱 今晚吃哪家？" hideAuth bg-image="/AppHeaderBack.jpg">
      <template #actions>
        <div class="category-toggle">
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'restaurants' }"
            @click="activeTab = 'restaurants'"
          >
            餐廳
          </button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'drinks' }"
            @click="activeTab = 'drinks'"
          >
            飲料
          </button>
        </div>
      </template>
    </AppHeader>

    <main id="app-main">
      <div v-if="isLoading" class="grid">
        <RestaurantCard v-for="i in 6" :key="i" loading />
      </div>
      <div v-else class="home-content">
        <section class="list-section">
          <div class="grid">
            <RestaurantCard
              v-for="item in processedItems"
              :key="item.id"
              :restaurant="item"
              :is-drink="activeTab === 'drinks'"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconOverview from '~/components/icons/IconOverview.vue'
import IconBank from '~/components/icons/IconBank.vue'

useHead({
  title: '今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#f7f7f8' }
  ]
})

const store = useRestaurantsStore()
const { processedItems, isLoading, activeTab } = storeToRefs(store)
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-toggle {
  display: flex;
  background: var(--bg-body);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  gap: 4px;
}

.toggle-btn {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s var(--ease-snappy);
}

.toggle-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
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
