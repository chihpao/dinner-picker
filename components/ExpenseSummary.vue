<template>
  <section class="summary-section">
    <div class="summary-toolbar">
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
      <button class="btn btn-sm" @click="collapsed = !collapsed" type="button">
        {{ collapsed ? '展開統計' : '收合統計' }}
      </button>
    </div>

    <div v-if="!collapsed" class="expense-summary-grid" aria-live="polite">
      <article class="summary-card">
        <p class="summary-label">今日支出</p>
        <p class="summary-amount">{{ formatCurrency(summaries.today) }}</p>
      </article>
      <article class="summary-card">
        <p class="summary-label">{{ viewLabel }}</p>
        <p class="summary-amount">{{ formatCurrency(viewAmount) }}</p>
      </article>
      <article v-if="showPerPerson" class="summary-card">
        <p class="summary-label">本週每人</p>
        <p class="summary-amount">{{ formatCurrency(perPersonAmount) }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  ledger?: 'food' | 'total'
}>(), {
  ledger: 'food'
})

const expenses = props.ledger === 'food' ? useFoodExpenses() : useTotalExpenses()
const { summaries } = expenses
const collapsed = ref(false)
const viewMode = ref<'week' | 'month' | 'year'>('week')

const modes = [
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
]

const viewLabel = computed(() => {
  if (viewMode.value === 'week') return '本週累計'
  if (viewMode.value === 'month') return '本月累計'
  return '今年累計'
})

const viewAmount = computed(() => {
  if (viewMode.value === 'week') return summaries.value.week
  if (viewMode.value === 'month') return summaries.value.month
  return summaries.value.year
})

const showPerPerson = computed(() => props.ledger === 'food' && viewMode.value === 'week')
const perPersonAmount = computed(() => summaries.value.week / 2)
</script>
