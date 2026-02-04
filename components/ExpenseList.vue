<template>
  <section class="panel">
    <div class="panel-header">
      <div class="panel-title-group">
        <h2>{{ listTitle }}</h2>
        <span v-if="selectedCount" class="pill">已選 {{ selectedCount }} 筆</span>
      </div>
      <div class="panel-actions">
        <button v-if="selectedCount" @click="openBulkDelete" class="icon-btn danger" type="button" title="刪除選取項目">
          <IconTrash />
        </button>
      </div>
    </div>
    
    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再查看/管理紀錄</p>
    </div>

    <div v-else-if="!entries.length" class="empty-state">目前沒有紀錄，先新增一筆吧！</div>
    
    <div v-else class="expense-list-container">
      <!-- Table Header -->
      <div class="expense-list-header">
        <div class="header-cell checkbox-cell">
          <label class="custom-checkbox">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" :disabled="!entries.length">
            <span class="checkmark"></span>
          </label>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('date')" type="button" class="sort-btn">
            <span>日期</span>
            <span class="sort-icon">{{ getSortArrow('date') }}</span>
          </button>
        </div>
        <div class="header-cell text-right">
          <button @click="toggleSort('amount')" type="button" class="sort-btn right">
            <span>金額</span>
            <span class="sort-icon">{{ getSortArrow('amount') }}</span>
          </button>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('sub_type')" type="button" class="sort-btn">
            <span>類型</span>
            <span class="sort-icon">{{ getSortArrow('sub_type') }}</span>
          </button>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('account_id')" type="button" class="sort-btn">
            <span>帳戶</span>
            <span class="sort-icon">{{ getSortArrow('account_id') }}</span>
          </button>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('note')" type="button" class="sort-btn">
            <span>備註</span>
            <span class="sort-icon">{{ getSortArrow('note') }}</span>
          </button>
        </div>
        <div class="header-cell text-center">動作</div>
      </div>

      <div class="expense-list">
        <article 
          v-for="entry in sortedEntries" 
          :key="entry.id" 
          class="entry-card"
          :class="{ 'selected': isSelected(entry.id) }"
        >
            <!-- 1. Checkbox -->
            <div class="cell checkbox-cell">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="isSelected(entry.id)" @change="toggleSelect(entry.id)">
                <span class="checkmark"></span>
              </label>
            </div>

            <!-- Mobile Compact Row -->
            <div class="cell compact-main" :title="entry.note">
              <span class="compact-date">{{ formatDate(entry.date) }}</span>
              <span class="type-badge compact-type" :class="entry.sub_type === 'zibao' ? 'type-zibao' : 'type-general'">
                {{ entry.sub_type === 'zibao' ? '孜保' : '一般' }}
              </span>
              <span v-if="showAccount" class="compact-account">{{ accountLabel(entry.account_id) }}</span>
              <span class="compact-note">{{ entry.note || '—' }}</span>
            </div>

            <!-- 2. Date -->
            <div class="cell date-cell">
              <span class="entry-date">{{ formatDate(entry.date) }}</span>
            </div>

            <!-- 3. Amount -->
            <div class="cell amount-cell text-right">
              <span class="entry-amount" :class="entry.amount < 0 ? 'text-success' : ''">
                {{ formatCurrency(Math.abs(entry.amount)) }}
              </span>
              <span v-if="entry.amount < 0" class="badge-income">收</span>
            </div>

            <!-- 4. Type -->
            <div class="cell type-cell">
              <span class="type-badge" :class="entry.sub_type === 'zibao' ? 'type-zibao' : 'type-general'">
                {{ entry.sub_type === 'zibao' ? '孜保' : '一般' }}
              </span>
            </div>
            
            <!-- 5. Account -->
            <div class="cell account-cell">
              {{ showAccount ? accountLabel(entry.account_id) : '' }}
            </div>
            
            <!-- 6. Note -->
            <div class="cell note-cell" :title="entry.note">
              {{ entry.note }}
            </div>
            
            <!-- 7. Actions -->
            <div class="cell actions-cell text-center">
              <button class="icon-btn" @click="startEdit(entry)" type="button" title="編輯">
                <IconEdit />
              </button>
            </div>
        </article>
      </div>
    </div>

    <!-- Modals kept same structure, just restyling -->
    <div v-if="bulkModalOpen" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3>刪除紀錄</h3>
        <p>確定要刪除選取的 {{ selectedCount }} 筆紀錄嗎？此操作無法復原。</p>
        <div class="modal-actions">
          <button class="btn primary" @click="confirmBulkDelete" type="button">是，刪除</button>
          <button class="btn" @click="closeBulkDelete" type="button">否，取消</button>
        </div>
      </div>
    </div>

    <div v-if="editingId" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card edit-modal">
        <h3>編輯紀錄</h3>
        <div class="edit-form-layout">
          <!-- Form layout kept similar but can be refined via global css -->
          <div class="edit-group type-group">
            <div class="type-toggle">
              <button 
                type="button" 
                :class="['btn btn-sm', editForm.type === 'expense' ? 'danger' : 'outline']"
                @click="editForm.type = 'expense'"
              >
                支出
              </button>
              <button 
                type="button" 
                :class="['btn btn-sm', editForm.type === 'income' ? 'success' : 'outline']"
                @click="editForm.type = 'income'"
              >
                收入
              </button>
            </div>
          </div>

          <div class="edit-group date-group">
            <label class="input-label">
              <span>日期</span>
              <input type="date" v-model="editForm.date">
            </label>
            <div class="quick-tags">
              <button class="tag-btn" type="button" @click="setToday">今天</button>
              <button class="tag-btn" type="button" @click="setYesterday">昨天</button>
            </div>
          </div>

          <div class="edit-group amount-group">
            <label class="input-label">
              <span>金額</span>
              <input type="number" v-model.number="editForm.amount" min="0" step="1">
            </label>
            <div class="quick-tags scrollable">
              <button class="tag-btn" type="button" @click="adjustAmount(10)">+10</button>
              <button class="tag-btn" type="button" @click="adjustAmount(50)">+50</button>
              <button class="tag-btn" type="button" @click="adjustAmount(100)">+100</button>
            </div>
          </div>

          <div class="edit-group detail-group">
            <label v-if="showAccount" class="input-label">
              <span>帳戶</span>
              <select v-model="editForm.account_id">
                <option value="">未指定</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
            </label>
            
            <label class="input-label" v-if="editForm.type === 'expense'">
              <span>類型</span>
              <select v-model="editForm.sub_type">
                <option value="general">一般</option>
                <option value="zibao">孜保平分</option>
              </select>
            </label>

            <label class="input-label flex-grow">
              <span>備註</span>
              <input type="text" v-model="editForm.note" placeholder="備註...">
            </label>
          </div>

          <div class="edit-actions">
            <button :class="['btn', editForm.type === 'income' ? 'success' : 'primary']" @click="saveEdit" type="button">儲存</button>
            <button class="btn" @click="cancelEdit" type="button">取消</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ExpenseEntry } from '~/composables/useExpenses'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconTrash from '~/components/icons/IconTrash.vue'

