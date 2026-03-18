<template>
  <section class="panel">
    <div class="panel-header" v-if="accounts.length">
      <span class="pill">共 {{ accounts.length }} 個帳戶</span>
      <div class="sort-switch" role="group" aria-label="帳戶排序">
        <button
          class="btn btn-sm sort-btn"
          :class="{ primary: sortMode === 'balanceDesc' }"
          type="button"
          :aria-pressed="sortMode === 'balanceDesc'"
          @click="sortMode = 'balanceDesc'"
        >
          餘額高
        </button>
        <button
          class="btn btn-sm sort-btn"
          :class="{ primary: sortMode === 'balanceAsc' }"
          type="button"
          :aria-pressed="sortMode === 'balanceAsc'"
          @click="sortMode = 'balanceAsc'"
        >
          餘額低
        </button>
        <button
          class="btn btn-sm sort-btn"
          :class="{ primary: sortMode === 'name' }"
          type="button"
          :aria-pressed="sortMode === 'name'"
          @click="sortMode = 'name'"
        >
          名稱
        </button>
      </div>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再管理帳戶</p>
    </div>

    <template v-else>
      <div v-if="!accounts.length" class="empty-state">
        <p>尚未建立帳戶，先新增一個吧！</p>
        <NuxtLink to="/total/add-account" class="btn btn-sm primary">
          前往新增帳戶
        </NuxtLink>
      </div>
      
      <div v-else class="account-list">
        <article v-for="account in sortedAccounts" :key="account.id" class="account-card" :class="{ 'editing': editingId === account.id }">
          
          <!-- EDIT MODE -->
          <template v-if="editingId === account.id">
            <div class="edit-mode-layout">
              <div class="edit-header">
                <h3>編輯帳戶</h3>
              </div>
              
              <div class="edit-grid">
                <label class="input-group">
                  <span class="label-text">帳戶名稱</span>
                  <input v-model="editForm.name" type="text" placeholder="例如：台新銀行" required class="form-input">
                </label>
                
                <label class="input-group">
                  <span class="label-text">類型</span>
                  <div class="type-select-wrapper">
                    <select v-model="editForm.kind" class="form-select">
                      <option value="bank">銀行帳戶</option>
                      <option value="card">信用卡</option>
                      <option value="cash">現金 / 錢包</option>
                    </select>
                    <span class="select-arrow">▼</span>
                  </div>
                </label>

                <label class="input-group full-width">
                  <span class="label-text">初始餘額</span>
                  <div class="amount-input-wrapper">
                    <span class="currency-symbol">NT$</span>
                    <input v-model.number="editForm.balance" type="number" class="form-input amount-input" required>
                  </div>
                </label>
              </div>

              <div class="edit-actions">
                <button class="btn btn-sm" type="button" @click="cancelEdit">取消</button>
                <button class="btn btn-sm primary" type="button" @click="saveEdit(account.id)">儲存變更</button>
              </div>
            </div>
          </template>

          <!-- VIEW MODE -->
          <template v-else>
            <div class="card-top">
              <div class="account-info">
                <h3>{{ account.name }}</h3>
                <span class="kind-tag" :class="account.kind">{{ accountKindLabel(account.kind) }}</span>
              </div>
              <div class="card-actions">
                 <button class="icon-btn" @click="startEdit(account)" title="編輯">
                  <IconEdit />
                 </button>
                 <button class="icon-btn danger" @click="requestDelete(account.id)" title="刪除">
                  <IconTrash />
                 </button>
              </div>
            </div>

            <div class="card-stats">
              <div class="stat-row">
                 <span class="stat-label">初始</span>
                 <span class="stat-value">{{ formatCurrency(account.balance || 0) }}</span>
              </div>
              <div class="stat-row">
                 <span class="stat-label">收入</span>
                 <span class="stat-value income">+{{ formatCurrency(accountStats.get(account.id)?.income || 0) }}</span>
              </div>
              <div class="stat-row">
                 <span class="stat-label">支出</span>
                 <span class="stat-value expense">-{{ formatCurrency(accountStats.get(account.id)?.expense || 0) }}</span>
              </div>
            </div>

            <div class="card-balance">
              <span class="balance-label">目前餘額</span>
              <span class="balance-amount" :class="{ 'negative': accountCurrentBalance(account.id, account.balance) < 0 }">
                {{ formatCurrency(accountCurrentBalance(account.id, account.balance)) }}
              </span>
            </div>
          </template>
        </article>

        <!-- Unassigned ghost card -->
        <article v-if="unassignedStats.count > 0" class="account-card ghost">
          <div class="card-top">
            <div class="account-info">
              <h3>未指定帳戶</h3>
              <span class="kind-tag other">其他</span>
            </div>
          </div>
          <div class="card-stats">
             <div class="stat-row">
                 <span class="stat-label">收入</span>
                 <span class="stat-value income">+{{ formatCurrency(unassignedStats.income) }}</span>
              </div>
              <div class="stat-row">
                 <span class="stat-label">支出</span>
                 <span class="stat-value expense">-{{ formatCurrency(unassignedStats.expense) }}</span>
              </div>
          </div>
          <div class="card-balance">
             <span class="balance-label">淨支出</span>
             <span class="balance-amount">{{ formatCurrency(unassignedStats.net) }}</span>
          </div>
        </article>
      </div>
    </template>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
       <div v-if="deleteModal.open" class="modal-overlay" @click.self="cancelDelete">
         <div class="modal-card">
           <div class="modal-header">
             <h3>刪除帳戶</h3>
           </div>
           <div class="modal-content">
             <p>確定要刪除「{{ targetAccountName }}」嗎？</p>
             <p class="impact-text">此帳戶共有 {{ deleteImpactCount }} 筆記帳紀錄。</p>
             <p class="warning-text">相關的記帳紀錄即使刪除帳戶後仍會保留，但會變成「未指定帳戶」。</p>
           </div>
           <div class="modal-actions">
             <button class="btn" @click="cancelDelete">取消</button>
             <button class="btn danger" @click="confirmDelete" :disabled="deletingAccount">
               {{ deletingAccount ? '刪除中...' : '確認刪除' }}
             </button>
           </div>
         </div>
       </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import IconEdit from '~/components/icons/IconEdit.vue'
