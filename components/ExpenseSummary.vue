<template>
  <div class="expense-summary-grid" aria-live="polite">
    <article class="summary-card">
      <p class="summary-label">今日支出</p>
      <p class="summary-amount">{{ formatCurrency(summaries.today) }}</p>
    </article>
    <article class="summary-card">
      <p class="summary-label">本週累計</p>
      <p class="summary-amount">{{ formatCurrency(summaries.week) }}</p>
    </article>
    <article class="summary-card">
      <p class="summary-label">本月累計</p>
      <p class="summary-amount">{{ formatCurrency(summaries.month) }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
const { summaries } = useExpenses()
</script>
