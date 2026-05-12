<template>
  <section v-if="isOpen" class="budget-section">
    <!-- Toolbar: toggle between viewing and editing -->
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

    <!-- Edit Mode -->
    <div v-if="editing" class="budget-edit">
      <label class="budget-field">
        <span class="budget-field-label">每月預算</span>
        <div class="budget-input-wrap">
          <span class="budget-prefix">NT$</span>
          <input
            type="number"
            :value="monthlyBudget"
            @change="handleMonthlyChange"
            min="0"
            step="1000"
            placeholder="0"
            class="budget-input"
          >
        </div>
        <div class="quick-tags">
          <button
            v-for="amt in monthPresets"
            :key="amt"
            type="button"
            class="tag-btn"
            :class="{ active: monthlyBudget === amt }"
            @click="setMonthlyBudget(amt)"
          >
            {{ (amt / 1000).toFixed(0) }}K
          </button>
        </div>
      </label>

      <label class="budget-field">
        <span class="budget-field-label">每週預算</span>
        <div class="budget-input-wrap">
          <span class="budget-prefix">NT$</span>
          <input
            type="number"
            :value="weeklyBudget"
            @change="handleWeeklyChange"
            min="0"
            step="500"
            placeholder="0"
            class="budget-input"
          >
        </div>
        <div class="quick-tags">
          <button
            v-for="amt in weekPresets"
            :key="amt"
            type="button"
            class="tag-btn"
            :class="{ active: weeklyBudget === amt }"
            @click="setWeeklyBudget(amt)"
          >
            {{ (amt / 1000).toFixed(1) }}K
          </button>
        </div>
      </label>
    </div>

    <!-- Display Mode -->
    <div v-else-if="hasBudget" class="budget-meters">
      <!-- Monthly Budget -->
      <div v-if="monthlyBudget > 0" class="meter-card">
        <div class="meter-header">
          <span class="meter-label">本月預算</span>
          <span class="meter-fraction">
            <span class="meter-spent">{{ formatCurrency(monthSpent) }}</span>
            <span class="meter-sep">/</span>
            <span class="meter-total">{{ formatCurrency(monthlyBudget) }}</span>
          </span>
        </div>
        <div class="meter-bar-track">
          <div
            class="meter-bar-fill"
            :style="{ width: `${monthPercent}%` }"
          />
        </div>
        <div class="meter-footer">
          <span class="meter-remaining">
            {{ monthRemaining >= 0 ? `剩餘 ${formatCurrency(monthRemaining)}` : `超支 ${formatCurrency(Math.abs(monthRemaining))}` }}
          </span>
          <span v-if="monthDailyPace !== null && monthRemaining > 0" class="meter-pace">
            每日可花 {{ formatCurrency(monthDailyPace) }}
          </span>
        </div>
      </div>

      <!-- Weekly Budget -->
      <div v-if="weeklyBudget > 0" class="meter-card">
        <div class="meter-header">
          <span class="meter-label">本週預算</span>
          <span class="meter-fraction">
            <span class="meter-spent">{{ formatCurrency(weekSpent) }}</span>
            <span class="meter-sep">/</span>
            <span class="meter-total">{{ formatCurrency(weeklyBudget) }}</span>
          </span>
        </div>
        <div class="meter-bar-track">
          <div
            class="meter-bar-fill"
            :style="{ width: `${weekPercent}%` }"
          />
        </div>
        <div class="meter-footer">
          <span class="meter-remaining">
            {{ weekRemaining >= 0 ? `剩餘 ${formatCurrency(weekRemaining)}` : `超支 ${formatCurrency(Math.abs(weekRemaining))}` }}
          </span>
          <span v-if="weekDailyPace !== null && weekRemaining > 0" class="meter-pace">
            每日可花 {{ formatCurrency(weekDailyPace) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state when no budget set -->
    <div v-else class="budget-empty">
      <p>尚未設定預算</p>
      <button class="btn btn-sm primary" type="button" @click="editing = true">
        立即設定
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import IconTarget from '~/components/icons/IconTarget.vue'

withDefaults(defineProps<{
  isOpen?: boolean
}>(), {
  isOpen: true
})

const {
  monthlyBudget, weeklyBudget,
  monthSpent, weekSpent,
  monthRemaining, weekRemaining,
  monthPercent, weekPercent,
  monthDailyPace, weekDailyPace,
  hasBudget,
  loadBudget,
  setMonthlyBudget, setWeeklyBudget,
} = useBudget()

const editing = ref(false)

const monthPresets = [5000, 8000, 10000, 15000, 20000, 30000]
const weekPresets = [1500, 2000, 3000, 4000, 5000, 7000]

onMounted(() => {
  loadBudget()
})

const handleMonthlyChange = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  setMonthlyBudget(val)
}

const handleWeeklyChange = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  setWeeklyBudget(val)
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

/* ── Edit Mode ────────────────────── */
.budget-edit {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .budget-edit {
    grid-template-columns: 1fr 1fr;
  }
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

.budget-input-wrap {
  position: relative;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 6px 12px;
}

.budget-input-wrap:focus-within {
  background: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15), 0 4px 12px rgba(79, 70, 229, 0.08);
}

.budget-prefix {
  position: absolute;
  left: 14px;
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
  height: 40px;
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

.budget-input::placeholder {
  color: rgba(0,0,0,0.15);
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  border: 1px solid rgba(0,0,0,0.06);
  background: #ffffff;
  border-radius: 8px;
  min-height: 32px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.tag-btn:hover {
  border-color: rgba(79, 70, 229, 0.3);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.08);
}

.tag-btn.active {
  transform: scale(0.95);
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: none;
}

/* ── Display Mode ─────────────────── */
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
  padding: 14px;
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

/* ── Progress Bar ─────────────────── */
.meter-bar-track {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
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

/* ── Footer Stats ─────────────────── */
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

.meter-pace {
  font-size: 11px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

/* ── Empty State ──────────────────── */
.budget-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: var(--ink-light);
  font-size: 13px;
  font-family: var(--font-pixel);
}

@media (max-width: 720px) {
  .budget-meters {
    grid-template-columns: 1fr;
  }

  .meter-card {
    box-shadow: none;
  }
}
</style>
