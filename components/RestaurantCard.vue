<template>
  <div v-if="loading" class="card restaurant-card skeleton-card">
    <div class="card-body">
      <AppSkeleton type="avatar" shape="rect" class="skeleton-icon" />
      <div class="card-info">
        <AppSkeleton width="60%" height="20px" />
      </div>
      <div class="card-action">
        <AppSkeleton type="icon" shape="circle" class="skeleton-btn" />
      </div>
    </div>
  </div>
  <NuxtLink v-else-if="restaurant" :to="restaurant.orderUrl" target="_blank" rel="noopener" class="card restaurant-card">
    <div class="card-body">
      <div class="card-icon">{{ getIcon(restaurant.name) }}</div>
      <div class="card-info">
        <h3 class="name">{{ restaurant.name }}</h3>
      </div>
      <div class="card-action">
        <div class="order-btn-circle" title="前往訂購">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/composables/useRestaurants'
import AppSkeleton from './AppSkeleton.vue'

const props = defineProps<{
  restaurant?: Restaurant
  loading?: boolean
  isDrink?: boolean
}>()

const getIcon = (name: string) => {
  const foodIcons = ['🍱', '🥗', '🍲', '🍚', '🍗', '🥬', '🥢', '🥘']
  const drinkIcons = ['🥤', '🧋', '🍵', '☕', '🍹', '🥛']
  const pool = props.isDrink ? drinkIcons : foodIcons
  const hash = name.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0)
  return pool[hash % pool.length]
}
</script>

<style scoped>
.restaurant-card {
  text-decoration: none;
  color: var(--ink);
  transition: all 0.3s var(--ease-snappy);
}

.card-body {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  font-size: 26px;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 19px;
  font-weight: 800;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.02em;
}

.order-btn-circle {
  width: 44px;
  height: 44px;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-light);
  transition: all 0.25s var(--ease-snappy);
}

.restaurant-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-light);
  box-shadow: var(--shadow-glow);
}

.restaurant-card:active {
  transform: translateY(-2px) scale(0.98);
}

.restaurant-card:hover .order-btn-circle {
  background: var(--primary);
  color: white;
  border-color: transparent;
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-glow);
}

.restaurant-card:hover .card-icon {
  background: rgba(147, 51, 234, 0.12);
  border-color: var(--primary-light);
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(147, 51, 234, 0.4);
}

.restaurant-card:hover .card-icon::after {
  content: '⬡';
  position: absolute;
  font-size: 48px;
  color: var(--primary);
  opacity: 0.15;
  animation: sigilSpin 4s linear infinite;
}

.card-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes sigilSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.skeleton-icon { width: 56px; height: 56px; border-radius: 0; }
.skeleton-btn { width: 44px; height: 44px; }

@media (max-width: 480px) {
  .card-body { padding: 14px 16px; }
  .card-icon, .skeleton-icon { width: 48px; height: 48px; font-size: 22px; }
  .name { font-size: 17px; }
  .order-btn-circle, .skeleton-btn { width: 38px; height: 38px; }
  .order-btn-circle svg { width: 16px; height: 16px; }
}
</style>
