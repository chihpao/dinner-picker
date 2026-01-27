<template>
  <section class="panel">
    <!-- Removed duplicate h2 title, kept pill if needed but cleaning it up is better -->
    <div class="panel-header" v-if="accounts.length">
       <span class="pill">共 {{ accounts.length }} 個帳戶</span>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再管理帳戶</p>
    </div>

    <template v-else>
      <div v-if="!accounts.length" class="empty-state">尚未建立帳戶，先新增一個吧！</div>
      
      <div v-else class="account-list">
        <article v-for="account in accounts" :key="account.id" class="account-card" :class="{ 'editing': editingId === account.id }">
          
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
              <span class="balance-amount" :class="{ 'negative': ((account.balance || 0) - (accountStats.get(account.id)?.net || 0)) < 0 }">
                {{ formatCurrency((account.balance || 0) - (accountStats.get(account.id)?.net || 0)) }}
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
             <p>確定要刪除這個帳戶嗎？</p>
             <p class="warning-text">相關的記帳紀錄即使刪除帳戶後仍會保留，但會變成「未指定帳戶」。</p>
           </div>
           <div class="modal-actions">
             <button class="btn" @click="cancelDelete">取消</button>
             <button class="btn danger" @click="confirmDelete">確認刪除</button>
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

const editingId = ref<string | null>(null)
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
  if (deleteModal.targetId) {
    await deleteAccount(deleteModal.targetId)
    deleteModal.open = false
    deleteModal.targetId = null
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
  gap: 16px;
  max-width: 800px; /* Limit width for better read on desktop */
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
  padding: 0 4px;
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

.account-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
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
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
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

.account-info h3 {
  font-size: 18px;
  margin: 0 0 6px 0;
  color: var(--ink);
  font-weight: 700;
}

.kind-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.kind-tag.bank { background: #E0F2FE; color: #0369A1; }
.kind-tag.card { background: #FCE7F3; color: #BE185D; }
.kind-tag.cash { background: #DCFCE7; color: #15803D; }
.kind-tag.other { background: #F3F4F6; color: #4B5563; }

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.account-card:hover .card-actions { opacity: 1; }

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--ink-light);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover { background: rgba(0,0,0,0.05); color: var(--ink); }
.icon-btn.danger:hover { background: #FEF2F2; color: var(--danger); }
.icon-btn :deep(svg) { width: 16px; height: 16px; }

/* Stats */
.card-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.stat-label { color: var(--ink-light); }
.stat-value { font-family: var(--font-pixel); font-weight: 500; }
.stat-value.income { color: var(--success); }
.stat-value.expense { color: var(--danger); opacity: 0.8; }

/* Balance */
.card-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.balance-label {
  font-size: 11px;
  color: var(--ink-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.balance-amount {
  font-size: 24px;
  font-family: var(--font-pixel);
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
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
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
  height: 38px;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
