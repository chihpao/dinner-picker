<template>
  <span :class="['amount-signature', customClass]">
    <span v-if="showCurrency" class="currency-symbol">NT$</span>
    <span class="amount-digits" :class="{ 'spring-bump': isBumping }" @animationend="isBumping = false">{{ formattedValue }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  duration?: number
  customClass?: string | string[]
  showCurrency?: boolean
}>(), {
  duration: 600,
  showCurrency: true,
})

const displayValue = ref(props.value)
const isBumping = ref(true)

const formatDigits = (num: number) => {
  return Math.round(num).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const formattedValue = computed(() => formatDigits(displayValue.value))

let animationFrame: number

const springAnimate = (start: number, end: number, duration: number) => {
  const startTime = performance.now()
  const diff = end - start
  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const dampedSpring = 1 - Math.pow(2, -10 * progress) * Math.cos(progress * Math.PI * 2.5)
    const springProgress = progress === 1 ? 1 : dampedSpring
    displayValue.value = start + diff * springProgress
    if (progress < 1) animationFrame = requestAnimationFrame(step)
  }
  animationFrame = requestAnimationFrame(step)
}

watch(() => props.value, (newVal, oldVal) => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  springAnimate(oldVal || 0, newVal, props.duration)
  if (oldVal !== newVal) {
    isBumping.value = false
    setTimeout(() => { isBumping.value = true }, 10)
  }
}, { immediate: true })

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.amount-signature {
  font-family: var(--font-pixel);
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}

.currency-symbol {
  font-size: 0.55em;
  opacity: 0.6;
  font-weight: 400;
  letter-spacing: 0;
  margin-right: 2px;
}

.amount-digits {
  font-weight: 900;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  display: inline-block;
  will-change: transform;
}

:global(.text-success) .amount-digits,
:global(.success-text) .amount-digits {
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.6), 0 0 24px rgba(59, 130, 246, 0.3);
}

:global(.text-danger) .amount-digits,
:global(.danger-text) .amount-digits {
  text-shadow: 0 0 12px rgba(229, 62, 62, 0.6), 0 0 24px rgba(229, 62, 62, 0.3);
}

:global(.text-primary) .amount-digits,
:global(.primary-text) .amount-digits {
  text-shadow: 0 0 12px rgba(147, 51, 234, 0.6), 0 0 24px rgba(147, 51, 234, 0.3);
}

.spring-bump {
  animation: numImpact 150ms cubic-bezier(0, 1, 0, 1);
}

@keyframes numImpact {
  0% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
