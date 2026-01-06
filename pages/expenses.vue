<template>
  <div>
    <AppHeader title="食物紀錄" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/expense-entry?from=/expenses" class="btn desktop-only" aria-label="孜保飲食">🍱 孜保飲食</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="food" />
      </template>
    </AppHeader>

    <main class="expense-main">
      <ExpenseList ledger="food" />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { loadEntries } = useFoodExpenses()

watch(user, () => {
  loadEntries()
}, { immediate: true })

useHead({
  title: '孜保飲食紀錄｜今晚吃哪家？',
})
</script>