const { user } = useAuth()
const { accounts } = useAccounts()
const expenses = useTotalExpenses()
const { entries, deleteEntry, updateEntry } = expenses

const showAccount = computed(() => true)
const listTitle = computed(() => '消費紀錄列表')

const editingId = ref<string | null>(null)
const editForm = reactive({
  date: '',
  amount: 0 as number,
  note: '',
  account_id: '' as string,
  type: 'expense' as 'expense' | 'income',
  sub_type: 'general'
})
const bulkModalOpen = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const sortKey = ref<'date' | 'amount' | 'account_id' | 'note' | 'sub_type'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortedEntries = computed(() => {
  const list = [...entries.value]
  return list.sort((a, b) => {
    const asc = sortOrder.value === 'asc'
    if (sortKey.value === 'date') {
      const aDate = new Date(a.date).getTime()
      const bDate = new Date(b.date).getTime()
      return asc ? aDate - bDate : bDate - aDate
    }
    if (sortKey.value === 'amount') {
      return asc ? a.amount - b.amount : b.amount - a.amount
    }
    if (sortKey.value === 'account_id') {
      const aName = accountLabel(a.account_id)
      const bName = accountLabel(b.account_id)
      return asc ? aName.localeCompare(bName) : bName.localeCompare(aName)
    }
    if (sortKey.value === 'note') {
      const aNote = a.note || ''
      const bNote = b.note || ''
      return asc ? aNote.localeCompare(bNote) : bNote.localeCompare(aNote)
    }
    if (sortKey.value === 'sub_type') {
      const aType = a.sub_type || ''
      const bType = b.sub_type || ''
      return asc ? aType.localeCompare(bType) : bType.localeCompare(aType)
    }
    return 0
  })
})

