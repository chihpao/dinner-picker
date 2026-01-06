<template>
  <div>
    <AppHeader title="帳戶管理" :is-expenses="true" back-to="/total">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total/accounts" class="btn desktop-only" aria-label="一般記帳">📝 一般記帳</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="total" />
      </template>
    </AppHeader>

    <main class="expense-main">
      <AccountPanel />
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
  title: '帳戶管理｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
