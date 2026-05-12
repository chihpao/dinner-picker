<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>

        <NuxtLink to="/total/entry?from=/total" class="btn btn-sm primary header-icon-btn" title="新增">
          <span class="icon-btn-content">
            <IconPlus class="w-4 h-4" />
          </span>
        </NuxtLink>
      </template>
      <template #bottom>
        <section class="dashboard-panel">
          <div class="dashboard-tabs-wrapper">
            <div class="dashboard-tabs">
              <div class="tab-slider" :class="dashTab"></div>
              <button
                :class="['tab-btn', { active: dashTab === 'summary' }]"
                type="button"
                @click="dashTab = 'summary'"
              >
                統計
              </button>
              <button
                :class="['tab-btn', { active: dashTab === 'budget' }]"
                type="button"
                @click="dashTab = 'budget'"
              >
                預算
              </button>
            </div>
          </div>
          <ExpenseSummary v-show="dashTab === 'summary'" :is-open="true" />
          <BudgetPanel v-show="dashTab === 'budget'" :is-open="true" />
        </section>
      </template>
    </AppHeader>

    <main class="expense-main">
      <ExpenseList />
    </main>
  </div>
</template>

<script setup lang="ts">
import IconChartLine from '~/components/icons/IconChartLine.vue'
import IconPlus from '~/components/icons/IconPlus.vue'

const { user } = useAuth()
const { loadEntries } = useTotalExpenses()
const { loadAccounts } = useAccounts()
const dashTab = ref<'summary' | 'budget'>('summary')
const DASHTAB_PREF_KEY = 'dinnerPicker.total.dashboard.tab.v1'

onMounted(() => {
  if (!import.meta.client) return
  const savedTab = localStorage.getItem(DASHTAB_PREF_KEY)
  if (savedTab === 'summary' || savedTab === 'budget') dashTab.value = savedTab
})

watch(dashTab, (tab) => {
  if (!import.meta.client) return
  localStorage.setItem(DASHTAB_PREF_KEY, tab)
})

useHead({
  title: '全消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})

watch(user, () => {
  loadEntries()
  loadAccounts()
}, { immediate: true })
</script>

<style scoped>
.icon-btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}
.w-4 { width: 16px; }
.h-4 { height: 16px; }

.header-icon-btn {
  width: 38px;
  height: 38px;
  padding: 0;
}

/* ── Dashboard Panel ────────────── */
.dashboard-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard-tabs-wrapper {
  padding: 12px 16px 0;
}

.dashboard-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(230, 234, 242, 0.6);
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  z-index: 1;
  max-width: 400px;
  margin: 0 auto;
}

.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 6px);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -1;
}

.tab-slider.summary { transform: translateX(2px); }
.tab-slider.budget { transform: translateX(calc(100% + 6px)); }

.tab-btn {
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
  transition: color 0.3s;
  letter-spacing: 0.04em;
}

.tab-btn.active {
  color: var(--primary);
}

@media (max-width: 720px) {
  .header-icon-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
