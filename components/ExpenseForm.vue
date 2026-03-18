<template>
  <section class="panel entry-panel" :class="{ 'entry-panel--compact': compact }">
    <div class="entry-titlebar">
      <h2>快速記帳</h2>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再開始記帳</p>
      <button @click="signInWithGoogle(signInRedirect)" class="btn btn-google" type="button">
        <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        登入
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="expense-form">
      <div class="type-toggle">
        <button
          type="button"
          :class="['btn-toggle', form.type === 'expense' ? 'active expense' : '']"
          @click="form.type = 'expense'"
        >
          支出
        </button>
        <button
          type="button"
          :class="['btn-toggle', form.type === 'income' ? 'active income' : '']"
          @click="form.type = 'income'"
        >
          收入
        </button>
        <button
          type="button"
          :class="['btn-toggle', form.type === 'transfer' ? 'active transfer' : '']"
          @click="form.type = 'transfer'"
        >
          轉帳
        </button>
      </div>

      <div class="quick-date">
        <button class="chip" type="button" @click="setToday">今天</button>
        <button class="chip" type="button" @click="setYesterday">昨天</button>
        <button class="chip" type="button" @click="setDaysAgo(2)">前天</button>
      </div>

      <div class="form-grid">
        <label class="form-field">
          <span class="label-text">日期</span>
          <input class="input" type="date" v-model="form.date" required>
        </label>
        <label class="form-field">
          <span class="label-text">金額</span>
          <div class="input-wrapper">
            <span class="prefix">NT$</span>
            <input class="input with-prefix" type="number" v-model.number="form.amount" min="0" step="1" required placeholder="0">
          </div>
        </label>
      </div>

      <div v-if="form.type !== 'transfer'" class="form-grid">
        <label class="form-field">
          <span class="label-text">帳戶</span>
          <select class="input select" v-model="form.account_id">
            <option value="">未指定</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </label>

        <label class="form-field">
          <span class="label-text">類型</span>
          <select class="input select" v-model="form.sub_type">
            <option value="general">一般</option>
            <option value="zibao">孜保平分</option>
          </select>
        </label>
      </div>

      <template v-if="form.type === 'transfer'">
        <div class="form-grid">
          <label class="form-field">
            <span class="label-text">轉出帳戶</span>
            <select class="input select" v-model="form.from_account_id" required>
              <option value="" disabled>請選擇</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </label>
          <label class="form-field">
            <span class="label-text">轉入帳戶</span>
            <select class="input select" v-model="form.to_account_id" required>
              <option value="" disabled>請選擇</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </label>
        </div>
      </template>

      <label class="form-field">
        <span class="label-text">備註</span>
        <textarea class="input textarea" v-model="form.note" :placeholder="notePlaceholder"></textarea>
      </label>

      <div class="form-actions">
        <button
          :class="['btn-submit', submitBtnClass]"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? '儲存中...' : `確認${submitBtnText}` }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  defaultRedirect?: string
  signInRedirectTo?: string
  compact?: boolean
}>(), {
  defaultRedirect: '/total',
  signInRedirectTo: '/total/entry',
  compact: false,
})

const route = useRoute()
const router = useRouter()
const { user, signInWithGoogle } = useAuth()
const { accounts } = useAccounts()
const { addEntry } = useTotalExpenses()

const submitting = ref(false)
const signInRedirect = computed(() => props.signInRedirectTo)
const redirectPath = computed(() => {
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from && from.startsWith('/')) return from
  return props.defaultRedirect
})
const notePlaceholder = computed(() => form.type === 'transfer' ? '轉帳備註...' : '交通、購物、聚餐...')

const form = reactive({
  date: toISODate(new Date()),
  amount: '' as unknown as number,
  note: '',
  account_id: '' as string,
  from_account_id: '' as string,
  to_account_id: '' as string,
  type: 'expense' as 'expense' | 'income' | 'transfer',
  sub_type: 'general',
})

const submitBtnText = computed(() => form.type === 'income' ? '收入' : form.type === 'transfer' ? '轉帳' : '支出')
const submitBtnClass = computed(() => form.type === 'income' ? 'success' : form.type === 'transfer' ? 'primary' : 'danger')

watch(accounts, (list) => {
  if (!list.length) return
  if (!form.account_id) form.account_id = list[0].id
  if (!form.from_account_id) form.from_account_id = list[0].id
  if (!form.to_account_id && list.length > 1) form.to_account_id = list[1].id
}, { immediate: true })

