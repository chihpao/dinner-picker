<template>
  <div class="accounts-page">
    <AppHeader title="帳戶管理" :subtitle="`共 ${accounts.length} 個帳戶`" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/add-account" class="btn btn-sm header-icon-btn" title="新增帳戶" aria-label="新增帳戶">
          <IconCirclePlus class="w-4 h-4" />
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="expense-main">
      <AccountPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import IconCirclePlus from '~/components/icons/IconCirclePlus.vue'

const { user } = useAuth()
const { loadEntries } = useTotalExpenses()
const { accounts, loadAccounts } = useAccounts()

watch(user, () => {
  loadEntries()
  loadAccounts()
}, { immediate: true })

useHead({
  title: '帳戶管理｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>

<style scoped>
.accounts-page {
  display: grid;
  gap: 14px;
}

@media (max-width: 720px) {
  .accounts-page {
    gap: 12px;
  }
}
</style>