import IconTrash from '~/components/icons/IconTrash.vue'

const { user } = useAuth()
const { accounts, updateAccount, deleteAccount } = useAccounts()
const { entries } = useTotalExpenses()
const SORT_PREF_KEY = 'dinnerPicker.accounts.sort.v1'

const editingId = ref<string | null>(null)
const sortMode = ref<'balanceDesc' | 'balanceAsc' | 'name'>('balanceDesc')
const deletingAccount = ref(false)
const editForm = reactive({
  name: '',
  kind: 'bank' as 'bank' | 'cash' | 'card',
  balance: 0
})

// Delete Modal State
const deleteModal = reactive({
  open: false,
  targetId: null as string | null
})

const targetAccountName = computed(() => {
  if (!deleteModal.targetId) return '此帳戶'
  return accounts.value.find(account => account.id === deleteModal.targetId)?.name || '此帳戶'
})

const deleteImpactCount = computed(() => {
  if (!deleteModal.targetId) return 0
  return entries.value.filter(entry => entry.account_id === deleteModal.targetId).length
})

const accountCurrentBalance = (accountId: string, balance: number) => {
  const net = accountStats.value.get(accountId)?.net || 0
  return (balance || 0) - net
}

const sortedAccounts = computed(() => {
  const list = [...accounts.value]
  if (sortMode.value === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
  }
  if (sortMode.value === 'balanceAsc') {
    return list.sort((a, b) => accountCurrentBalance(a.id, a.balance) - accountCurrentBalance(b.id, b.balance))
  }
  return list.sort((a, b) => accountCurrentBalance(b.id, b.balance) - accountCurrentBalance(a.id, a.balance))
})

onMounted(() => {
  if (!import.meta.client) return
  const saved = localStorage.getItem(SORT_PREF_KEY)
  if (saved === 'balanceDesc' || saved === 'balanceAsc' || saved === 'name') {
    sortMode.value = saved
  }
})

watch(sortMode, (mode) => {
  if (!import.meta.client) return
  localStorage.setItem(SORT_PREF_KEY, mode)
})

const accountStats = computed(() => {
  const map = new Map<string, { income: number; expense: number; net: number }>()
  entries.value.forEach((entry) => {
    if (!entry.account_id) return
    const current = map.get(entry.account_id) || { income: 0, expense: 0, net: 0 }
    
    if (entry.amount < 0) {
      current.income += Math.abs(entry.amount)
    } else {
      current.expense += entry.amount
    }
    current.net += entry.amount
    map.set(entry.account_id, current)
  })
  return map
})

const unassignedStats = computed(() => {
  return entries.value.reduce((acc, entry) => {
    if (entry.account_id) return acc
    if (entry.amount < 0) {
      acc.income += Math.abs(entry.amount)
    } else {
      acc.expense += entry.amount
    }
    acc.net += entry.amount
    acc.count++
    return acc
  }, { income: 0, expense: 0, net: 0, count: 0 })
})

const accountKindLabel = (kind: string) => {
  if (kind === 'cash') return '現金'
  if (kind === 'card') return '信用卡'
  return '銀行'
}

const requestDelete = (id: string) => {
  deleteModal.targetId = id
  deleteModal.open = true
}

const cancelDelete = () => {
  deleteModal.open = false
  deleteModal.targetId = null
}

const confirmDelete = async () => {
  if (!deleteModal.targetId || deletingAccount.value) return
  deletingAccount.value = true
  try {
    await deleteAccount(deleteModal.targetId)
    deleteModal.open = false
    deleteModal.targetId = null
  } finally {
    deletingAccount.value = false
  }
}

