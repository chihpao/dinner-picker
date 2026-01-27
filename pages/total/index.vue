<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
      <button 
          class="btn btn-sm" 
          @click="showSummary = !showSummary" 
          type="button"
          :class="{ primary: showSummary }"
          title="統計"
        >
          <span class="icon-btn-content">
            <IconChartLine class="w-4 h-4" />
          </span>
        </button>
        <NuxtLink to="/total/entry?from=/total" class="btn btn-sm primary" title="新增">
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
import IconEdit from '~/components/icons/IconEdit.vue'
import IconPlus from '~/components/icons/IconPlus.vue'

const { user } = useAuth()
const { loadEntries } = useTotalExpenses()
const { loadAccounts } = useAccounts()
const showSummary = ref(false)

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

@media (max-width: 600px) {
  .mobile-hidden-text {
    display: none;
  }
}
</style>
