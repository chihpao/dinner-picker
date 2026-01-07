<template>
  <section class="panel entry-panel">
    <div class="entry-header">
      <h1>{{ titleText }}</h1>
      <div class="auth-bar">
        <!-- Minimal auth indicator if needed, or rely on layout -->
      </div>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再開始{{ entryText }}</p>
      <button @click="signInWithGoogle(signInRedirect)" class="btn-google" type="button">
        <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        登入
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="expense-form compact-form">
      <label>
        <span>日期</span>
        <input type="date" v-model="form.date" required>
      </label>
      <label>
        <span>金額 (NT$)</span>
        <input type="number" v-model.number="form.amount" min="0" step="1" required placeholder="例如 150">
      </label>
      <label v-if="showAccount" class="wide">
        <span>帳戶</span>
        <select v-model="form.account_id">
          <option value="">未指定</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.name }}（{{ accountKindLabel(account.kind) }}）
          </option>
        </select>
        <p v-if="!accounts.length" class="helper-text">尚未建立帳戶，先到「帳戶」建立。</p>
      </label>
      <label class="wide">
        <span>備註</span>
        <textarea v-model="form.note" :placeholder="notePlaceholder"></textarea>
      </label>
      <button class="btn primary" type="submit">確認</button>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  ledger?: 'food' | 'total'
}>(), {
  ledger: 'food'
})

const { user, signInWithGoogle } = useAuth()
const { accounts } = useAccounts()
const expenses = props.ledger === 'food' ? useFoodExpenses() : useTotalExpenses()
const { addEntry } = expenses
const router = useRouter()

const showAccount = computed(() => true)
const entryText = computed(() => props.ledger === 'food' ? '孜保飲食' : '一般記帳')
const titleText = computed(() => props.ledger === 'food' ? '孜保飲食' : '全消費總覽')
const signInRedirect = computed(() => props.ledger === 'food' ? '/expense-entry' : '/total/entry')
const redirectPath = computed(() => props.ledger === 'food' ? '/expenses' : '/total')
const notePlaceholder = computed(() => props.ledger === 'food' ? '午餐、晚餐...' : '交通、購物...')

const form = reactive({
  date: toISODate(new Date()),
  amount: '' as unknown as number,
  note: '',
  account_id: '' as string
})

watch(accounts, (list) => {
  if (props.ledger === 'food' && !form.account_id) {
    const target = list.find(a => a.name.includes('中國信託'))
    if (target) {
      form.account_id = target.id
    }
  }
}, { immediate: true })

const accountKindLabel = (kind: string) => {
  if (kind === 'cash') return '現金'
  if (kind === 'card') return '信用卡'
  return '銀行'
}

const handleSubmit = async () => {
  if (!form.amount || form.amount <= 0) {
    alert('請輸入正確的金額')
    return
  }

  const entry = {
    id: generateUUID(),
    date: form.date,
    amount: Math.round(form.amount),
    note: form.note,
    createdAt: Date.now(),
    user_id: user.value!.id,
    account_id: form.account_id || null
  }

  await addEntry(entry)

  // 如果是孜保飲食，同時新增到全消費總覽
  if (props.ledger === 'food') {
    const { addEntry: addTotalEntry } = useTotalExpenses()
    // 建立一個副本，並給予新的 ID，確保資料獨立
    const totalEntry = {
      ...entry,
      id: generateUUID(),
      // 確保 account_id 正確傳遞（雖然 food 模式下通常為 null）
      account_id: entry.account_id
    }
    await addTotalEntry(totalEntry)
  }

  router.push(redirectPath.value)
}
</script>
