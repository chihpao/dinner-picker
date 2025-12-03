<template>
  <section class="panel">
    <div class="panel-header">
      <h2>紀錄列表</h2>
      <button @click="openClearAll" class="btn danger btn-sm" type="button" :disabled="!entries.length">清空全部</button>
    </div>
    
    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再查看/管理紀錄</p>
    </div>

    <div v-else-if="!entries.length" class="empty-state">目前沒有紀錄，先新增一筆吧！</div>
    
    <div v-else class="expense-list">
      <article v-for="entry in entries" :key="entry.id" class="entry-card">
        <template v-if="editingId === entry.id">
          <div class="entry-meta">
            <label class="inline-field">
              <span>日期</span>
              <input type="date" v-model="editForm.date">
            </label>
          </div>
          <label class="inline-field">
            <span>金額 (NT$)</span>
            <input type="number" v-model.number="editForm.amount" min="0" step="1">
          </label>
          <label class="inline-field">
            <span>備註</span>
            <input type="text" v-model="editForm.note" placeholder="備註">
          </label>
          <div class="entry-actions">
            <button class="btn btn-sm primary" @click="saveEdit" type="button">儲存</button>
            <button class="btn btn-sm" @click="cancelEdit" type="button">取消</button>
          </div>
        </template>
        <template v-else>
          <div class="entry-meta">
            <p class="entry-date">{{ formatDate(entry.date) }}</p>
          </div>
          <p class="entry-amount">{{ formatCurrency(entry.amount) }}</p>
          <p v-if="entry.note" class="entry-note">{{ entry.note }}</p>
          <div class="entry-actions">
            <button class="btn btn-sm" @click="startEdit(entry)" type="button">編輯</button>
            <button class="btn btn-sm danger" @click="openDelete(entry.id)" type="button">刪除</button>
          </div>
        </template>
      </article>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteTargetId" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3>刪除紀錄</h3>
        <p>是否要刪除這筆資料？選擇「是」刪除，選擇「否」取消。</p>
        <div class="modal-actions">
          <button class="btn primary" @click="confirmDelete" type="button">是</button>
          <button class="btn" @click="cancelDelete" type="button">否</button>
        </div>
      </div>
    </div>

    <!-- Clear all confirmation modal -->
    <div v-if="clearModalOpen" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3>清空全部紀錄</h3>
        <p>此動作將清空全部紀錄，且無法復原。</p>
        <label class="inline-field">
          <span>請輸入 "Deleate" 以確認</span>
          <input type="text" v-model="clearInput" placeholder="Deleate">
        </label>
        <p v-if="showClearError" class="helper-text danger-text">驗證文字不正確</p>
        <div class="modal-actions">
          <button class="btn primary" :disabled="!clearInput" @click="confirmClearAll" type="button">確定清空</button>
          <button class="btn" @click="closeClearAll" type="button">取消</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ExpenseEntry } from '~/composables/useExpenses'

const { user } = useAuth()
const { entries, deleteEntry, updateEntry, clearAll } = useExpenses()

const editingId = ref<string | null>(null)
const editForm = reactive({
  date: '',
  amount: 0 as number,
  note: ''
})
const deleteTargetId = ref<string | null>(null)
const clearModalOpen = ref(false)
const clearInput = ref('')
const showClearError = ref(false)

const startEdit = (entry: ExpenseEntry) => {
  editingId.value = entry.id
  editForm.date = entry.date
  editForm.amount = entry.amount
  editForm.note = entry.note ?? ''
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async () => {
  if (!editingId.value) return
  const target = entries.value.find(e => e.id === editingId.value)
  if (!target) {
    editingId.value = null
    return
  }

  if (!editForm.date) {
    alert('請選擇日期')
    return
  }

  if (!editForm.amount || editForm.amount <= 0) {
    alert('請輸入正確的金額')
    return
  }

  await updateEntry({
    ...target,
    date: editForm.date,
    amount: Math.round(editForm.amount),
    note: editForm.note ?? ''
  })
  editingId.value = null
}

const openDelete = (id: string) => {
  deleteTargetId.value = id
}

const cancelDelete = () => {
  deleteTargetId.value = null
}

const confirmDelete = async () => {
  if (!deleteTargetId.value) return
  await deleteEntry(deleteTargetId.value)
  deleteTargetId.value = null
}

const openClearAll = () => {
  clearModalOpen.value = true
  clearInput.value = ''
  showClearError.value = false
}

const closeClearAll = () => {
  clearModalOpen.value = false
  showClearError.value = false
}

const confirmClearAll = async () => {
  if (clearInput.value !== 'Deleate') {
    showClearError.value = true
    return
  }
  await clearAll()
  clearModalOpen.value = false
}
</script>
