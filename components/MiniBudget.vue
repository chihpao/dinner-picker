<template>
  <div 
    v-if="hasBudget && firstRule && progress" 
    class="mini-budget" 
    @click="goToBudget"
    role="button"
    tabindex="0"
    aria-label="前往預算設定"
  >
    <div class="mini-budget-header">
      <span class="label">預算剩餘</span>
      <span class="amount" :class="progress.status">
        {{ progress.remaining >= 0 ? formatCurrency(progress.remaining) : `超支 ${formatCurrency(Math.abs(progress.remaining))}` }}
      </span>
    </div>
    <div class="mini-budget-track">
      <div 
        class="mini-budget-fill" 
        :class="progress.status" 
        :style="{ width: `${progress.percent}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const budgetStore = useBudgetStore()
const { hasBudget, activeBudgets } = storeToRefs(budgetStore)
const { loadBudgetRules, getRuleProgress } = budgetStore
const router = useRouter()

onMounted(loadBudgetRules)

const firstRule = computed(() => activeBudgets.value[0] || null)
const progress = computed(() => firstRule.value ? getRuleProgress(firstRule.value) : null)

const goToBudget = () => {
  if (import.meta.client) {
    localStorage.setItem('dinnerPicker.total.dashboard.tab.v1', 'budget')
  }
  router.push('/total')
}
</script>

<style scoped>
.mini-budget {
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  margin: 0 16px 14px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s var(--ease-snappy);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-budget:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #d1d5db;
}

.mini-budget:active {
  transform: scale(0.98);
}

.mini-budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
}

.amount {
  font-family: var(--font-pixel);
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.amount.danger {
  color: var(--danger);
}

.mini-budget-track {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 99px;
  overflow: hidden;
}

.mini-budget-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s var(--ease-snappy);
  min-width: 2px;
  background: linear-gradient(90deg, var(--primary), #818cf8);
}

.mini-budget-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.mini-budget-fill.danger {
  background: linear-gradient(90deg, var(--danger), #f87171);
}

@media (min-width: 721px) {
  .mini-budget {
    margin: 0 0 16px;
  }
}
</style>
