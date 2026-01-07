<template>
  <div>
    <AppHeader title="食物紀錄" :is-expenses="true">
      <template #actions>
        <button 
          class="btn btn-sm" 
          @click="showSummary = !showSummary" 
          type="button"
          :class="{ primary: showSummary }"
        >
          📊 統計
        </button>
        <NuxtLink to="/expense-entry?from=/expenses" class="btn btn-sm primary">🍱 新增</NuxtLink>
      </template>
      <template #bottom>
        <ExpenseSummary ledger="food" :is-open="showSummary" />
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
const showSummary = ref(false)

watch(user, () => {
  loadEntries()
}, { immediate: true })

useHead({
  title: '孜保飲食紀錄｜今晚吃哪家？',
})
</script>
