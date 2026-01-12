<template>
  <section v-if="isOpen" class="summary-section">
    <div class="summary-toolbar mb-4 flex-col items-start gap-3">
      <!-- Time Period Switch -->
      <div class="summary-switch">
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="['btn btn-sm', { primary: viewMode === mode.value }]"
          @click="viewMode = mode.value"
          type="button"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- Filter Mode Switch (Moved below Time Period) -->
      <div class="summary-switch">
        <button
          :class="['btn btn-sm', { primary: filterMode === 'all' }]"
          @click="filterMode = 'all'"
          type="button"
        >
          全部
        </button>
        <button
          :class="['btn btn-sm', { primary: filterMode === 'zibao' }]"
          @click="filterMode = 'zibao'"
          type="button"
        >
          孜保
        </button>
      </div>
    </div>

    <div class="expense-summary-grid" aria-live="polite">
      <!-- Total Ledger View (Show Income/Expense/Net) -->
      <article class="summary-card">
        <p class="summary-label">{{ viewLabel }}支出</p>
        <p class="summary-amount danger-text">{{ formatCurrency(viewExpense) }}</p>
      </article>
      
      <article class="summary-card">
        <p class="summary-label">{{ viewLabel }}收入</p>
        <p class="summary-amount success-text">{{ formatCurrency(viewIncome) }}</p>
      </article>

      <article v-if="filterMode === 'zibao'" class="summary-card">
        <p class="summary-label">{{ viewLabel }}平均</p>
        <p class="summary-amount">{{ formatCurrency(viewExpense / 2) }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isOpen?: boolean
}>(), {
  isOpen: false
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
  // @ts-ignore
  if (viewMode.value === 'week') return targetSummaries.value.weekIncome
  // @ts-ignore
  if (viewMode.value === 'month') return targetSummaries.value.monthIncome
  // @ts-ignore
  return targetSummaries.value.yearIncome
})
</script>

<style scoped>
.danger-text { color: #ef4444; }
.success-text { color: #10b981; }

.summary-toolbar {
  display: flex;
}
.items-start { align-items: flex-start; }
.flex-col { flex-direction: column; }
.gap-3 { gap: 12px; }
.mb-4 { margin-bottom: 16px; }
</style>
