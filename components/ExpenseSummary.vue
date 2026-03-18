<template>
  <section v-if="isOpen" class="summary-section">
    <div class="summary-toolbar">
      <div class="summary-switch">
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="['btn btn-sm', { primary: viewMode === mode.value, disabled: isModeLocked(mode.value) }]"
          @click="viewMode = mode.value"
          type="button"
          :disabled="isModeLocked(mode.value)"
          :aria-pressed="viewMode === mode.value"
        >
          {{ mode.label }}
        </button>
      </div>

      <div class="summary-switch">
        <button
          :class="['btn btn-sm', { primary: filterMode === 'all' }]"
          @click="filterMode = 'all'"
          type="button"
          :aria-pressed="filterMode === 'all'"
        >
          全部
        </button>
        <button
          :class="['btn btn-sm', { primary: filterMode === 'zibao' }]"
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
const props = withDefaults(defineProps<{
  isOpen?: boolean
}>(), {
  isOpen: true
})

const expenses = useTotalExpenses()
const { summaries, zibaoSummaries } = expenses
const viewMode = ref<'week' | 'month' | 'year'>('week')
const filterMode = ref<'all' | 'zibao'>('all')

const modes = [
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
]

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
  border-top: var(--border-width) solid var(--border);
  padding-top: 14px;
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

.summary-switch {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  width: 100%;
}

.summary-switch .btn {
  min-height: 36px;
  padding: 0 12px;
  font-size: 12px;
  flex: 1;
}

.summary-switch .btn.disabled {
  opacity: 0.45;
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
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card.highlight {
  border-color: #c7c6f7;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
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

  .summary-toolbar {
    gap: 8px;
    margin-bottom: 8px;
  }

  .summary-switch {
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .summary-switch::-webkit-scrollbar {
    display: none;
  }

  .summary-switch .btn {
    min-width: 64px;
    flex: 1 0 auto;
  }

  .summary-card {
    box-shadow: none;
  }
}
</style>
