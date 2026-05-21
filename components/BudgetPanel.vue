<template>
  <section v-if="isOpen" class="budget-section">
    <div class="budget-toolbar">
      <h3 class="budget-title">
        <IconTarget class="budget-icon" />
        預算追蹤
      </h3>
      <button
        class="btn btn-sm"
        :class="{ primary: editing }"
        type="button"
        @click="editing = !editing"
      >
        {{ editing ? '完成' : '設定' }}
      </button>
    </div>

    <div v-if="editing" class="budget-edit">
      <div v-if="budgetRules.length > 0" class="rule-list">
        <div v-for="rule in budgetRules" :key="rule.id" class="rule-edit-card">
          <div class="rule-edit-header">
            <span class="rule-category-badge">{{ getCategoryLabel(rule.category) }}</span>
            <button class="icon-btn danger" @click="deleteBudgetRule(rule.id)" type="button" title="刪除規則">
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
          <div class="rule-edit-body">
            <span class="rule-date-range">{{ rule.start_date.replace(/-/g, '/') }} ~ {{ rule.end_date.replace(/-/g, '/') }}</span>
            <span class="rule-amount-text">{{ formatCurrency(rule.amount) }}</span>
          </div>
        </div>
      </div>
      
      <div class="new-rule-form">
        <h4>新增預算規則</h4>
        <label class="budget-field">
          <span class="budget-field-label">類別</span>
          <select class="input select" v-model="newRule.category">
            <option value="all">全部類別</option>
            <option v-for="cat in EXPENSE_CATEGORIES" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </label>
        <div class="date-fields">
          <label class="budget-field">
            <span class="budget-field-label">開始日期</span>
            <input class="input" type="date" v-model="newRule.start_date">
          </label>
          <label class="budget-field">
            <span class="budget-field-label">結束日期</span>
            <input class="input" type="date" v-model="newRule.end_date">
          </label>
        </div>
        <label class="budget-field">
          <span class="budget-field-label">預算金額</span>
          <div class="budget-input-wrap">
            <span class="budget-prefix">NT$</span>
            <input
              type="number"
              v-model.number="newRule.amount"
              min="0"
              step="1000"
              placeholder="0"
              class="budget-input"
            >
          </div>
        </label>
        <button class="btn primary w-full mt-2" type="button" @click="submitNewRule" :disabled="!isNewRuleValid">
          新增規則
        </button>
      </div>
    </div>

    <div v-else-if="activeBudgets.length > 0" class="budget-meters">
      <div v-for="rule in activeBudgets" :key="rule.id" class="meter-card">
        <div class="meter-header">
          <div class="meter-title">
            <span class="rule-category-badge">{{ getCategoryLabel(rule.category) }}</span>
            <span class="meter-label">{{ formatShortDate(rule.start_date) }} ~ {{ formatShortDate(rule.end_date) }}</span>
          </div>
          <span class="meter-fraction">
            <AppNumberTicker :value="getRuleProgress(rule).spent" custom-class="meter-spent" />
            <span class="meter-sep">/</span>
            <span class="meter-total">{{ formatCurrency(rule.amount) }}</span>
          </span>
        </div>
        <div class="meter-bar-track">
          <div
            class="meter-bar-fill"
            :class="getRuleProgress(rule).status"
            :style="{ width: `${getRuleProgress(rule).percent}%` }"
          />
        </div>
        <div class="meter-footer">
          <div class="meter-footer-info">
            <span class="meter-remaining" :class="getRuleProgress(rule).status">
              {{ getRuleProgress(rule).remaining >= 0 ? '剩餘 ' : '超支 ' }}
              <AppNumberTicker :value="Math.abs(getRuleProgress(rule).remaining)" />
            </span>
            <span v-if="getRuleProgress(rule).remaining > 0 && getRuleProgress(rule).dailyPace > 0" class="meter-pace">
              每天可花 <AppNumberTicker :value="getRuleProgress(rule).dailyPace" />
            </span>
          </div>
          <button 
            class="btn btn-sm details-btn" 
            type="button" 
            @click="setBudgetFilter(rule.category, rule.start_date, rule.end_date)"
            title="查看此預算的消費明細"
          >
            <IconList class="w-4 h-4" />
            <span>明細</span>
          </button>
        </div>
      </div>
    </div>

    <AppEmptyState 
      v-else 
      title="設個預算" 
      message="讓花錢也有節奏感，設定週/月預算來掌握支出。"
    >
      <template #icon>
        <IconEmptyChart style="color: #c7c6f7" />
      </template>
      <button class="btn primary" type="button" @click="editing = true">
        立即設定
      </button>
    </AppEmptyState>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconTarget from '~/components/icons/IconTarget.vue'
