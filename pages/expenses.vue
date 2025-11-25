<template>
  <div>
    <AppHeader title="消費總覽" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/expense-entry?from=/expenses" class="btn" aria-label="新增記帳紀錄">📝 記帳</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary />
      </template>
    </AppHeader>

    <main class="expense-main">
      <ExpenseList />
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '每日記帳本｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
