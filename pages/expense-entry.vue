<template>
  <ExpenseForm ledger="food" />
</template>

<script setup lang="ts">
const { user } = useAuth()
const { loadAccounts } = useAccounts()

watch(user, () => {
  loadAccounts()
}, { immediate: true })

useHead({
  title: '孜保飲食｜今晚吃哪家？',
})
</script>
