<template>
  <div class="card">
    <!-- Top Action: Copy Link (Absolute Position) -->
    <button class="copy-btn" @click.stop="copyLink" :class="{ 'is-copied': copied }" aria-label="複製連結" title="複製連結">
      <span v-if="!copied">📋</span>
      <span v-else>✅</span>
    </button>

    <!-- Main Content: Clickable Area -->
    <NuxtLink :to="restaurant.orderUrl" target="_blank" rel="noopener" class="card-content">
      <div class="card-header">
        <h3 class="name">{{ restaurant.name }}</h3>
        <div class="link-hint">
          前往訂購 <span class="arrow">↗</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/composables/useRestaurants'

const props = defineProps<{
  restaurant: Restaurant
}>()

const copied = ref(false)

const copyLink = async () => {
  if (!props.restaurant.orderUrl) return
  try {
    await navigator.clipboard.writeText(props.restaurant.orderUrl)
    copied.value = true
    setTimeout(() => copied.value = false, 1500)
  } catch (e) {
    prompt('複製連結：', props.restaurant.orderUrl)
  }
}

</script>

<style scoped>
.card {
  /* Inherits styles from global .card */
  display: flex;
  flex-direction: column;
  position: relative;
  /* Ensure z-index context */
  isolation: isolate;
}

/* Copy Button - Floating Top Right */
.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 2px solid var(--border);
  background: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10; /* Above link */
  transition: all 0.1s;
  font-size: 16px;
}

.copy-btn:hover {
  background: var(--bg-body);
  transform: translateY(-1px);
}

.copy-btn:active {
  transform: translate(1px, 1px);
}

.copy-btn.is-copied {
  background: var(--success-bg);
  border-color: var(--success);
}

/* Main Clickable Content */
.card-content {
  flex: 1;
  flex: 1;
  padding: 24px; /* Standardize spacing */
  padding-right: 60px; /* Space for copy btn */
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-decoration: none;
  color: var(--ink);
  min-height: 100px; /* Ensure visual weight */
  background: transparent;
  transition: background 0.2s;
}

.card-content:hover {
  background: #fafafa;
}

.name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
  /* Limit to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-hint {
  font-size: 14px;
  color: var(--primary);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.card-content:hover .link-hint {
  opacity: 1;
  text-decoration: underline;
}

.arrow {
  font-family: monospace;
  transition: transform 0.2s;
}

.card-content:hover .arrow {
  transform: translate(2px, -2px);
}

/* Mobile Adjustments */
@media (max-width: 480px) {
  .name { font-size: 20px; }
  .card-content { padding: 16px; padding-right: 54px; min-height: auto; }
  .value { font-size: 18px; }
}
</style>
