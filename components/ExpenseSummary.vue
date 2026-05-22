<template>
  <section v-if="isOpen" class="summary-section">
    <div class="summary-toolbar">
      <div class="segment-group mode-group">
        <div class="segment-slider" :class="viewMode"></div>
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="['segment-btn', { active: viewMode === mode.value, disabled: isModeLocked(mode.value) }]"
          @click="viewMode = mode.value"
          type="button"
          :disabled="isModeLocked(mode.value)"
          :aria-pressed="viewMode === mode.value"
        >
          {{ mode.label }}
        </button>
      </div>

      <div class="segment-group filter-group">
        <div class="segment-slider" :class="filterMode"></div>
        <button
          :class="['segment-btn', { active: filterMode === 'all' }]"
          @click="filterMode = 'all'"
          type="button"
          :aria-pressed="filterMode === 'all'"
        >
          全部
        </button>
        <button
          :class="['segment-btn', { active: filterMode === 'zibao' }]"
          @click="filterMode = 'zibao'"
          type="button"
          :aria-pressed="filterMode === 'zibao'"
        >
          孜保
        </button>
      </div>

      <p v-if="filterMode === 'zibao'" class="summary-hint">
        本週平均 = 本週孜保支出 ÷ 2
      </p>
    </div>

    <div class="expense-summary-grid" aria-live="polite">
      <article class="summary-card" style="--accent: var(--danger); animation-delay: 0ms;">
        <div class="card-accent"></div>
        <div class="card-inner">
          <p class="summary-label">{{ viewLabel }}支出</p>
          <AppNumberTicker :value="viewExpense" custom-class="summary-amount danger-text" />
        </div>
      </article>

      <article class="summary-card" style="--accent: var(--success); animation-delay: 60ms;">
        <div class="card-accent"></div>
        <div class="card-inner">
          <p class="summary-label">{{ viewLabel }}收入</p>
          <AppNumberTicker :value="viewIncome" custom-class="summary-amount success-text" />
        </div>
      </article>

      <article class="summary-card" :class="{ highlight: filterMode === 'zibao' }" :style="{ '--accent': filterMode === 'zibao' ? 'var(--primary)' : 'var(--ink-light)', 'animation-delay': '120ms' }">
        <div class="card-accent"></div>
        <div class="card-inner">
          <p class="summary-label">{{ averageLabel }}</p>
          <AppNumberTicker 
            :value="viewAverage" 
            :custom-class="['summary-amount', filterMode === 'zibao' ? 'primary-text' : '']" 
          />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { vibrate } from '~/utils'

const props = withDefaults(defineProps<{
  isOpen?: boolean
}>(), {
  isOpen: true
})

const expensesStore = useExpensesStore()
const { summaries, zibaoSummaries } = storeToRefs(expensesStore)
const viewMode = ref<'week' | 'month' | 'year'>('week')
const filterMode = ref<'all' | 'zibao'>('all')

const modes = [
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
] as const

const isModeLocked = (mode: 'week' | 'month' | 'year') => {
  return filterMode.value === 'zibao' && mode !== 'week'
}

watch(filterMode, (mode) => {
  vibrate(10)
  if (mode === 'zibao') {
    viewMode.value = 'week'
  }
})

watch(viewMode, () => {
  vibrate(10)
})

const viewLabel = computed(() => {
  if (viewMode.value === 'week') return '本週'
  if (viewMode.value === 'month') return '本月'
  return '今年'
})

const targetSummaries = computed(() => {
  return filterMode.value === 'zibao' ? zibaoSummaries.value : summaries.value
})

const viewExpense = computed(() => {
  if (viewMode.value === 'week') return targetSummaries.value.weekExpense
  if (viewMode.value === 'month') return targetSummaries.value.monthExpense
  return targetSummaries.value.yearExpense
})

const viewIncome = computed(() => {
  if (viewMode.value === 'week') return targetSummaries.value.weekIncome
  if (viewMode.value === 'month') return targetSummaries.value.monthIncome
  return targetSummaries.value.yearIncome
})

