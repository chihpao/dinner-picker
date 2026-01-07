<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
        <button 
          class="btn btn-sm" 
          @click="showSummary = !showSummary" 
          type="button"
          :class="{ primary: showSummary }"
        >
          📊 統計
        </button>
        <NuxtLink to="/total/entry?from=/total" class="btn btn-sm primary">📝 新增</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="total" :is-open="showSummary" />
      </template>
    </AppHeader>

    <main class="expense-main">
      <ExpenseList ledger="total" />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { loadEntries } = useTotalExpenses()
const { loadAccounts } = useAccounts()
const showSummary = ref(false)

watch(user, () => {
  loadEntries()
  loadAccounts()
}, { immediate: true })

useHead({
  title: '全消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
