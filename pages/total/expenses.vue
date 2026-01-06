<template>
  <div>
    <AppHeader title="總記帳消費總覽" :is-expenses="true" back-to="/total">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total/expenses" class="btn" aria-label="新增總記帳">📝 新增記帳</NuxtLink>
        <NuxtLink to="/total/accounts" class="btn" aria-label="管理帳戶">🏦 帳戶</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="total" />
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

watch(user, () => {
  loadEntries()
  loadAccounts()
}, { immediate: true })

useHead({
  title: '總記帳消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