const getSortArrow = (key: string) => {
  if (sortKey.value !== key) return ''
  return sortOrder.value === 'desc' ? '↓' : '↑'
}

const selectedCount = computed(() => selectedIds.value.size)
const allSelected = computed(() => entries.value.length > 0 && selectedIds.value.size === entries.value.length)

const startEdit = (entry: ExpenseEntry) => {
  editingId.value = entry.id
  editForm.date = entry.date
  editForm.amount = Math.abs(entry.amount)
  editForm.note = entry.note ?? ''
  editForm.account_id = entry.account_id ?? ''
  editForm.type = entry.amount < 0 ? 'income' : 'expense'
  editForm.sub_type = entry.sub_type ?? 'general'
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
  const finalAmount = editForm.type === 'income' ? -Math.abs(editForm.amount) : Math.abs(editForm.amount)

  await updateEntry({
    ...target,
    date: editForm.date,
    amount: Math.round(finalAmount),
    note: editForm.note ?? '',
    account_id: editForm.account_id || null,
    sub_type: editForm.sub_type
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

const toggleSort = (key: 'date' | 'amount' | 'account_id' | 'note' | 'sub_type') => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
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

const accountLabel = (accountId?: string | null) => {
  if (!accountId) return '未指定'
  const found = accounts.value.find(account => account.id === accountId)
  return found ? found.name : '未指定'
}
</script>

<style scoped>
.text-success { color: var(--success); }
.text-right { text-align: right; }
.text-center { text-align: center; }

.badge-income {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--success-bg);
  color: var(--success);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  vertical-align: middle;
  font-family: var(--font-pixel);
}

/* Type Badge */
.type-badge {
  font-family: var(--font-pixel);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  letter-spacing: 0.05em;
  display: inline-block;
}
.type-general {
  color: var(--ink-light);
  background: #f3f4f6;
}
.type-zibao {
  color: var(--primary);
  background: var(--primary-light);
  border: 1px solid rgba(79, 70, 229, 0.1);
}

/* Custom Checkbox */
.custom-checkbox {
  display: block;
  position: relative;
  padding-left: 20px;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
}
.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #eee;
  border-radius: 4px; /* Squircle */
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.custom-checkbox:hover input ~ .checkmark {
  background-color: #ccc;
}
.custom-checkbox input:checked ~ .checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}
.custom-checkbox .checkmark:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

@media (max-width: 768px) {
  .custom-checkbox {
    padding-left: 22px;
  }
  .checkmark {
    width: 20px;
    height: 20px;
  }
  .custom-checkbox .checkmark:after {
    left: 7px;
    top: 3px;
  }
}

/* Panel Layout */
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}
.panel-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.panel-title-group h2 {
  font-size: 18px;
  margin: 0;
}
.pill {
  background: var(--ink);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  font-family: var(--font-pixel);
}

/* Auth Gate */
.auth-gate {
  text-align: center;
  padding: 40px;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--ink-light);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-light);
  font-style: italic;
  font-family: var(--font-pixel);
  opacity: 0.6;
}

/* =========================================
   Layout: Desktop Grid (Refined)
   ========================================= */

/* Mobile First (Default) - Card Stack */
.expense-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-list-header {
  display: none; /* Hide header on mobile */
}