const viewAverage = computed(() => {
  if (filterMode.value === 'zibao') {
    return Math.round(zibaoSummaries.value.weekExpense / 2)
  }
  if (viewMode.value === 'week') return Math.round(viewExpense.value / 7)
  if (viewMode.value === 'month') return Math.round(viewExpense.value / 30)
  return Math.round(viewExpense.value / 12)
})

const averageLabel = computed(() => {
  if (filterMode.value === 'zibao') return '本週平均'
  if (viewMode.value === 'week') return '日均支出'
  if (viewMode.value === 'month') return '日均支出'
  return '月均支出'
})
</script>

<style scoped>
.danger-text { color: var(--danger); text-shadow: 0 0 8px rgba(229, 62, 62, 0.6); }
.success-text { color: var(--success); text-shadow: 0 0 8px rgba(59, 130, 246, 0.6); }
.primary-text { color: var(--primary-light); text-shadow: var(--text-glow); }

.summary-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg-paper);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);
  padding: 16px;
  margin-top: 12px;
}

.summary-toolbar {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.summary-hint {
  margin: 0;
  font-size: 11px;
  color: var(--ink-light);
  font-family: var(--font-sans);
}

.segment-group {
  position: relative;
  display: grid;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--border);
  gap: 4px;
  width: 100%;
  z-index: 1;
}

.mode-group {
  grid-template-columns: repeat(3, 1fr);
}

.filter-group {
  grid-template-columns: repeat(2, 1fr);
}

.segment-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--primary-light);
  border-radius: 2px;
  box-shadow: var(--shadow-glow);
  transition: transform 0.4s var(--ease-spring);
  z-index: -1;
}

.mode-group .segment-slider { width: calc(33.333% - 5.33px); }
.mode-group .segment-slider.week { transform: translateX(0); }
.mode-group .segment-slider.month { transform: translateX(calc(100% + 4px)); }
.mode-group .segment-slider.year { transform: translateX(calc(200% + 8px)); }

.filter-group .segment-slider { width: calc(50% - 6px); }
.filter-group .segment-slider.all { transform: translateX(2px); }
.filter-group .segment-slider.zibao { transform: translateX(calc(100% + 6px)); }

.segment-btn {
  border: none;
  background: transparent;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  min-height: 36px;
  padding: 6px 12px;
  cursor: pointer;
  transition: color 0.3s, opacity 0.3s;
  letter-spacing: 0.04em;
}

.segment-btn.active {
  color: #fff;
  text-shadow: var(--text-glow);
}

.segment-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.expense-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  width: 100%;
}

.summary-card {
  background: var(--bg-paper);
  border: var(--border-width) solid var(--border);
  border-radius: 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;
  transition: all 0.3s var(--ease-snappy);
  animation: staggerSlideUp var(--duration-normal) var(--spring-smooth) both;
  animation-delay: var(--stagger, 0ms);
}

.summary-card::before {
  content: '呪';
  position: absolute;
  right: -5px;
  bottom: -25px;
  font-size: 90px;
  font-family: "Noto Serif JP", var(--font-sans);
  font-weight: 800;
  opacity: 0.15;
  color: var(--primary-light);
  pointer-events: none;
  z-index: 0;
}
.summary-card:nth-child(2)::before {
  content: '祓';
}
.summary-card:nth-child(3)::before {
  content: '式';
}

.card-accent {
  width: 4px;
  flex-shrink: 0;
  background: var(--accent, var(--primary));
  box-shadow: 0 0 10px var(--accent, var(--primary));
  border-radius: 0;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.summary-card:hover .card-accent {
  opacity: 1;
}

.card-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.summary-card.highlight {
  border-color: var(--primary-light);
  background: rgba(168, 85, 247, 0.15);
  box-shadow: var(--shadow-glow);
}

.summary-label {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
}

.summary-amount {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 720px) {
  .expense-summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    box-shadow: none;
  }
}

@media (min-width: 721px) {
  .summary-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .segment-group {
    width: auto;
    min-width: 200px;
  }
  
  .mode-group {
    min-width: 280px;
  }
  
  .expense-summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
