<template>
  <div class="card">
    <button class="copy-icon-btn copy-link-btn" @click="copyLink" :class="{ 'is-copied': copied }" aria-label="複製連結">
      <span v-if="!copied" class="copy-icon copy-default" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h6A2.25 2.25 0 0 1 19.5 9.75v6a2.25 2.25 0 0 1-2.25 2.25h-6A2.25 2.25 0 0 1 9 15.75v-6Z"/><path d="M5.25 14.25A2.25 2.25 0 0 1 3 12V6.75A2.75 2.75 0 0 1 5.75 4h5.5" stroke-linecap="round"/></svg>
      </span>
      <span v-else class="copy-icon copy-check" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span class="copy-tooltip">{{ copied ? '已複製' : '複製' }}</span>
    </button>
    
    <div class="card-title">
      <div class="avatar" :class="avatar.bg">{{ avatar.icon }}</div>
      <a :href="restaurant.orderUrl" target="_blank" rel="noopener" class="restaurant-link" data-tooltip="前往訂購">
        {{ restaurant.name }}
      </a>
    </div>

    <DistanceSummary :distances="restaurant.distances" />
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/composables/useRestaurants'

const props = defineProps<{
  restaurant: Restaurant
}>()

const copied = ref(false)

const avatar = computed(() => {
  const n = props.restaurant.name.toLowerCase()
  if (n.includes('能量') || n.includes('力')) return { icon: '⚡', bg: '' }
  if (n.includes('蛋') || n.includes('肌')) return { icon: '🥚', bg: '' }
  if (n.includes('燃') || n.includes('火')) return { icon: '🔥', bg: '' }
  if (n.includes('樂') || n.includes('蔬') || n.includes('輕')) return { icon: '🥗', bg: '' }
  return { icon: '🍴', bg: '' }
})

const copyLink = async () => {
  if (!props.restaurant.orderUrl) {
    alert('找不到訂購連結，請稍後再試')
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
</script>
