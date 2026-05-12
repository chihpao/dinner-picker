<template>
  <section class="panel entry-panel" :class="{ 'entry-panel--compact': compact }">
    <!-- Today's spending indicator -->
    <div v-if="user" class="today-bar">
      <span class="today-label">今日已花</span>
      <span class="today-amount">{{ formatCurrency(todayExpense) }}</span>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再開始記帳</p>
      <button @click="signInWithGoogle(signInRedirect)" class="btn btn-google" type="button">
        <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        登入
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="expense-form">
      <!-- Type Toggle -->
      <div class="type-toggle-wrapper">
        <div class="type-toggle">
          <div class="toggle-slider" :class="form.type"></div>
          <button
            type="button"
            :class="['btn-toggle', { active: form.type === 'expense' }]"
            @click="form.type = 'expense'"
          >
            支出
          </button>
          <button
            type="button"
            :class="['btn-toggle', { active: form.type === 'income' }]"
            @click="form.type = 'income'"
          >
            收入
          </button>
          <button
            type="button"
            :class="['btn-toggle', { active: form.type === 'transfer' }]"
            @click="form.type = 'transfer'"
          >
            轉帳
          </button>
        </div>
      </div>

      <!-- Amount: Big & prominent -->
      <div class="amount-section">
        <div class="amount-wrapper">
          <span class="prefix">NT$</span>
          <input
            class="amount-input"
            type="number"
            v-model.number="form.amount"
            min="0"
            step="1"
            required
            placeholder="0"
            inputmode="numeric"
          >
        </div>
        <div class="quick-amounts">
          <button v-for="amt in quickAmounts" :key="amt" type="button" class="amt-chip" @click="setAmount(amt)">
            {{ amt }}
          </button>
        </div>
      </div>

      <!-- Date row: compact inline -->
      <div class="date-row">
        <input class="input date-input" type="date" v-model="form.date" required>
        <div class="quick-date">
          <button
            v-for="d in dateChips"
            :key="d.days"
            class="chip"
            :class="{ active: isDateActive(d.days) }"
            type="button"
            @click="setDaysAgo(d.days)"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <!-- Account + Type: inline on mobile -->
      <div v-if="form.type !== 'transfer'" class="inline-selects">
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

      <!-- Transfer accounts -->
      <template v-if="form.type === 'transfer'">
        <div class="inline-selects">
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

      <!-- Note: single-line input -->
      <div class="note-row">
        <input class="input note-input" type="text" v-model="form.note" :placeholder="notePlaceholder">
      </div>

      <!-- Submit -->
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
const { addEntry, summaries } = useTotalExpenses()

const submitting = ref(false)
const signInRedirect = computed(() => props.signInRedirectTo)
const redirectPath = computed(() => {
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from && from.startsWith('/')) return from
  return props.defaultRedirect
})
const notePlaceholder = computed(() => form.type === 'transfer' ? '轉帳備註...' : '午餐、晚餐、交通...')

const todayExpense = computed(() => summaries.value.todayExpense)

const quickAmounts = [50, 100, 150, 200, 300, 500]
const dateChips = [
  { days: 0, label: '今天' },
  { days: 1, label: '昨天' },
  { days: 2, label: '前天' },
]

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
  if (!form.account_id) form.account_id = list[0]?.id ?? ''
  if (!form.from_account_id) form.from_account_id = list[0]?.id ?? ''
  if (!form.to_account_id && list.length > 1) form.to_account_id = list[1]?.id ?? ''
}, { immediate: true })

const setDaysAgo = (days: number) => {
  const target = new Date()
  target.setDate(target.getDate() - days)
  form.date = toISODate(target)
}

const isDateActive = (days: number) => {
  const target = new Date()
  target.setDate(target.getDate() - days)
  return form.date === toISODate(target)
}

const setAmount = (amt: number) => {
  form.amount = amt
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
/* ── Today Bar ─────────────────────── */
.today-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%);
  border: 1px solid rgba(79, 70, 229, 0.1);
  border-radius: 10px;
  margin-bottom: 4px;
}

.today-label {
  font-size: 12px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  letter-spacing: 0.04em;
}