import IconTrash from '~/components/icons/IconTrash.vue'
import IconList from '~/components/icons/IconList.vue'
import IconEmptyChart from '~/components/icons/IconEmptyChart.vue'
import { EXPENSE_CATEGORIES } from '~/stores/expenses'
import { useExpenseFilters } from '~/composables/useExpenseFilters'

withDefaults(defineProps<{ isOpen?: boolean }>(), { isOpen: true })

const budgetStore = useBudgetStore()
const { budgetRules, activeBudgets } = storeToRefs(budgetStore)
const { loadBudgetRules, addBudgetRule, deleteBudgetRule, getRuleProgress } = budgetStore

const { setBudgetFilter } = useExpenseFilters()
const editing = ref(false)
const newRule = reactive({
  category: 'all',
  amount: '' as unknown as number,
  start_date: toISODate(new Date()),
  end_date: toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
})

onMounted(loadBudgetRules)

const isNewRuleValid = computed(() => newRule.amount > 0 && newRule.start_date && newRule.end_date && newRule.start_date <= newRule.end_date)

const submitNewRule = async () => {
  if (!isNewRuleValid.value) return
  await addBudgetRule({
    category: newRule.category,
    amount: newRule.amount,
    start_date: newRule.start_date,
    end_date: newRule.end_date,
  })
  newRule.amount = '' as unknown as number
}

const getCategoryLabel = (val: string) => {
  if (val === 'all') return '全部類別'
  return EXPENSE_CATEGORIES.find(c => c.value === val)?.label || val
}

const formatShortDate = (dateStr: string) => {
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : dateStr
}
</script>

<style scoped>
.budget-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.budget-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.budget-title {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 6px;
}

.budget-icon {
  width: 16px;
  height: 16px;
  color: var(--primary);
}

.budget-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-edit-card {
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-edit-body {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.rule-category-badge {
  font-family: var(--font-pixel);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--ink);
  letter-spacing: 0.04em;
}

.rule-date-range {
  font-size: 12px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
}

.rule-amount-text {
  font-size: 16px;
  font-weight: bold;
  font-family: var(--font-pixel);
}

.new-rule-form {
  background: rgba(255, 255, 255, 0.02);
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.new-rule-form h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: var(--ink);
}

.date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.budget-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.budget-field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
}

.input {
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  background: var(--bg-paper);
  min-width: 0;
}

.budget-input-wrap {
  position: relative;
  background: var(--bg-paper);
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 6px 12px;
}

.budget-input-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.budget-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  pointer-events: none;
}

.budget-input {
  width: 100%;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-pixel);
  color: var(--ink);
  text-align: right;
  padding: 0;
  letter-spacing: 0.02em;
}

.budget-input:focus {
  outline: none;
}

.budget-meters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .budget-meters {
    grid-template-columns: 1fr 1fr;
  }
}

.meter-card {
  background: var(--bg-paper);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meter-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.meter-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meter-label {
  font-family: var(--font-pixel);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
}

.meter-fraction {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--ink-light);
}

.meter-spent {
  font-weight: 700;
  color: var(--ink);
  font-size: 13px;
}

.meter-sep {
  margin: 0 2px;
  opacity: 0.4;
}

.meter-total {
  opacity: 0.7;
}

.meter-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  overflow: hidden;
}

.meter-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s var(--ease-snappy);
  min-width: 2px;
  background: linear-gradient(90deg, var(--primary), #818cf8);
}

.meter-bar-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.meter-bar-fill.danger {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.meter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.meter-remaining {
  font-family: var(--font-pixel);
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.meter-remaining.danger {
  color: #ef4444;
}

.meter-pace {
  font-size: 11px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.meter-footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.details-btn {
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border);
  color: var(--ink-light);
  font-family: var(--font-pixel);
}

.details-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.details-btn span {
  font-size: 11px;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--ink-light);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--ink);
}

.icon-btn.danger:hover {
  color: var(--danger);
  background: rgba(220, 38, 38, 0.1);
}

.w-full {
  width: 100%;
}
.mt-2 {
  margin-top: 8px;
}
</style>
