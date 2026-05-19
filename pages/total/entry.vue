<template>
  <ExpenseForm />
</template>

<script setup lang="ts">
const auth = useAuthStore()
const accounts = useAccountsStore()

watch(() => auth.user, () => {
  accounts.loadAccounts()
}, { immediate: true })

useHead({
  title: '一般記帳｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
