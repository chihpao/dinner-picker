<template>
  <div>
    <AppHeader title="食物紀錄" :is-expenses="true">
      <template #actions>
        <button 
          class="btn btn-sm" 
          @click="showSummary = !showSummary" 
          type="button"
          :class="{ primary: showSummary }"
          title="統計"
        >
          <span class="icon-btn-content">
            <IconChartLine class="w-4 h-4" />
            <span class="mobile-hidden-text">統計</span>
          </span>
        </button>
        <NuxtLink to="/expense-entry?from=/expenses" class="btn btn-sm primary" title="新增">
          <span class="icon-btn-content">
            <IconBento class="w-4 h-4" />
            <span>新增</span>
          </span>
        </NuxtLink>
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
import IconChartLine from '~/components/icons/IconChartLine.vue'
import IconBento from '~/components/icons/IconBento.vue'

const { user } = useAuth()
const { loadEntries } = useFoodExpenses()
const showSummary = ref(false)

watch(user, () => {
  loadEntries()
}, { immediate: true })
</script>

<style scoped>
.icon-btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}
.w-4 { width: 16px; }
.h-4 { height: 16px; }

@media (max-width: 600px) {
  .mobile-hidden-text {
    display: none;
  }
}
</style>

useHead({
  title: '孜保飲食紀錄｜今晚吃哪家？',
})
</script>
