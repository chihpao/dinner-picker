<template>
  <section class="panel">
    <div class="panel-header">
      <div class="panel-title-group">
        <h2>帳戶管理</h2>
        <span v-if="accounts.length" class="pill">共 {{ accounts.length }} 個</span>
      </div>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再管理帳戶</p>
    </div>

    <form v-else @submit.prevent="handleAdd" class="account-form">
      <label>
        <span>帳戶名稱</span>
        <input v-model="form.name" type="text" placeholder="例如 台新銀行" required>
      </label>
      <label>
        <span>類型</span>
        <select v-model="form.kind">
          <option value="bank">銀行</option>
          <option value="card">信用卡</option>
          <option value="cash">現金</option>
        </select>
      </label>
      <label>
        <span>初始金額 (NT$)</span>
        <input v-model.number="form.balance" type="number" min="0" step="1" placeholder="例如 10000" required>
      </label>
      <button class="btn primary" type="submit">新增帳戶</button>
    </form>

    <div v-if="user && !accounts.length" class="empty-state">尚未建立帳戶，先新增一個吧！</div>

    <div v-else-if="user" class="account-list">
      <article v-for="account in accounts" :key="account.id" class="account-card">
        <template v-if="editingId === account.id">
          <div class="account-main">
            <label class="inline-field">
              <span>帳戶名稱</span>
              <input v-model="editForm.name" type="text" required>
            </label>
            <label class="inline-field">
              <span>類型</span>
              <select v-model="editForm.kind">
                <option value="bank">銀行</option>
                <option value="card">信用卡</option>
                <option value="cash">現金</option>
              </select>
            </label>
          </div>
          <div class="account-meta">
            <label class="inline-field">
              <span>初始金額 (NT$)</span>
              <input v-model.number="editForm.balance" type="number" min="0" step="1" required>
            </label>
            <div class="account-actions">
              <button class="btn btn-sm primary" type="button" @click="saveEdit(account.id)">儲存</button>
              <button class="btn btn-sm" type="button" @click="cancelEdit">取消</button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="account-main">
            <h3>{{ account.name }}</h3>
            <p class="account-kind">{{ accountKindLabel(account.kind) }}</p>
          </div>
          <div class="account-meta">
            <div class="meta-row">
              <span>初始：{{ formatCurrency(account.balance || 0) }}</span>
              <span class="text-sm text-gray">收入：{{ formatCurrency(accountStats.get(account.id)?.income || 0) }}</span>
              <span class="text-sm text-gray">支出：{{ formatCurrency(accountStats.get(account.id)?.expense || 0) }}</span>
            </div>
            <p class="account-balance highlight">
              目前餘額：{{ formatCurrency((account.balance || 0) - (accountStats.get(account.id)?.net || 0)) }}
            </p>
            <div class="account-actions">
              <button class="btn btn-sm" type="button" @click="startEdit(account)">編輯</button>
              <button class="btn btn-sm danger" type="button" @click="confirmDelete(account.id)">刪除</button>
            </div>
          </div>
        </template>
      </article>
      <article v-if="unassignedStats.count > 0" class="account-card account-card--ghost">
        <div class="account-main">
          <h3>未指定帳戶</h3>
          <p class="account-kind">尚未分類</p>
        </div>
        <div class="account-meta">
          <div class="meta-row">
            <span>收入：{{ formatCurrency(unassignedStats.income) }}</span>
            <span>支出：{{ formatCurrency(unassignedStats.expense) }}</span>
          </div>
          <p class="account-total">淨支出：{{ formatCurrency(unassignedStats.net) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts()
const { entries } = useTotalExpenses()

const form = reactive({
  name: '',
  kind: 'bank' as 'bank' | 'cash' | 'card',
  balance: 0
})

const editingId = ref<string | null>(null)
const editForm = reactive({
  name: '',
  kind: 'bank' as 'bank' | 'cash' | 'card',
  balance: 0
})

const accountStats = computed(() => {
  const map = new Map<string, { income: number; expense: number; net: number }>()
  entries.value.forEach((entry) => {
    if (!entry.account_id) return
    const current = map.get(entry.account_id) || { income: 0, expense: 0, net: 0 }
    
    // Logic: Income is negative, Expense is positive.
    if (entry.amount < 0) {
      current.income += Math.abs(entry.amount)
    } else {
      current.expense += entry.amount
    }
    current.net += entry.amount // Sum of signed amounts (Expense - Income)
    
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

const handleAdd = async () => {
  if (!user.value) return
  if (!form.name.trim()) return
  if (form.balance < 0) {
    alert('請輸入正確的初始金額')
    return
  }
  await addAccount({
    id: generateUUID(),
    name: form.name.trim(),
    kind: form.kind,
    balance: Math.round(form.balance),
    createdAt: Date.now(),
    user_id: user.value.id
  })
  form.name = ''
  form.kind = 'bank'
  form.balance = 0
}

const confirmDelete = (id: string) => {
  if (!confirm('確定要刪除此帳戶嗎？')) return
  deleteAccount(id)
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
.meta-row {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.highlight {
  color: var(--primary-color, #f4b005);
  font-weight: bold;
  font-size: 1.1rem;
}
.text-gray {
  color: #aaa;
}
</style>
