<template>
  <div class="accounts-page">
    <AppHeader title="帳戶管理" :is-expenses="true">
      <template #actions>
        <NuxtLink to="/total/add-account" class="btn btn-sm primary add-account-btn" title="新增帳戶" aria-label="新增帳戶">
          <IconPlus />
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="expense-main">
      <AccountPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import IconPlus from '~/components/icons/IconPlus.vue'

const { user } = useAuth()
const { loadEntries } = useTotalExpenses()
const { loadAccounts } = useAccounts()

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

.add-account-btn {
  width: 38px;
  height: 38px;
  padding: 0;
}

.add-account-btn :deep(svg) {
  width: 18px;
  height: 18px;
}

@media (max-width: 720px) {
  .accounts-page {
    gap: 12px;
  }

  .add-account-btn {
    width: 40px;
    height: 40px;
  }

}
</style>
