<template>
  <section v-if="isOpen" class="summary-section">
    <div class="summary-toolbar mb-2">
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
    </div>

    <div class="expense-summary-grid" aria-live="polite">
      <!-- Food Ledger View (Keep simple) -->
      <template v-if="ledger === 'food'">
        <article class="summary-card">
          <p class="summary-label">今日支出</p>
          <p class="summary-amount">{{ formatCurrency(summaries.todayExpense) }}</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">{{ viewLabel }}</p>
          <p class="summary-amount">{{ formatCurrency(viewExpense) }}</p>
        </article>
        <article v-if="showPerPerson" class="summary-card">
          <p class="summary-label">本週每人</p>
          <p class="summary-amount">{{ formatCurrency(perPersonAmount) }}</p>
        </article>
      </template>

      <!-- Total Ledger View (Show Income/Expense/Net) -->
      <template v-else>
        <article class="summary-card">
          <p class="summary-label">{{ viewLabel }}支出</p>
          <p class="summary-amount danger-text">{{ formatCurrency(viewExpense) }}</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">{{ viewLabel }}收入</p>
          <p class="summary-amount success-text">{{ formatCurrency(viewIncome) }}</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">{{ viewLabel }}結餘</p>
          <p class="summary-amount" :class="viewNet >= 0 ? 'success-text' : 'danger-text'">
            {{ viewNet >= 0 ? '+' : '' }}{{ formatCurrency(viewNet) }}
          </p>
        </article>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  ledger?: 'food' | 'total',
  isOpen?: boolean
}>(), {
  ledger: 'food',
  isOpen: false
})

const expenses = props.ledger === 'food' ? useFoodExpenses() : useTotalExpenses()
const { summaries } = expenses
const viewMode = ref<'week' | 'month' | 'year'>('week')

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

const viewExpense = computed(() => {
  if (viewMode.value === 'week') return summaries.value.weekExpense
  if (viewMode.value === 'month') return summaries.value.monthExpense
  return summaries.value.yearExpense
})

const viewIncome = computed(() => {
  // @ts-ignore - computed properties from useExpenses might not be fully typed in IDE but exist at runtime
  if (viewMode.value === 'week') return summaries.value.weekIncome
  // @ts-ignore
  if (viewMode.value === 'month') return summaries.value.monthIncome
  // @ts-ignore
  return summaries.value.yearIncome
})

const viewNet = computed(() => {
  // Net is simply the sum (Income is negative, Expense is positive... wait)
  // Logic check:
  // In database: Expense = Positive, Income = Negative.
  // So Sum = Expense - Income.
  // Wait, usually Net = Income - Expense.
  // If Income is -500, Expense is 100. Sum is -400.
  // Net Income should be 500 - 100 = 400.
  // So Net = -(Sum).
  // Let's verify:
  // Income 500 (stored as -500). Expense 100 (stored as 100).
  // summaries.week (sum) = -400.
  // Net Profit = 400.
  // So Net = -summaries.value.week
  // UNLESS I change the storage sign convention.
  // But I decided: Income = Negative, Expense = Positive.
  // So Net (Profit) = -(Sum).
  // Let's check:
  // User spends 100. Sum = 100. Net should be -100. -(100) = -100. Correct.
  // User earns 200. Sum = -200. Net should be +200. -(-200) = +200. Correct.
  if (viewMode.value === 'week') return -summaries.value.week
  if (viewMode.value === 'month') return -summaries.value.month
  return -summaries.value.year
})

const showPerPerson = computed(() => props.ledger === 'food' && viewMode.value === 'week')
const perPersonAmount = computed(() => summaries.value.weekExpense / 2)
</script>

<style scoped>
.danger-text { color: #ef4444; }
.success-text { color: #10b981; }
</style>
