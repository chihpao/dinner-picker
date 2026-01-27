<template>
  <div class="page-container">
    <AppHeader title="新增帳戶" :is-expenses="true" back-to="/total/accounts">
    </AppHeader>

    <main class="expense-main">
      <div class="panel">
        <form @submit.prevent="handleAdd" class="account-form">
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
          <div class="form-actions">
            <button class="btn primary" type="submit">確認新增</button>
            <NuxtLink to="/total/accounts" class="btn">取消</NuxtLink>
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
.account-form {
  display: grid;
  gap: 20px;
}

.account-form label {
  display: grid;
  gap: 8px;
  font-weight: bold;
}

.account-form input,
.account-form select {
  width: 100%;
  padding: 12px;
  font-family: var(--font-pixel);
  font-size: 16px;
  border: var(--border-width) solid var(--ink);
  background: var(--bg-body);
  box-sizing: border-box;
  outline: none;
}

.account-form input:focus,
.account-form select:focus {
  background: #fff;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.form-actions .btn {
  flex: 1;
}
</style>
