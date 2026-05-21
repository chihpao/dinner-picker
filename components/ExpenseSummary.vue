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
      <article class="summary-card">
        <p class="summary-label">{{ viewLabel }}支出</p>
        <p class="summary-amount danger-text">{{ formatCurrency(viewExpense) }}</p>
      </article>

      <article class="summary-card">
        <p class="summary-label">{{ viewLabel }}收入</p>
        <p class="summary-amount success-text">{{ formatCurrency(viewIncome) }}</p>
      </article>

      <article class="summary-card" :class="{ highlight: filterMode === 'zibao' }">
        <p class="summary-label">{{ averageLabel }}</p>
        <p class="summary-amount" :class="{ 'primary-text': filterMode === 'zibao' }">
          {{ formatCurrency(viewAverage) }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

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
  if (mode === 'zibao') {
    viewMode.value = 'week'
  }
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
.danger-text { color: #ef4444; }
.success-text { color: #10b981; }
.primary-text { color: var(--primary); }

.summary-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  background: rgba(230, 234, 242, 0.6);
  padding: 4px;
  border-radius: 12px;
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
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  border-radius: 8px;
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
  color: var(--primary);
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
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card.highlight {
  border-color: #c7c6f7;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), var(--shadow-sm);
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
  font-family: var(--font-pixel);
  font-size: 19px;
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