.today-amount {
  font-family: var(--font-pixel);
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

/* ── Panel ─────────────────────────── */
.entry-panel {
  position: relative;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 14px 14px;
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
  height: 5px;
  border-radius: var(--radius) var(--radius) 0 0;
  background: linear-gradient(90deg, var(--primary), #22c55e);
  opacity: 0.75;
}

.entry-panel--compact {
  max-width: 100%;
}

/* ── Form ──────────────────────────── */
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Type Toggle (Segmented Control) ── */
.type-toggle-wrapper {
  margin-bottom: 8px;
}

.type-toggle {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(230, 234, 242, 0.6);
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
  z-index: 1;
}

.toggle-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(33.333% - 5.33px);
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -1;
}

.toggle-slider.expense { transform: translateX(0); }
.toggle-slider.income { transform: translateX(calc(100% + 4px)); }
.toggle-slider.transfer { transform: translateX(calc(200% + 8px)); }

.btn-toggle {
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  min-height: 42px;
  padding: 8px 6px;
  cursor: pointer;
  transition: color 0.3s;
  letter-spacing: 0.05em;
}

.btn-toggle.active {
  color: var(--ink);
}

.type-toggle:has(.toggle-slider.expense) .btn-toggle:nth-child(2).active { color: var(--danger); }
.type-toggle:has(.toggle-slider.income) .btn-toggle:nth-child(3).active { color: var(--success); }
.type-toggle:has(.toggle-slider.transfer) .btn-toggle:nth-child(4).active { color: var(--primary); }

/* ── Amount Section ────────────────── */
.amount-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.amount-wrapper {
  position: relative;
  background: #f8fafc;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 8px 16px;
}

.amount-wrapper:focus-within {
  background: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15), 0 8px 24px rgba(79, 70, 229, 0.08);
  transform: translateY(-2px);
}

.amount-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 38px !important;
  height: 64px !important;
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  padding: 0;
  font-family: var(--font-pixel);
  letter-spacing: 0.02em;
}

.amount-input:focus {
  outline: none;
}

.amount-input::placeholder {
  color: rgba(0,0,0,0.15);
}

.prefix {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: 700;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  pointer-events: none;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.amt-chip {
  border: 1px solid rgba(0,0,0,0.06);
  background: #ffffff;
  border-radius: 12px;
  min-height: 40px;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.amt-chip:hover {
  border-color: rgba(79, 70, 229, 0.3);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.08);
}

.amt-chip:active {
  transform: scale(0.92);
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: none;
}

/* ── Date Row ──────────────────────── */
.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  width: auto;
  min-width: 0;
  flex: 1;
  height: 40px;
  font-size: 13px;
}

.quick-date {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.chip {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 8px;
  min-height: 36px;
  padding: 6px 10px;
  font-size: 11px;
  font-family: var(--font-pixel);
  color: var(--ink-light);
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}

.chip:hover, .chip.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

/* ── Inline Selects ────────────────── */
.inline-selects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-light);
}

.input {
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 12px;
  width: 100%;
  font-size: 14px;
  background: linear-gradient(180deg, #fff 0%, #fcfcff 100%);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* Removed duplicated prefix and unused wrappers */

/* ── Note Row ──────────────────────── */
.note-row {
  display: flex;
}

.note-input {
  height: 44px;
  font-size: 14px;
}

/* ── Submit ─────────────────────────── */
.form-actions {
  margin-top: 2px;
}

.btn-submit {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.1s var(--ease-snappy);
}

.btn-submit:active {
  transform: scale(0.98);
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

/* ── Auth Gate ──────────────────────── */
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

/* ── Mobile Polish ─────────────────── */
@media (max-width: 720px) {
  .entry-panel {
    border-radius: 20px;
    padding: 16px 12px 20px;
    border: none;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }

  .form-actions {
    position: sticky;
    bottom: calc(var(--mobile-nav-height) + 12px);
    margin: 16px -12px -20px;
    padding: 12px 12px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border-top: 1px solid rgba(0,0,0,0.05);
    z-index: 10;
  }

  .btn-submit {
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
    transform: translateZ(0); /* force hardware accel for smooth sticky */
  }

  .quick-amounts {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .amt-chip {
    padding: 6px 0;
    font-size: 12px;
    min-height: 38px;
    border-radius: 10px;
  }
}

@media (max-width: 360px) {
  .quick-amounts {
    grid-template-columns: repeat(3, 1fr);
  }

  .inline-selects {
    grid-template-columns: 1fr;
  }
}

/* ── Desktop ───────────────────────── */
@media (min-width: 721px) {
  .entry-panel {
    max-width: 540px;
    margin: 0 auto;
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  .date-row {
    gap: 12px;
  }

  .amount-input {
    font-size: 42px !important;
    height: 72px !important;
  }

  .form-actions {
    margin-top: 16px;
  }
}
</style>
