<template>
  <section class="panel">
    <div class="panel-header">
      <div class="panel-title-group">
        <h2>{{ listTitle }}</h2>
        <span v-if="selectedCount" class="pill">已選 {{ selectedCount }} 筆</span>
      </div>
      <div class="panel-actions">
        <button class="btn btn-sm primary settle-btn" @click="openSettleModal" type="button" title="孜保結算">
          💰
        </button>
        <button v-if="selectedCount" @click="openBulkDelete" class="icon-btn danger" type="button" title="刪除選取項目">
          <IconTrash />
        </button>
      </div>
    </div>

    <div v-if="user && entries.length" class="list-toolbar">
      <label class="search-box">
        <input v-model.trim="searchQuery" type="text" placeholder="搜尋備註、帳戶、日期">
      </label>
      <select v-model="filterType" class="filter-select">
        <option value="all">全部</option>
        <option value="expense">支出</option>
        <option value="income">收入</option>
        <option value="zibao">孜保</option>
        <option value="transfer">轉帳</option>
      </select>
      <select v-model="filterCategory" class="filter-select filter-category">
        <option value="all">全部類別</option>
        <option v-for="cat in EXPENSE_CATEGORIES" :key="cat.value" :value="cat.value">
          {{ cat.label }}
        </option>
      </select>
      <div class="filter-dates" v-if="hasActiveFilters || startDate || endDate">
        <input v-model="startDate" type="date" class="filter-select date-input" placeholder="開始">
        <span class="date-sep">~</span>
        <input v-model="endDate" type="date" class="filter-select date-input" placeholder="結束">
        <button v-if="hasActiveFilters" @click="resetFilters" class="btn btn-sm reset-btn" title="清除篩選">
          <IconX class="w-3 h-3" />
        </button>
      </div>
      <span class="result-count">顯示 {{ sortedEntries.length }} / {{ entries.length }}</span>
    </div>
    
    <AppEmptyState 
      v-if="!user" 
      title="需要登入" 
      message="請先登入再查看/管理您的記帳紀錄。"
    >
      <template #icon>
        <IconTarget style="width: 64px; height: 64px; color: var(--border)" />
      </template>
    </AppEmptyState>

    <AppEmptyState 
      v-else-if="!accounts.length" 
      title="還沒開戶？" 
      message="設定帳戶可以讓你更清楚錢都花在哪個錢包或銀行。"
    >
      <template #icon>
        <IconBank style="width: 64px; height: 64px; color: var(--border)" />
      </template>
      <NuxtLink to="/total/add-account" class="btn primary">
        前往新增帳戶
      </NuxtLink>
    </AppEmptyState>

    <AppEmptyState 
      v-else-if="!entries.length" 
      title="口袋空空" 
      message="目前還沒有任何消費紀錄，趕快去記一筆吧！"
    >
      <NuxtLink to="/total/entry" class="btn primary">
        開始記帳
      </NuxtLink>
    </AppEmptyState>
    
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
          <button @click="toggleSort('category')" type="button" class="sort-btn">
            <span>類別</span>
            <span class="sort-icon">{{ getSortArrow('category') }}</span>
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
              <span class="type-badge compact-type" :class="typeClass(entry)">
                {{ typeLabel(entry) }}
              </span>
              <span v-if="entry.category" class="category-badge compact-category">
                {{ categoryLabel(entry.category) }}
              </span>
              <span 
                class="compact-note" 
                :class="{ 'is-expanded': isExpanded(entry.id) }"
                @click.stop="toggleExpand(entry.id)"
              >
                {{ entry.note || '—' }}
              </span>
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
              <span class="type-badge" :class="typeClass(entry)">
                {{ typeLabel(entry) }}
              </span>
            </div>

            <!-- 4.5 Category -->
            <div class="cell category-cell">
              <span v-if="entry.category" class="category-badge">
                {{ categoryLabel(entry.category) }}
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

    <!-- Settle Zibao Modal -->
    <div v-if="zibaoSettleModalOpen" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3>💰 孜保結算</h3>
        <p style="font-size: 13px; color: var(--ink-light); margin-bottom: 16px;">
          系統會自動將範圍內「未結算」的孜保支出除以2，並轉為一般支出。
        </p>
        
        <div class="edit-group date-group" style="margin-bottom: 16px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="date" v-model="settleStartDate" class="input" style="flex: 1; height: 36px; padding: 0 8px;">
            <span style="color: var(--ink-light);">~</span>
            <input type="date" v-model="settleEndDate" class="input" style="flex: 1; height: 36px; padding: 0 8px;">
          </div>
        </div>

        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px dashed var(--border);">
          <template v-if="unsettledZibaoEntries.length > 0">
            <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600;">預覽結果：</p>
            <p style="margin: 0; font-size: 13px; color: var(--ink-light); line-height: 1.6;">
              找到 <strong>{{ unsettledZibaoEntries.length }}</strong> 筆未結算支出，原始總額 <strong style="color: var(--danger); font-family: var(--font-pixel);">{{ formatCurrency(settleTotalOriginal) }}</strong>。<br>
              結算後將轉為您個人的支出，總額 <strong style="color: var(--success); font-family: var(--font-pixel);">{{ formatCurrency(settleTotalNew) }}</strong>。
            </p>
          </template>
          <p v-else style="margin: 0; color: var(--ink-light); text-align: center; font-size: 13px;">
            此期間沒有需要結算的孜保支出
          </p>
        </div>

        <div class="modal-actions">
          <button class="btn primary" @click="confirmZibaoSettlement" type="button" :disabled="unsettledZibaoEntries.length === 0 || isSettling">
            {{ isSettling ? '結算中...' : '確認結算' }}
          </button>
          <button class="btn" @click="closeSettleModal" type="button" :disabled="isSettling">取消</button>
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
            
            <label class="input-label" v-if="editForm.type === 'expense' && !isEditingTransfer">
              <span>類型</span>
              <select v-model="editForm.sub_type">
                <option value="general">一般</option>
                <option value="zibao">孜保平分</option>
              </select>
            </label>
            <label class="input-label" v-else-if="isEditingTransfer">
              <span>類型</span>
              <input type="text" value="轉帳" readonly>
            </label>

            <label class="input-label" v-if="editForm.type === 'expense' && !isEditingTransfer">
              <span>類別</span>
              <select v-model="editForm.category">
                <option value="">未指定</option>
                <option v-for="cat in EXPENSE_CATEGORIES" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
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
import { EXPENSE_CATEGORIES } from '~/composables/useExpenses'
import IconEdit from '~/components/icons/IconEdit.vue'
import IconTrash from '~/components/icons/IconTrash.vue'
import IconX from '~/components/icons/IconX.vue'
import IconBank from '~/components/icons/IconBank.vue'
import IconTarget from '~/components/icons/IconTarget.vue'
import { useExpenseFilters } from '~/composables/useExpenseFilters'
import { useToast } from '~/composables/useToast'