.entry-card {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto 36px;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.cell { min-width: 0; }
.checkbox-cell { align-self: center; }
.amount-cell { justify-self: end; white-space: nowrap; }
.actions-cell { justify-self: end; }

.compact-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
}

.compact-date {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--ink-light);
  flex: none;
}

.compact-type {
  font-size: 10px;
  padding: 2px 6px;
  flex: none;
}

.compact-account {
  font-size: 11px;
  color: var(--ink-light);
  background: #f3f4f6;
  border-radius: 4px;
  padding: 2px 6px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: none;
}

.compact-note {
  font-size: 13px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.compact-main .type-badge {
  letter-spacing: 0.04em;
}

.date-cell,
.type-cell,
.account-cell,
.note-cell {
  display: none;
}

.amount-cell .entry-amount {
  font-family: var(--font-pixel);
  font-weight: 600;
}

@media (max-width: 480px) {
  .entry-card {
    grid-template-columns: 20px minmax(0, 1fr) auto 32px;
    padding: 12px;
  }
}

/* Desktop Table View */
@media (min-width: 768px) {
  .expense-list-container {
    gap: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: white;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .expense-list-header, 
  .entry-card {
    display: grid;
    /* Grid Definition: Checkbox | Date | Amount | Type | Account | Note | Actions */
    grid-template-columns: 48px 110px 100px 90px 120px 1fr 60px;
    align-items: center;
    padding: 0 16px;
  }

  .compact-main {
    display: none;
  }

  .date-cell,
  .type-cell,
  .account-cell,
  .note-cell {
    display: block;
  }

  /* Header Styles */
  .expense-list-header {
    height: 48px; /* Slightly taller for breathing room */
    background: #f9fafb;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-light);
    font-family: var(--font-sans); /* Use sans for headers for clean look */
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .sort-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    padding: 0;
    font-weight: inherit;
  }
  
  .sort-btn.right { margin-left: auto; }
  .sort-btn:hover { color: var(--ink); }

  /* Row Styles */
  .entry-card {
    height: 52px; /* Fixed height for dense linear look */
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    margin: 0;
    box-shadow: none;
    background: white;
    transition: background 0.1s;
    font-size: 14px;
    color: var(--ink);
  }
  
  .entry-card:last-child {
    border-bottom: none;
  }

  .entry-card:hover {
    background: #f9fafb;
  }
  
  /* Selection State */
  .entry-card.selected {
    background: rgba(79, 70, 229, 0.04);
  }

  /* Typography tweaks */
  .entry-amount {
    font-family: var(--font-pixel); 
    font-weight: 600; /* Regular bold */
    letter-spacing: 0.02em;
  }
  
  .entry-date {
    color: var(--ink-light);
    font-family: var(--font-pixel);
    font-size: 13px;
  }
  
  .entry-note {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 16px;
    color: var(--ink-light);
  }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.modal-card h3 {
  font-size: 18px;
  text-align: center;
}
.modal-actions {
  display: flex;
  gap: 12px;
}
.modal-actions button { flex: 1; }

.edit-modal { max-width: 480px; }
.edit-form-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.input-label input, .input-label select {
  height: 38px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  font-family: var(--font-sans);
}
.input-label input:focus, .input-label select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.type-toggle {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}
.btn-sm {
  flex: 1;
  font-size: 12px;
  height: 32px;
  border: none;
}
.btn-sm.outline {
  background: transparent;
  box-shadow: none;
  color: var(--ink-light);
}
.btn-sm.danger {
  background: white;
  color: var(--danger);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.btn-sm.success {
  background: white;
  color: var(--success);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.quick-tags {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.tag-btn {
  border: 1px solid var(--border);
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.1s;
}
.tag-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Icon Buttons */
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: var(--ink-light);
  display: inline-flex;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--ink);
}
.icon-btn svg { width: 18px; height: 18px; }
.icon-btn.danger:hover { color: var(--danger); background: #fef2f2; }

@media (max-width: 768px) {
  .icon-btn {
    width: 34px;
    height: 34px;
  }
  .icon-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>
