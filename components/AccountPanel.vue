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
            <p class="account-total">累計支出：{{ formatCurrency(accountTotals.get(account.id) || 0) }}</p>
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
            <p class="account-balance">初始金額：{{ formatCurrency(account.balance || 0) }}</p>
            <p class="account-total">累計支出：{{ formatCurrency(accountTotals.get(account.id) || 0) }}</p>
            <div class="account-actions">
              <button class="btn btn-sm" type="button" @click="startEdit(account)">編輯</button>
              <button class="btn btn-sm danger" type="button" @click="confirmDelete(account.id)">刪除</button>
            </div>
          </div>
        </template>
      </article>
      <article v-if="unassignedTotal" class="account-card account-card--ghost">
        <div class="account-main">
          <h3>未指定帳戶</h3>
          <p class="account-kind">尚未分類</p>
        </div>
        <div class="account-meta">
          <p class="account-total">累計支出：{{ formatCurrency(unassignedTotal) }}</p>
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

const accountTotals = computed(() => {
  const map = new Map<string, number>()
  entries.value.forEach((entry) => {
    if (!entry.account_id) return
    map.set(entry.account_id, (map.get(entry.account_id) || 0) + entry.amount)
  })
  return map
})

const unassignedTotal = computed(() => {
  return entries.value.reduce((sum, entry) => {
    if (entry.account_id) return sum
    return sum + entry.amount
  }, 0)
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