const { user } = useAuth()
const { accounts } = useAccounts()
const expenses = useTotalExpenses()
const { success, danger } = useToast()
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
  sub_type: 'general',
  category: '' as string,
})
const bulkModalOpen = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const sortKey = ref<'date' | 'amount' | 'account_id' | 'note' | 'sub_type' | 'category'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const {
  searchQuery,
  filterType,
  filterCategory,
  startDate,
  endDate,
  resetFilters,
  hasActiveFilters
} = useExpenseFilters()

const isTransferEntry = (entry: ExpenseEntry) => {
  if (entry.sub_type === 'transfer') return true
  return Boolean(entry.note && entry.note.includes('[轉帳]'))
}

const typeClass = (entry: ExpenseEntry) => {
  if (isTransferEntry(entry)) return 'type-transfer'
  return entry.sub_type === 'zibao' ? 'type-zibao' : 'type-general'
}

const typeLabel = (entry: ExpenseEntry) => {
  if (isTransferEntry(entry)) return '轉帳'
  return entry.sub_type === 'zibao' ? '孜保' : '一般'
}

const categoryLabel = (category?: string | null) => {
  if (!category) return ''
  const found = EXPENSE_CATEGORIES.find(c => c.value === category)
  return found ? found.label : category
}

const isEditingTransfer = computed(() => {
  if (!editingId.value) return false
  const target = entries.value.find(e => e.id === editingId.value)
  return target ? isTransferEntry(target) : false
})

