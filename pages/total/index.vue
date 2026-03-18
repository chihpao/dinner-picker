<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
        <button 
          class="btn btn-sm header-icon-btn" 
          @click="showSummary = !showSummary" 
          type="button"
          :class="{ primary: showSummary }"
          title="統計"
          :aria-pressed="showSummary"
          aria-label="切換統計顯示"
        >
          <span class="icon-btn-content">
            <IconChartLine class="w-4 h-4" />
          </span>
        </button>
        <NuxtLink to="/total/entry?from=/total" class="btn btn-sm primary header-icon-btn" title="新增">
          <span class="icon-btn-content">
            <IconPlus class="w-4 h-4" />
          </span>
        </NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary :is-open="showSummary" />
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
const showSummary = ref(false)
const SUMMARY_PREF_KEY = 'dinnerPicker.total.summary.open.v1'

onMounted(() => {
  if (!import.meta.client) return
  showSummary.value = localStorage.getItem(SUMMARY_PREF_KEY) === '1'
})

watch(showSummary, (open) => {
  if (!import.meta.client) return
  localStorage.setItem(SUMMARY_PREF_KEY, open ? '1' : '0')
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

@media (max-width: 720px) {
  .header-icon-btn {
    width: 40px;
    height: 40px;
  }
}

</style>
