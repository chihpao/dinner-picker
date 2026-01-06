<template>
  <div>
    <AppHeader title="全消費總覽" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total" class="btn" aria-label="新增記帳">📝 新增記帳</NuxtLink>
        <NuxtLink to="/total/accounts" class="btn" aria-label="管理帳戶">🏦 帳戶</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="total" />
      </template>
    </AppHeader>

    <main class="expense-main">
      <section class="panel ledger-intro">
        <h2>全消費總覽</h2>
        <p>這裡是你的個人帳本，包含記帳與帳戶管理。</p>
      </section>
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