const startEdit = (account: { id: string; name: string; kind: 'bank' | 'cash' | 'card'; balance: number }) => {
  editingId.value = account.id
  editForm.name = account.name
  editForm.kind = account.kind
  editForm.balance = account.balance ?? 0
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id: string) => {
  if (!user.value) return
  const target = accounts.value.find(account => account.id === id)
  if (!target) {
    editingId.value = null
    return
  }
  if (!editForm.name.trim()) {
    alert('請輸入帳戶名稱')
    return
  }
  if (editForm.balance < 0) {
    alert('請輸入正確的初始金額')
    return
  }

  await updateAccount({
    ...target,
    name: editForm.name.trim(),
    kind: editForm.kind,
    balance: Math.round(editForm.balance),
  })
  editingId.value = null
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 800px; /* Limit width for better read on desktop */
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 2px;
}

.pill {
  background: var(--bg-paper);
  border: 1px solid var(--border);
  color: var(--ink-light);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 99px;
  font-family: var(--font-pixel);
}

.sort-switch {
  display: inline-flex;
  gap: 6px;
}

.sort-btn {
  min-height: 34px;
  padding: 0 10px;
  font-size: 12px;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 22px 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--bg-paper);
  text-align: center;
  color: var(--ink-light);
}

.empty-state p {
  margin: 0;
}

.account-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Tablet+ Grid */
@media (min-width: 640px) {
  .account-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

/* Card Styling */
.account-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px; /* Softer radius */
  padding: 18px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04); /* Subtler, deeper shadow */
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

.account-card.ghost {
  background: #fcfcfc;
  border-style: dashed;
  opacity: 0.8;
}

/* Card Header */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.account-info h3 {
  font-size: 18px;
  margin: 0;
  color: var(--ink);
  font-weight: 700;
  line-height: 1.2;
}

.kind-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 99px; /* Pill shape */
  font-family: var(--font-sans); /* Switch to sans for cleaner look */
  font-weight: 600;
  letter-spacing: 0.02em;
}
.kind-tag.bank { background: #E0F2FE; color: #0284C7; }
.kind-tag.card { background: #FCE7F3; color: #DB2777; }
.kind-tag.cash { background: #DCFCE7; color: #16A34A; }
.kind-tag.other { background: #F3F4F6; color: #4B5563; }

.card-actions {
  display: flex;
  gap: 6px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  color: var(--ink-light);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover { background: #e5e7eb; color: var(--ink); }
.icon-btn.danger:hover { background: #FEF2F2; color: var(--danger); }
.icon-btn :deep(svg) { width: 18px; height: 18px; }

/* Stats */
.card-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid var(--border); /* Clean separator */
  border-bottom: 1px solid var(--border);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.stat-label { 
  color: var(--ink-light); 
  font-weight: 500;
}
.stat-value { 
  font-family: var(--font-pixel); 
  font-weight: 500; 
  font-size: 15px;
}
.stat-value.income { color: var(--success); }
.stat-value.expense { color: var(--danger); opacity: 0.9; }

/* Balance */
.card-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.balance-label {
  font-size: 13px; /* Slightly larger */
  color: var(--ink-light);
  font-weight: 500;
}
.balance-amount {
  font-size: 30px;
  font-family: var(--font-pixel);
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -0.03em;
}
.balance-amount.negative { color: var(--danger); }

/* Edit Mode Layout */
.edit-mode-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.edit-header h3 {
  font-size: 16px;
  color: var(--ink);
  margin: 0;
}
.edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .edit-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group.full-width { grid-column: 1 / -1; }

.label-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-light);
  text-transform: uppercase;
}

.form-input, .form-select {
  width: 100%;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--ink);
  transition: all 0.2s;
  background: white;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.type-select-wrapper { position: relative; }
.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--ink-light);
  pointer-events: none;
}
.form-select { appearance: none; }

.amount-input-wrapper {
  position: relative;
}
.currency-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-light);
  font-size: 13px;
  font-family: var(--font-pixel);
}
.amount-input {
  padding-left: 44px;
  font-family: var(--font-pixel);
  font-weight: 600;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform-origin: center;
  animation: scaleIn 0.2s var(--ease-snappy);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--danger);
}

.modal-content {
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}

.impact-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--ink);
}

.warning-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--ink-light);
  background: #FEF2F2;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #FECACA;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.modal-actions .btn { flex: 1; }
.modal-actions .btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 720px) {
  .panel {
    gap: 12px;
  }

  .account-card:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .sort-switch {
    width: 100%;
  }

  .sort-btn {
    flex: 1;
  }

  .account-card {
    padding: 14px 12px;
    gap: 14px;
  }

  .card-actions {
    opacity: 1;
  }

  .icon-btn {
    width: 42px;
    height: 42px;
  }

  .balance-amount {
    font-size: 24px;
  }

  .edit-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
</style>
