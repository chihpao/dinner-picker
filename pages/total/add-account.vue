<template>
  <div class="add-account-page">
    <AppHeader title="新增帳戶" :is-expenses="true" back-to="/total/accounts">
    </AppHeader>

    <main class="expense-main">
      <div class="panel add-panel">
        <div class="panel-head">
          <p class="panel-kicker">Account Setup</p>
          <h2>建立新帳戶</h2>
          <p>先設定名稱、類型與初始金額，後續可在帳戶管理調整。</p>
        </div>

        <form @submit.prevent="handleAdd" class="account-form">
          <label>
            <span>帳戶名稱</span>
            <input v-model="form.name" type="text" placeholder="例如：台新銀行" required>
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
          <div class="form-actions">
            <button class="btn primary" type="submit">確認新增</button>
            <NuxtLink to="/total/accounts" class="btn">返回列表</NuxtLink>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { addAccount } = useAccounts()
const router = useRouter()

const form = reactive({
  name: '',
  kind: 'bank' as 'bank' | 'cash' | 'card',
  balance: 0
})

const handleAdd = async () => {
  if (!user.value) {
    alert('請先登入')
    return
  }
  if (!form.name.trim()) return
  if (form.balance < 0) {
    alert('請輸入正確的初始金額')
    return
  }
  
  try {
    await addAccount({
      id: generateUUID(),
      name: form.name.trim(),
      kind: form.kind,
      balance: Math.round(form.balance),
      createdAt: Date.now(),
      user_id: user.value.id
    })
    router.push('/total/accounts')
  } catch (e) {
    console.error(e)
    alert('新增失敗，請稍後再試')
  }
}

useHead({
  title: '新增帳戶｜今晚吃哪家？',
  meta: [
    { name: 'theme-color', content: '#1b1b1b' }
  ]
})
</script>

<style scoped>
.add-account-page {
  display: grid;
  gap: 14px;
}

.add-panel {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94));
  box-shadow: var(--shadow-sm);
}

.panel-head {
  display: grid;
  gap: 4px;
  margin-bottom: 14px;
}

.panel-head h2 {
  margin: 0;
  font-size: 20px;
  color: var(--ink);
}

.panel-head p {
  margin: 0;
  font-size: 13px;
  color: var(--ink-light);
}

.panel-kicker {
  font-family: var(--font-pixel);
  color: var(--primary);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.account-form {
  display: grid;
  gap: 14px;
}

.account-form label {
  display: grid;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink-light);
}

.account-form input,
.account-form select {
  width: 100%;
  height: 46px;
  padding: 0 12px;
  font-family: var(--font-sans);
  font-size: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
  outline: none;
}

.account-form input:focus,
.account-form select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.form-actions .btn {
  min-height: 44px;
}

@media (max-width: 720px) {
  .add-account-page {
    gap: 12px;
  }

  .add-panel {
    padding: 14px 12px;
  }

  .panel-head h2 {
    font-size: 18px;
  }

  .panel-head p {
    font-size: 12px;
  }
}
</style>
