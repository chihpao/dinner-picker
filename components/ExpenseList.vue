<template>
  <section class="panel">
    <div class="panel-header">
      <div class="panel-title-group">
        <h2>{{ listTitle }}</h2>
        <span v-if="selectedCount" class="pill">已選 {{ selectedCount }} 筆</span>
      </div>
      <div class="panel-actions">
        <button v-if="selectedCount" @click="openBulkDelete" class="btn danger btn-sm" type="button">刪除</button>
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
          <label class="checkbox-pill">
            <input class="checkbox-square" type="checkbox" :checked="allSelected" @change="toggleSelectAll" :disabled="!entries.length">
          </label>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('date')" type="button" class="sort-btn">
            <span>日期</span>
            <span class="sort-icon">{{ getSortArrow('date') }}</span>
          </button>
        </div>
        <div class="header-cell">
          <button @click="toggleSort('amount')" type="button" class="sort-btn">
            <span>金額</span>
            <span class="sort-icon">{{ getSortArrow('amount') }}</span>
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
        <div class="header-cell">動作</div>
      </div>

      <div class="expense-list">
        <article 
          v-for="entry in sortedEntries" 
          :key="entry.id" 
          class="entry-card"
        >
            <!-- Data Row: Must match Grid Columns: [Checkbox] [Date] [Amount] [Account] [Note] [Actions] -->
            
            <!-- 1. Checkbox -->
            <label class="checkbox-pill">
              <input class="checkbox-square" type="checkbox" :checked="isSelected(entry.id)" @change="toggleSelect(entry.id)">
            </label>
            
            <!-- 2. Date -->
            <p class="entry-date">{{ formatDate(entry.date) }}</p>

            <!-- 3. Amount -->
            <p class="entry-amount">{{ formatCurrency(entry.amount) }}</p>
            
            <!-- 4. Account -->
            <p class="entry-account">{{ showAccount ? accountLabel(entry.account_id) : '' }}</p>
            
            <!-- 5. Note -->
            <p class="entry-note" :title="entry.note">{{ entry.note }}</p>
            
            <!-- 6. Actions -->
            <div class="entry-actions">
              <button class="btn btn-sm" @click="startEdit(entry)" type="button">編輯</button>
            </div>
        </article>
      </div>
    </div>

    <!-- Bulk delete confirmation modal -->
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

    <!-- Edit Modal -->
    <div v-if="editingId" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card edit-modal">
        <h3>編輯紀錄</h3>
        <div class="edit-form-layout">
          <!-- Row 1: Date & Quick Actions -->
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

          <!-- Row 2: Amount & Quick Actions -->
          <div class="edit-group amount-group">
            <label class="input-label">
              <span>金額</span>
              <input type="number" v-model.number="editForm.amount" min="0" step="1">
            </label>
            <div class="quick-tags scrollable">
              <button class="tag-btn" type="button" @click="adjustAmount(10)">+10</button>
              <button class="tag-btn" type="button" @click="adjustAmount(50)">+50</button>
              <button class="tag-btn" type="button" @click="adjustAmount(100)">+100</button>
              <button class="tag-btn" type="button" @click="adjustAmount(-10)">-10</button>
            </div>
          </div>

          <!-- Row 3: Account & Note -->
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
            <label class="input-label flex-grow">
              <span>備註</span>
              <input type="text" v-model="editForm.note" placeholder="備註...">
            </label>
          </div>

          <!-- Row 4: Actions -->
          <div class="edit-actions">
            <button class="btn primary" @click="saveEdit" type="button">儲存</button>
            <button class="btn" @click="cancelEdit" type="button">取消</button>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import type { ExpenseEntry } from '~/composables/useExpenses'

const props = withDefaults(defineProps<{
  ledger?: 'food' | 'total'
}>(), {
  ledger: 'food'
})

const { user } = useAuth()
const { accounts } = useAccounts()
const expenses = props.ledger === 'food' ? useFoodExpenses() : useTotalExpenses()
const { entries, deleteEntry, updateEntry } = expenses

const showAccount = computed(() => true)
const listTitle = computed(() => props.ledger === 'food' ? '食物紀錄列表' : '消費紀錄列表')
const addLabel = computed(() => props.ledger === 'food' ? '孜保飲食' : '一般記帳')
const entryPath = computed(() => props.ledger === 'food' ? '/expense-entry?from=/expenses' : '/total/entry?from=/total')

const editingId = ref<string | null>(null)
const editForm = reactive({
  date: '',
  amount: 0 as number,
  note: '',
  account_id: '' as string
})
const bulkModalOpen = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const sortKey = ref<'date' | 'amount' | 'account_id' | 'note'>('date')
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
    return 0
  })
})

const getSortArrow = (key: string) => {
  if (sortKey.value !== key) return ''
  return sortOrder.value === 'desc' ? '↓' : '↑'
}

const sortLabel = computed(() => {
  let label = ''
  if (sortKey.value === 'date') label = '日期'
  else if (sortKey.value === 'amount') label = '金額'
  else if (sortKey.value === 'account_id') label = '帳戶'
  else if (sortKey.value === 'note') label = '備註'
  
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
  editForm.account_id = entry.account_id ?? ''
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
    note: editForm.note ?? '',
    account_id: editForm.account_id || null
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

const toggleSort = (key: 'date' | 'amount' | 'account_id' | 'note') => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const cycleSort = () => {
  if (sortKey.value === 'date') toggleSort('amount')
  else if (sortKey.value === 'amount') toggleSort('account_id')
  else if (sortKey.value === 'account_id') toggleSort('note')
  else toggleSort('date')
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

const accountKindLabel = (kind: string) => {
  if (kind === 'cash') return '現金'
  if (kind === 'card') return '信用卡'
  return '銀行'
}

const accountLabel = (accountId?: string | null) => {
  if (!accountId) return '未指定帳戶'
  const found = accounts.value.find(account => account.id === accountId)
  return found ? found.name : '未指定帳戶'
}
</script>