const filteredEntries = computed(() => {
  let list = [...entries.value]

  if (filterType.value !== 'all') {
    list = list.filter((entry) => {
      if (filterType.value === 'transfer') return isTransferEntry(entry)
      if (filterType.value === 'zibao') return entry.sub_type === 'zibao' && !isTransferEntry(entry)
      if (filterType.value === 'income') return entry.amount < 0 && !isTransferEntry(entry)
      if (filterType.value === 'expense') return entry.amount >= 0 && !isTransferEntry(entry)
      return true
    })
  }

  if (filterCategory.value !== 'all') {
    list = list.filter((entry) => (entry.category ?? '') === filterCategory.value)
  }

  if (startDate.value) {
    list = list.filter((entry) => entry.date >= startDate.value)
  }
  if (endDate.value) {
    list = list.filter((entry) => entry.date <= endDate.value)
  }

  const keyword = searchQuery.value.toLowerCase()
  if (!keyword) return list

  return list.filter((entry) => {
    const account = accountLabel(entry.account_id).toLowerCase()
    const date = formatDate(entry.date).toLowerCase()
    const note = (entry.note || '').toLowerCase()
    return account.includes(keyword) || date.includes(keyword) || note.includes(keyword)
  })
})

const sortedEntries = computed(() => {
  const list = [...filteredEntries.value]
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
    if (sortKey.value === 'category') {
      const aCat = a.category || ''
      const bCat = b.category || ''
      return asc ? aCat.localeCompare(bCat) : bCat.localeCompare(aCat)
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
  editForm.sub_type = isTransferEntry(entry) ? 'transfer' : (entry.sub_type ?? 'general')
  editForm.category = entry.category ?? ''
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
    danger('請選擇日期')
    return
  }
  const finalAmount = editForm.type === 'income' ? -Math.abs(editForm.amount) : Math.abs(editForm.amount)
  const nextSubType = isTransferEntry(target) ? 'transfer' : editForm.sub_type

  await updateEntry({
    ...target,
    date: editForm.date,
    amount: Math.round(finalAmount),
    note: editForm.note ?? '',
    account_id: editForm.account_id || null,
    sub_type: nextSubType,
    category: editForm.type === 'expense' ? (editForm.category || null) : null,
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

const toggleSort = (key: 'date' | 'amount' | 'account_id' | 'note' | 'sub_type' | 'category') => {
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
  vibrate([40, 30, 40])
  success(`成功刪除 ${targets.length} 筆紀錄`)
  selectedIds.value = new Set()
  bulkModalOpen.value = false
}

const accountLabel = (accountId?: string | null) => {
  if (!accountId) return '未指定'
  const found = accounts.value.find(account => account.id === accountId)
  return found ? found.name : '未指定'
}

/* --- Zibao Settlement Logic --- */
const zibaoSettleModalOpen = ref(false)
const settleStartDate = ref('')
const settleEndDate = ref('')
const isSettling = ref(false)

const openSettleModal = () => {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  
  settleStartDate.value = toISODate(weekStart)
  settleEndDate.value = toISODate(weekEnd)
  zibaoSettleModalOpen.value = true
}

const closeSettleModal = () => {
  if (isSettling.value) return
  zibaoSettleModalOpen.value = false
}

const unsettledZibaoEntries = computed(() => {
  if (!settleStartDate.value || !settleEndDate.value) return []
  return entries.value.filter(e => {
    return e.date >= settleStartDate.value && 
           e.date <= settleEndDate.value && 
           e.sub_type === 'zibao' && 
           e.amount > 0 &&
           !(e.note && e.note.includes('[已結算]')) &&
           !isTransferEntry(e)
  })
})

const settleTotalOriginal = computed(() => {
  return unsettledZibaoEntries.value.reduce((sum, e) => sum + e.amount, 0)
})

const settleTotalNew = computed(() => {
  return unsettledZibaoEntries.value.reduce((sum, e) => sum + Math.round(e.amount / 2), 0)
})

const confirmZibaoSettlement = async () => {
  const targets = [...unsettledZibaoEntries.value]
  if (targets.length === 0) return
  
  isSettling.value = true
  try {
    for (const entry of targets) {
      const newAmount = Math.round(entry.amount / 2)
      const settledTag = `[已結算，原價: $${entry.amount}]`
      const newNote = entry.note ? `${entry.note} ${settledTag}` : settledTag
      
      await updateEntry({
        ...entry,
        amount: newAmount,
        sub_type: 'general',
        note: newNote
      })
    }
    zibaoSettleModalOpen.value = false
    vibrate([20, 10, 20])
    success(`成功結算 ${targets.length} 筆孜保支出`)
  } catch (err) {
    danger(`結算發生錯誤：${(err as Error).message}`)
  } finally {
    isSettling.value = false
  }
}
/* --- Note Expansion (Mobile) --- */
const expandedEntries = ref(new Set<string>())
const isExpanded = (id: string) => expandedEntries.value.has(id)
const toggleExpand = (id: string) => {
  if (expandedEntries.value.has(id)) {
    expandedEntries.value.delete(id)
  } else {
    expandedEntries.value.add(id)
    vibrate(10)
  }
}

defineExpose({
  openBulkDelete,
  openSettleModal
})
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
.type-transfer {
  color: #0369a1;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
}

/* Category Badge */
.category-badge {
  font-family: var(--font-pixel);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  display: inline-block;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.compact-category {
  flex: none;
}

/* Custom Checkbox */
.custom-checkbox {
  display: block;
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;
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
  margin-top: 16px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}

.settle-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 10px;
  margin-right: 8px;
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

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 0 8px;
}

.search-box {
  flex: 2 1 200px;
}

.filter-select {
  flex: 1 1 100px;
}

.search-box {
  min-width: 0;
}

.search-box input,
.filter-select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  color: var(--ink);
  min-width: 0;
}

.search-box input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
}

.result-count {
  grid-column: 1 / -1;
  color: var(--ink-light);
  font-size: 12px;
  padding-left: 2px;
}

/* Date Filters */
.filter-dates {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 10px;
  border: 1px dashed var(--border);
}

.date-input {
  flex: 1;
  height: 34px !important;
  font-family: var(--font-pixel);
  font-size: 12px;
}

.date-sep {
  color: var(--ink-light);
  font-family: var(--font-pixel);
}

.reset-btn {
  height: 34px;
  width: 34px;
  padding: 0;
  border-radius: 8px;
  flex: none;
  background: white;
  border: 1px solid var(--border);
  color: var(--ink-light);
}

.reset-btn:hover {
  background: #fee2e2;
  color: var(--danger);
  border-color: #fecaca;
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
  grid-template-columns: 24px minmax(0, 1fr) minmax(min-content, auto) 36px;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.entry-card:active {
  border-color: rgba(79, 70, 229, 0.35);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.08);
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
}

.compact-date {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--ink-light);
  flex: none;
}

.compact-type {
  font-size: 10px;
  padding: 3px 6px;
  flex: none;
}

.compact-account {
  font-size: 10px;
  color: var(--ink-light);
  background: #f3f4f6;
  border-radius: 4px;
  padding: 3px 6px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: none;
}

.compact-note {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.compact-note.is-expanded {
  white-space: normal;
  overflow: visible;
  word-break: break-all;
}

.compact-main .type-badge {
  letter-spacing: 0.04em;
}

.checkbox-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hide desktop-only cells on mobile/tablet by default */
.date-cell,
.type-cell,
.category-cell,
.account-cell,
.note-cell {
  display: none;
}

.compact-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.amount-cell .entry-amount {
  font-family: var(--font-pixel);
  font-weight: 600;
  font-size: 15px;
}

@media (max-width: 480px) {
  .list-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
  }
  .search-box { flex: 1; min-width: 140px; }
  .filter-select { flex: 1; min-width: 80px; }

  .search-box input,
  .filter-select {
    height: 38px;
    font-size: 12px;
    padding: 0 10px;
  }

  .result-count {
    font-size: 11px;
  }

  .entry-card {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto 40px;
    padding: 10px 12px;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid var(--border);
    width: 100%;
    overflow: hidden;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
  }

  .compact-main {
    gap: 6px;
  }

  .compact-account {
    display: none;
  }
}

/* Desktop Table View */
@media (min-width: 768px) {
  .list-toolbar {
    grid-template-columns: minmax(220px, 360px) 100px 100px auto;
    justify-content: space-between;
  }

  .result-count {
    grid-column: auto;
    text-align: right;
    padding-left: 0;
    font-size: 11px;
  }

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
    /* Grid Definition: Checkbox | Date | Amount | Type | Category | Account | Note | Actions */
    grid-template-columns: 48px 110px 100px 90px 80px 120px 1fr 60px;
    align-items: center;
    padding: 0 16px;
  }

  .compact-main {
    display: none;
  }

  .date-cell,
  .type-cell,
  .category-cell,
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
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  color: var(--ink-light);
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
    width: 38px;
    height: 38px;
  }
  .icon-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>
