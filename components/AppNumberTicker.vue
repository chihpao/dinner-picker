<template>
  <span :class="customClass">{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils'

const props = defineProps<{
  value: number
  duration?: number
  customClass?: string
}>()

const displayValue = ref(props.value)
const formattedValue = computed(() => formatCurrency(Math.round(displayValue.value)))

let animationFrame: number

const animateValue = (start: number, end: number, duration: number) => {
  const startTime = performance.now()
  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayValue.value = start + (end - start) * easeProgress
    if (progress < 1) animationFrame = requestAnimationFrame(step)
  }
  animationFrame = requestAnimationFrame(step)
}

watch(() => props.value, (newVal, oldVal) => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animateValue(oldVal || 0, newVal, props.duration || 800)
}, { immediate: true })

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>
