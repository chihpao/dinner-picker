<template>
  <div>
    <AppHeader title="總記帳" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/entry?from=/total" class="btn" aria-label="新增總記帳">📝 新增記帳</NuxtLink>
        <NuxtLink to="/total/expenses" class="btn" aria-label="查看總記帳消費總覽">📊 消費總覽</NuxtLink>
        <NuxtLink to="/total/accounts" class="btn" aria-label="管理帳戶">🏦 帳戶</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="total" />
      </template>
    </AppHeader>

    <main class="expense-main">
      <section class="panel ledger-intro">
        <h2>個人總記帳</h2>
        <p>這裡是你的個人帳本，包含記帳、消費總覽與帳戶管理。</p>
        <p>建議先建立帳戶，再開始記帳，才能看到銀行支出。</p>
      </section>
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
  title: '總記帳｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>
