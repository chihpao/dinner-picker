<template>
  <section class="panel entry-panel">
    <div class="entry-header">
      <h1>{{ titleText }}</h1>
    </div>

    <div v-if="!user" class="auth-gate panel">
      <p>請先登入再開始{{ entryText }}</p>
      <button @click="signInWithGoogle(signInRedirect)" class="btn btn-google" type="button">
        <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        登入
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="expense-form compact-form">
      <!-- Type Toggles -->
      <div class="type-toggle-wrapper">
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
      </div>

      <!-- Row: Date & Amount -->
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

      <!-- Expense / Income Account -->
      <div v-if="showAccount && form.type !== 'transfer'" class="form-grid">
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

      <!-- Transfer Fields -->
      <template v-if="form.type === 'transfer'">
        <div class="form-grid">
          <label class="form-field">
            <span class="label-text">轉出 (From)</span>
            <select class="input select" v-model="form.from_account_id" required>
              <option value="" disabled>請選擇</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </label>
          <label class="form-field">
            <span class="label-text">轉入 (To)</span>
            <select class="input select" v-model="form.to_account_id" required>
              <option value="" disabled>請選擇</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </label>
        </div>
      </template>

      <!-- Note -->
      <label class="form-field">
        <span class="label-text">備註</span>
        <textarea class="input textarea" v-model="form.note" :placeholder="notePlaceholder"></textarea>
      </label>
      
      <!-- Actions -->
      <div class="form-actions">
        <button 
          :class="['btn-submit', submitBtnClass]" 
          type="submit"
        >
          確認{{ submitBtnText }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const { user, signInWithGoogle } = useAuth()
const { accounts } = useAccounts()
const expenses = useTotalExpenses()
const { addEntry } = expenses
const router = useRouter()

const showAccount = computed(() => true)
const entryText = computed(() => '一般記帳')
const titleText = computed(() => '一般記帳')
const signInRedirect = computed(() => '/total/entry')
const redirectPath = computed(() => '/total')
const notePlaceholder = computed(() => {
  if (form.type === 'transfer') return '轉帳備註...'
  return '交通、購物...'
})

const form = reactive({
  date: toISODate(new Date()),
  amount: '' as unknown as number,
  note: '',
  account_id: '' as string,
  from_account_id: '' as string,
  to_account_id: '' as string,
  type: 'expense' as 'expense' | 'income' | 'transfer',
  sub_type: 'general' // Default to General
})

const submitBtnText = computed(() => {
  if (form.type === 'income') return '收入'
  if (form.type === 'transfer') return '轉帳'
  return '支出'
})

const submitBtnClass = computed(() => {
  if (form.type === 'income') return 'success'
  if (form.type === 'transfer') return 'primary' 
  return 'danger' 
})

watch(accounts, (list) => {
  if (!form.account_id && list.length > 0) {
    const target = list.find(a => a.name.includes('中國信託'))
    if (target) {
      form.account_id = target.id
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!form.amount || form.amount <= 0) {
    alert('請輸入正確的金額')
    return
  }

  // Handle Transfer
  if (form.type === 'transfer') {
    if (!form.from_account_id || !form.to_account_id) {
      alert('請選擇轉出和轉入帳戶')
      return
    }
    if (form.from_account_id === form.to_account_id) {
      alert('轉出和轉入帳戶不能相同')
      return
    }

    const fromAccount = accounts.value.find(a => a.id === form.from_account_id)
    const toAccount = accounts.value.find(a => a.id === form.to_account_id)
    const fromName = fromAccount ? fromAccount.name : '未知帳戶'
    const toName = toAccount ? toAccount.name : '未知帳戶'

    // 1. Expense Entry (From Account)
    const entryOut = {
      id: generateUUID(),
      date: form.date,
      amount: Math.round(form.amount), // Positive for expense
      note: `[轉帳] 轉至 ${toName} ${form.note ? '(' + form.note + ')' : ''}`,
      createdAt: Date.now(),
      user_id: user.value!.id,
      account_id: form.from_account_id,
      sub_type: 'general'
    }

    // 2. Income Entry (To Account)
    const entryIn = {
      id: generateUUID(),
      date: form.date,
      amount: -Math.round(form.amount), // Negative for income
      note: `[轉帳] 來自 ${fromName} ${form.note ? '(' + form.note + ')' : ''}`,
      createdAt: Date.now() + 1, // Ensure slightly different time
      user_id: user.value!.id,
      account_id: form.to_account_id,
      sub_type: 'general'
    }

    await addEntry(entryOut)
    await addEntry(entryIn)

    router.push(redirectPath.value)
    return
  }

  // Handle Expense/Income
  const finalAmount = form.type === 'income' ? -Math.abs(form.amount) : Math.abs(form.amount)

  const entry = {
    id: generateUUID(),
    date: form.date,
    amount: Math.round(finalAmount),
    note: form.note,
    createdAt: Date.now(),
    user_id: user.value!.id,
    account_id: form.account_id || null,
    sub_type: form.sub_type
  }

  await addEntry(entry)

  router.push(redirectPath.value)
}
</script>

<style scoped>
.entry-panel {
  max-width: 520px; /* Tighter width */
  margin: 0 auto;
  padding: 40px 24px;
}

.entry-header h1 {
  font-size: 20px;
  margin-bottom: 32px;
  text-align: center;
  color: var(--ink);
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Toggles */
.type-toggle-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.type-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 99px; /* Pill shape */
  gap: 4px;
}

.btn-toggle {
  padding: 8px 24px;
  border: none;
  background: transparent;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-light);
  cursor: pointer;
  transition: all 0.2s var(--ease-snappy);
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
}

.btn-toggle:hover {
  color: var(--ink);
}

.btn-toggle.active {
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  color: var(--ink);
}

.btn-toggle.active.expense { color: var(--danger); }
.btn-toggle.active.income { color: var(--success); }
.btn-toggle.active.transfer { color: var(--primary); }

/* Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Fields */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
  margin-left: 2px;
}

.input {
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 16px;
  font-size: 16px;
  font-family: var(--font-sans);
  background: white;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* Subtle depth */
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-wrapper {
  position: relative;
}

.input.with-prefix {
  padding-left: 48px;
  font-family: var(--font-pixel);
  font-weight: 700;
}

.prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-light);
  font-weight: 700;
  font-size: 13px;
  font-family: var(--font-pixel);
}

.textarea {
  height: 100px;
  padding: 12px 16px;
  resize: vertical;
}

/* Submit Button */
.btn-submit {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-pixel);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 0 rgba(0,0,0,0.1); /* Retro solid shadow */
  transition: all 0.1s var(--ease-snappy);
  margin-top: 12px;
  letter-spacing: 0.05em;
}

.btn-submit:active {
  transform: translateY(2px);
  box-shadow: 0 0 0 rgba(0,0,0,0.1);
}

.btn-submit.danger { background: var(--danger); }
.btn-submit.success { background: var(--success); }
.btn-submit.primary { background: var(--primary); }

/* Auth Gate */
.auth-gate {
  text-align: center;
  padding: 40px;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid var(--border);
}
.btn-google {
  margin-top: 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  font-family: var(--font-pixel);
}

.btn-google svg { width: 18px; }
</style>