<template>
  <div class="card">
    <div class="card-main">
      <!-- Header: Icon, Name, Copy Button -->
      <div class="card-header">
        <div class="shop-info">
          <a :href="restaurant.orderUrl" target="_blank" rel="noopener" class="shop-link" data-tooltip="前往訂購">
            <span class="shop-name-text">{{ restaurant.name }}</span>
            <svg class="external-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 3h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14 21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>

        <button class="action-btn" @click="copyLink" :class="{ 'is-copied': copied }" aria-label="複製連結">
          <span v-if="!copied" class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </span>
          <span v-else class="btn-icon check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        </button>
      </div>

      <!-- Footer: Stats / Distances -->
      <div class="card-stats">
        <div class="stat-item home-item">
          <span class="stat-label">🏠 住家</span>
          <span class="stat-value text-home">{{ formatDist(restaurant.distances?.home) }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item work-item">
          <span class="stat-label">🏢 公司</span>
          <span class="stat-value text-work">{{ formatDist(restaurant.distances?.work) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/composables/useRestaurants'

const props = defineProps<{
  restaurant: Restaurant
}>()

const copied = ref(false)

const copyLink = async () => {
  if (!props.restaurant.orderUrl) {
    alert('找不到訂購連結')
    return
  }

  try {
    await navigator.clipboard.writeText(props.restaurant.orderUrl)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (e) {
    prompt('複製下列連結：', props.restaurant.orderUrl)
  }
}

const formatDist = (d?: number) => {
  if (d === undefined || d === null) return '--'
  return d.toFixed(1) + ' km'
}
</script>

<style scoped>
/* Card Container - Clean & Professional */
.card {
  background: var(--bg-paper);
  border: 1px solid var(--ink);
  box-shadow: 4px 4px 0 rgba(26, 35, 126, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 rgba(26, 35, 126, 0.15);
  border-color: var(--primary);
}

.card-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header Section */
.card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
}

/* Info & Link */
.shop-info {
  flex: 1;
  min-width: 0; /* Critical for text overflow */
  display: flex;
  align-items: center;
}

.shop-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--ink);
  font-weight: 700;
  font-size: 18px;
  line-height: 1.4;
  transition: color 0.2s;
}

.shop-link:hover {
  color: var(--primary);
}

.shop-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.external-icon {
  width: 16px;
  height: 16px;
  stroke: var(--primary);
  opacity: 1;
  flex-shrink: 0;
  animation: float-icon 3s ease-in-out infinite;
}

@keyframes float-icon {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(2px, -2px); }
}

.shop-link:hover .external-icon {
  animation: none;
  transform: translate(3px, -3px);
}

/* Action Button */
.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--ink-dim);
  background: #fff;
  color: var(--ink-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: auto; /* Push to right if needed, though flex handles it */
}

.action-btn:hover {
  background: var(--bg-body);
  color: var(--primary);
  border-color: var(--primary);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.is-copied {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

/* Stats Footer */
.card-stats {
  margin-top: auto;
  padding: 12px 16px;
  background: var(--bg-body);
  border-top: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-label {
  color: var(--ink-dim);
  font-weight: 500;
  font-size: 13px;
}

.stat-value {
  font-weight: 700;
  font-family: var(--font-pixel);
  font-size: 16px;
}

.text-home { color: var(--success); }
.text-work { color: var(--primary); }

.stat-divider {
  width: 1px;
  height: 20px;
  background: var(--ink-dim);
  opacity: 0.2;
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .card-header {
    padding: 12px;
    gap: 10px;
  }
  
  .shop-link {
    font-size: 16px;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
  }

  .btn-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .card-stats {
    padding: 10px 12px;
  }
  
  .stat-label {
    display: none; /* Hide label on very small screens to save space */
  }
  
  .stat-item::before {
    /* Use icon only via content or just keep the emoji from text */
    /* In this case, we have emojis in HTML, so removing label is enough */
  }
}
</style>
