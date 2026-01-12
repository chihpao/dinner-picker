<template>
  <ExpenseForm />
</template>

<script setup lang="ts">
const { user } = useAuth()
const { loadAccounts } = useAccounts()

watch(user, () => {
  loadAccounts()
}, { immediate: true })

useHead({
  title: '全消費總覽｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>