const setDaysAgo = (days: number) => {
  const target = new Date()
  target.setDate(target.getDate() - days)
  form.date = toISODate(target)
}

const setToday = () => setDaysAgo(0)
const setYesterday = () => setDaysAgo(1)

const resetForm = () => {
  form.amount = '' as unknown as number
  form.note = ''
  form.sub_type = 'general'
  form.type = 'expense'
  form.date = toISODate(new Date())
}

const handleSubmit = async () => {
  if (!user.value || submitting.value) return

  if (!form.amount || form.amount <= 0) {
    alert('請輸入正確金額')
    return
  }

  submitting.value = true
  try {
    if (form.type === 'transfer') {
      if (!form.from_account_id || !form.to_account_id) {
        alert('請選擇轉出與轉入帳戶')
        return
      }
      if (form.from_account_id === form.to_account_id) {
        alert('轉出和轉入帳戶不能相同')
        return
      }

      const fromAccount = accounts.value.find(a => a.id === form.from_account_id)
      const toAccount = accounts.value.find(a => a.id === form.to_account_id)
      const fromName = fromAccount?.name || '未知帳戶'
      const toName = toAccount?.name || '未知帳戶'
      const amount = Math.round(Math.abs(form.amount))

      await addEntry({
        id: generateUUID(),
        date: form.date,
        amount,
        note: `[轉帳] 轉至 ${toName}${form.note ? ` (${form.note})` : ''}`,
        createdAt: Date.now(),
        user_id: user.value.id,
        account_id: form.from_account_id,
        sub_type: 'transfer',
      })

      await addEntry({
        id: generateUUID(),
        date: form.date,
        amount: -amount,
        note: `[轉帳] 來自 ${fromName}${form.note ? ` (${form.note})` : ''}`,
        createdAt: Date.now() + 1,
        user_id: user.value.id,
        account_id: form.to_account_id,
        sub_type: 'transfer',
      })
    } else {
      const finalAmount = form.type === 'income' ? -Math.abs(form.amount) : Math.abs(form.amount)
      await addEntry({
        id: generateUUID(),
        date: form.date,
        amount: Math.round(finalAmount),
        note: form.note,
        createdAt: Date.now(),
        user_id: user.value.id,
        account_id: form.account_id || null,
        sub_type: form.sub_type,
      })
    }

    resetForm()
    await router.push(redirectPath.value)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.entry-panel {
  position: relative;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 18px 16px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background:
    radial-gradient(120% 70% at 0% 0%, #eef2ff 0%, rgba(238, 242, 255, 0) 50%),
    rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow-md);
}

.entry-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 6px;
  border-radius: var(--radius) var(--radius) 0 0;
  background: linear-gradient(90deg, var(--primary), #22c55e);
  opacity: 0.75;
}

.entry-panel--compact {
  max-width: 100%;
}

.entry-titlebar {
  margin-bottom: 14px;
}

.entry-titlebar h2 {
  margin: 0;
  font-size: 20px;
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-toggle {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: #e6eaff;
  padding: 4px;
  border-radius: 12px;
  gap: 6px;
}

.btn-toggle {
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  min-height: 44px;
  padding: 10px 8px;
  cursor: pointer;
}

.btn-toggle.active {
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  color: var(--ink);
}

.btn-toggle.active.expense { color: var(--danger); }
.btn-toggle.active.income { color: var(--success); }
.btn-toggle.active.transfer { color: var(--primary); }

.quick-date {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 10px;
  min-height: 36px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--ink-light);
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
}

.input {
  height: 48px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 14px;
  width: 100%;
  font-size: 15px;
  background: linear-gradient(180deg, #fff 0%, #fcfcff 100%);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.input-wrapper {
  position: relative;
}

.prefix {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
}

.with-prefix {
  padding-left: 46px;
  font-family: var(--font-pixel);
}

.textarea {
  min-height: 98px;
  padding: 12px 14px;
  resize: vertical;
}

.form-actions {
  margin-top: 2px;
}

.btn-submit {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit.danger { background: var(--danger); }
.btn-submit.success { background: var(--success); }
.btn-submit.primary {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.24);
}

.auth-gate {
  text-align: center;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-paper);
}

.btn-google {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-google svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 720px) {
  .entry-panel {
    border-radius: 16px;
    padding: 14px 12px 18px;
  }

  .form-actions {
    position: sticky;
    bottom: calc(var(--mobile-nav-height) + 8px);
    background: linear-gradient(to top, rgba(247, 247, 248, 0.98), rgba(247, 247, 248, 0));
    padding-top: 10px;
  }
}
</style>
