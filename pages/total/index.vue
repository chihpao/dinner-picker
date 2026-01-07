<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total" class="btn desktop-only" aria-label="一般記帳">📝 一般記帳</NuxtLink>
      </template>
      <template #bottom>
        <div class="px-4 py-2">
          <ExpenseSummary ledger="total" />
          <div class="mt-4 flex justify-end mobile-only">
            <NuxtLink to="/total/entry?from=/total" class="btn primary w-full justify-center">📝 一般記帳</NuxtLink>
          </div>
        </div>
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
  title: '全消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
