<template>
  <section class="panel">
    <div class="panel-header">
      <h2>紀錄列表</h2>
      <button @click="clearAll" class="btn danger btn-sm" type="button" :disabled="!entries.length">清空全部</button>
    </div>
    
    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再查看/管理紀錄</p>
    </div>

    <div v-else-if="!entries.length" class="empty-state">目前沒有紀錄，先新增一筆吧！</div>
    
    <div v-else class="expense-list">
      <article v-for="entry in entries" :key="entry.id" class="entry-card">
        <div class="entry-meta">
          <p class="entry-date">{{ formatDate(entry.date) }}</p>
        </div>
        <p class="entry-amount">{{ formatCurrency(entry.amount) }}</p>
        <p v-if="entry.note" class="entry-note">{{ entry.note }}</p>
        <button class="btn btn-sm" @click="deleteEntry(entry.id)" type="button">刪除</button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { entries, deleteEntry, clearAll } = useExpenses()
</script>
