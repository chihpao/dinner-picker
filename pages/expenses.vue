<template>
  <div>
    <AppHeader title="食物消費總覽" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/expense-entry?from=/expenses" class="btn desktop-only" aria-label="新增食物記帳">🍱 記帳</NuxtLink>
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
useHead({
  title: '食物記帳本｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
