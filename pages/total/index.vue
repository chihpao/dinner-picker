<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true" hideAuth>
      <template #actions>
        <button 
          class="btn btn-sm header-icon-btn" 
          @click="expenseListRef?.openSettleModal()" 
          type="button"
          title="孜保結算"
        >
          <span class="icon-btn-content">
            <IconSettle class="w-4 h-4" />
          </span>
        </button>
        <button 
          class="btn btn-sm header-icon-btn" 
          @click="togglePanel('summary')" 
          type="button"
          :class="{ active: activePanel === 'summary' }"
          title="統計"
          :aria-pressed="activePanel === 'summary'"
        >
          <span class="icon-btn-content">
            <IconChartLine class="w-4 h-4" />
          </span>
        </button>
        <button 
          class="btn btn-sm header-icon-btn" 
          @click="togglePanel('budget')" 
          type="button"
          :class="{ active: activePanel === 'budget' }"
          title="預算"
          :aria-pressed="activePanel === 'budget'"
        >
          <span class="icon-btn-content">
            <IconTarget class="w-4 h-4" />
          </span>
        </button>
        <NuxtLink to="/total/entry?from=/total" class="btn btn-sm primary header-icon-btn" title="新增">
          <span class="icon-btn-content">
            <IconPlus class="w-4 h-4" />
          </span>
        </NuxtLink>
      </template>
      <template #bottom>
        <section v-if="activePanel" class="dashboard-panel">
          <ExpenseSummary v-show="activePanel === 'summary'" :is-open="true" />
          <BudgetPanel v-show="activePanel === 'budget'" :is-open="true" />
        </section>
      </template>
    </AppHeader>

    <main class="expense-main">
      <ExpenseList ref="expenseListRef" />
    </main>
  </div>
</template>

<script setup lang="ts">
import IconChartLine from '~/components/icons/IconChartLine.vue'
import IconTarget from '~/components/icons/IconTarget.vue'
import IconPlus from '~/components/icons/IconPlus.vue'
import IconSettle from '~/components/icons/IconSettle.vue'

const auth = useAuthStore()
const expenses = useExpensesStore()
const accounts = useAccountsStore()
const expenseListRef = ref<any>(null)
const activePanel = ref<'summary' | 'budget' | null>(null)
const PANEL_PREF_KEY = 'dinnerPicker.total.activePanel.v2'

onMounted(() => {
  if (!import.meta.client) return
  // We check the v1 tab key to support users clicking from MiniBudget on home page
  const v1Tab = localStorage.getItem('dinnerPicker.total.dashboard.tab.v1')
  if (v1Tab === 'budget') {
    activePanel.value = 'budget'
    localStorage.removeItem('dinnerPicker.total.dashboard.tab.v1') // clear it so it doesn't always open
  } else {
    const saved = localStorage.getItem(PANEL_PREF_KEY) as any
    if (saved === 'summary' || saved === 'budget' || saved === 'null') {
      activePanel.value = saved === 'null' ? null : saved
    }
  }
})

watch(activePanel, (panel) => {
  if (!import.meta.client) return
  localStorage.setItem(PANEL_PREF_KEY, String(panel))
})

const togglePanel = (panel: 'summary' | 'budget') => {
  activePanel.value = activePanel.value === panel ? null : panel
}

useHead({
  title: '全消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})

watch(() => auth.user, () => {
  if (auth.user) {
    expenses.loadEntries()
    accounts.loadAccounts()
  }
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


.header-icon-btn.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

/* ── Dashboard Panel ────────────── */
.dashboard-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

@media (max-width: 720px) {
  .header-icon-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
