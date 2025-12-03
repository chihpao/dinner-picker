<template>
  <section class="panel">
    <div class="panel-header">
      <div class="panel-title-group">
        <h2>紀錄列表</h2>
        <span v-if="selectedCount" class="pill">已選 {{ selectedCount }} 筆</span>
      </div>
      <div class="panel-actions">
        <div class="sort-switch">
          <span>排序</span>
          <button
            class="btn btn-sm"
            :class="{ primary: sortKey === 'date' }"
            @click="toggleSort('date')"
            type="button"
          >
            日期 {{ sortKey === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : '' }}
          </button>
          <button
            class="btn btn-sm"
            :class="{ primary: sortKey === 'amount' }"
            @click="toggleSort('amount')"
            type="button"
          >
            金額 {{ sortKey === 'amount' ? (sortOrder === 'desc' ? '↓' : '↑') : '' }}
          </button>
        </div>
        <div class="panel-actions-buttons">
          <button @click="toggleSelectAll" class="btn btn-sm" type="button" :disabled="!entries.length">
            {{ allSelected ? '取消全選' : '全選' }}
          </button>
          <button @click="openBulkDelete" class="btn danger btn-sm" type="button" :disabled="!selectedCount">批次刪除</button>
          <button @click="openClearAll" class="btn danger btn-sm" type="button" :disabled="!entries.length">清空全部</button>
        </div>
      </div>
    </div>
    
    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再查看/管理紀錄</p>
    </div>

    <div v-else-if="!entries.length" class="empty-state">目前沒有紀錄，先新增一筆吧！</div>
    
    <div v-else class="expense-list">
      <article v-for="entry in sortedEntries" :key="entry.id" class="entry-card">
        <template v-if="editingId === entry.id">
          <div class="entry-meta">
            <label class="checkbox-pill">
              <input class="checkbox-square" type="checkbox" :checked="isSelected(entry.id)" @change="toggleSelect(entry.id)">
            </label>
            <label class="inline-field">
              <span>日期</span>
              <input type="date" v-model="editForm.date">
            </label>
            <div class="quick-actions">
              <span>日期快捷</span>
              <button class="btn btn-sm" type="button" @click="setToday">今天</button>
              <button class="btn btn-sm" type="button" @click="setYesterday">昨天</button>
            </div>
          </div>
          <label class="inline-field">
            <span>金額 (NT$)</span>
            <input type="number" v-model.number="editForm.amount" min="0" step="1">
          </label>
          <div class="quick-actions">
            <span>快速調整</span>
            <button class="btn btn-sm" type="button" @click="adjustAmount(-100)">-100</button>
            <button class="btn btn-sm" type="button" @click="adjustAmount(-10)">-10</button>
            <button class="btn btn-sm" type="button" @click="adjustAmount(10)">+10</button>
            <button class="btn btn-sm" type="button" @click="adjustAmount(100)">+100</button>
          </div>
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
            <label class="checkbox-pill">
              <input class="checkbox-square" type="checkbox" :checked="isSelected(entry.id)" @change="toggleSelect(entry.id)">
            </label>
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

    <!-- Bulk delete confirmation modal -->
    <div v-if="bulkModalOpen" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3>批次刪除</h3>
        <p>確定要刪除選取的 {{ selectedCount }} 筆紀錄嗎？此操作無法復原。</p>
        <div class="modal-actions">
          <button class="btn primary" @click="confirmBulkDelete" type="button">是，刪除</button>
          <button class="btn" @click="closeBulkDelete" type="button">否，取消</button>
        </div>
      </div>
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

    <!-- Mobile bottom toolbar -->
    <div class="mobile-toolbar" aria-label="主要操作">
      <NuxtLink class="btn" to="/expense-entry?from=/expenses">新增記帳</NuxtLink>
      <button class="btn" type="button" @click="cycleSort">
        排序：{{ sortLabel }}
      </button>
      <button class="btn danger" type="button" :disabled="!selectedCount" @click="openBulkDelete">批次刪除</button>
      <button class="btn danger" type="button" :disabled="!entries.length" @click="openClearAll">清空</button>
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
const bulkModalOpen = ref(false)
const clearModalOpen = ref(false)
const clearInput = ref('')
const showClearError = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const sortKey = ref<'date' | 'amount'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortedEntries = computed(() => {
  const list = [...entries.value]
  return list.sort((a, b) => {
    if (sortKey.value === 'date') {
      const aDate = new Date(a.date).getTime()
      const bDate = new Date(b.date).getTime()
      return sortOrder.value === 'desc' ? bDate - aDate : aDate - bDate
    }
    return sortOrder.value === 'desc' ? b.amount - a.amount : a.amount - b.amount
  })
})

const sortLabel = computed(() => {
  const label = sortKey.value === 'date' ? '日期' : '金額'
  const arrow = sortOrder.value === 'desc' ? '↓' : '↑'
  return `${label}${arrow}`
})

const selectedCount = computed(() => selectedIds.value.size)
const allSelected = computed(() => entries.value.length > 0 && selectedIds.value.size === entries.value.length)

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

const adjustAmount = (delta: number) => {
  const next = (editForm.amount || 0) + delta
  editForm.amount = Math.max(0, Math.round(next))
}

const setToday = () => {
  editForm.date = toISODate(new Date())
}

const setYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  editForm.date = toISODate(d)
}

const toggleSelect = (id: string) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

const isSelected = (id: string) => selectedIds.value.has(id)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(entries.value.map(e => e.id))
  }
}

watch(entries, (list) => {
  const ids = new Set(list.map(e => e.id))
  const next = new Set<string>()
  selectedIds.value.forEach((id) => {
    if (ids.has(id)) next.add(id)
  })
  selectedIds.value = next
})

const toggleSort = (key: 'date' | 'amount') => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const cycleSort = () => {
  if (sortKey.value === 'date') {
    toggleSort('amount')
  } else {
    toggleSort('date')
  }
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
  selectedIds.value.delete(deleteTargetId.value)
  deleteTargetId.value = null
}

const openBulkDelete = () => {
  if (!selectedCount.value) return
  bulkModalOpen.value = true
}

const closeBulkDelete = () => {
  bulkModalOpen.value = false
}

const confirmBulkDelete = async () => {
  const targets = Array.from(selectedIds.value)
  for (const id of targets) {
    await deleteEntry(id)
  }
  selectedIds.value = new Set()
  bulkModalOpen.value = false
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
