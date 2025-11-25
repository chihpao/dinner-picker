<template>
  <div v-if="hasDistances" class="distance-summary">
    <div v-if="primary" class="dist-primary" :class="`tier-${tierFor(0)}`">
      <span class="dist-icon" aria-hidden="true">{{ primary.icon }}</span>
      <span class="dist-label">{{ primary.label }}</span>
      <span class="dist-km">{{ primary.dist.toFixed(1) }} km</span>
    </div>
    <div v-if="secondaries.length" class="dist-secondary">
      <span v-for="(r, idx) in secondaries" :key="r.key">
        {{ idx ? ' • ' : '' }}{{ r.icon }} 
        <span class="dist-km" :class="`tier-${tierFor(idx + 1)}`">{{ r.dist.toFixed(1) }} km</span>
      </span>
    </div>
  </div>
  <div v-else class="distance-summary is-empty"></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  distances?: {
    current?: number
    home?: number
    work?: number
  }
}>()

const rows = computed(() => {
  if (!props.distances) return []
  return [
    { key: 'current', label: '目前', icon: '📍', dist: props.distances.current },
    { key: 'home', label: '住家', icon: '🏠', dist: props.distances.home },
    { key: 'work', label: '公司', icon: '🏢', dist: props.distances.work },
  ].filter(r => r.dist !== undefined && Number.isFinite(r.dist)) as { key: string, label: string, icon: string, dist: number }[]
})

const hasDistances = computed(() => rows.value.length > 0)

const ranked = computed(() => rows.value.slice().sort((a, b) => a.dist - b.dist))
const primary = computed(() => ranked.value[0])
const secondaries = computed(() => ranked.value.slice(1))

const tierFor = (idx: number) => idx === 0 ? 'near' : idx === 1 ? 'mid' : 'far'
</script>
