<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total" class="btn desktop-only" aria-label="一般記帳">📝 一般記帳</NuxtLink>
      </template>
      <template #bottom>
        <div class="summary-toolbar px-4 py-2">
          <div class="summary-switch">
            <button @click="period = 'month'" class="btn btn-sm" :class="{ primary: period === 'month' }">本月</button>
            <button @click="period = 'all'" class="btn btn-sm" :class="{ primary: period === 'all' }">全部</button>
          </div>
          <NuxtLink to="/total/entry?from=/total" class="btn primary mobile-only">📝 一般記帳</NuxtLink>
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
