import { defineStore } from 'pinia'

export interface BudgetRule {
  id: string
  user_id: string
  category: string
  amount: number
  start_date: string
  end_date: string
  created_at: number
}

export const useBudgetStore = defineStore('budget', () => {
  const supa = useSupabase()
  const auth = useAuthStore()
  const expenses = useExpensesStore()

  const TABLE = 'budget_rules'
  const STORAGE_KEY = 'dinnerPicker.budgetRules.v1'

  const budgetRules = ref<BudgetRule[]>([])
  const loading = ref(false)

  const saveLocalBudget = (rules: BudgetRule[]) => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const existing = raw ? JSON.parse(raw) : []
      const others = Array.isArray(existing) ? existing.filter((r: any) => r.user_id !== auth.user?.id) : []
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...rules]))
    } catch (err) {
      console.error(err)
    }
  }

  const loadLocalBudget = (): BudgetRule[] => {
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return []
      return parsed.filter((r: any) => r.user_id === auth.user?.id)
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const loadBudgetRules = async () => {
    if (!auth.user) {
      budgetRules.value = []
      return
    }
    loading.value = true
    try {
      const { data, error } = await supa
        .from(TABLE)
        .select('*')
        .eq('user_id', auth.user.id)
        .order('start_date', { ascending: false })

      if (error) throw error

      budgetRules.value = (data ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        category: r.category,
        amount: r.amount,
        start_date: r.start_date,
        end_date: r.end_date,
        created_at: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
      }))
      saveLocalBudget(budgetRules.value)
    } catch (err) {
      console.error(err)
      budgetRules.value = loadLocalBudget()
    } finally {
      loading.value = false
    }
  }

  const addBudgetRule = async (rule: Omit<BudgetRule, 'id' | 'user_id' | 'created_at'>) => {
    if (!auth.user) return
    const payload = {
      category: rule.category,
      amount: rule.amount,
      start_date: rule.start_date,
      end_date: rule.end_date,
      user_id: auth.user.id,
    }
    try {
      const { data, error } = await supa
        .from(TABLE)
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      if (data) {
        const newRuleObj = {
          id: data.id,
          user_id: data.user_id,
          category: data.category,
          amount: data.amount,
          start_date: data.start_date,
          end_date: data.end_date,
          created_at: new Date(data.created_at).getTime(),
        }
        budgetRules.value.unshift(newRuleObj)
        saveLocalBudget(budgetRules.value)
      }
    } catch (err) {
      console.error(err)
      alert(`新增預算失敗：${(err as Error).message}`)
    }
  }

  const updateBudgetRule = async (id: string, updates: Partial<Pick<BudgetRule, 'category' | 'amount' | 'start_date' | 'end_date'>>) => {
    if (!auth.user) return
    const prev = [...budgetRules.value]
    budgetRules.value = budgetRules.value.map(r => r.id === id ? { ...r, ...updates } : r)
    try {
      const { error } = await supa
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .eq('user_id', auth.user.id)
      if (error) throw error
      saveLocalBudget(budgetRules.value)
    } catch (err) {
      budgetRules.value = prev
      console.error(err)
      alert(`更新預算失敗：${(err as Error).message}`)
    }
  }

  const deleteBudgetRule = async (id: string) => {
    if (!auth.user) return
    try {
      const { error } = await supa
        .from(TABLE)
        .delete()
        .eq('id', id)
        .eq('user_id', auth.user.id)
      if (error) throw error
      budgetRules.value = budgetRules.value.filter(r => r.id !== id)
      saveLocalBudget(budgetRules.value)
    } catch (err) {
      console.error(err)
      alert(`刪除預算失敗：${(err as Error).message}`)
    }
  }

  const activeBudgets = computed(() => {
    const todayStr = toISODate(new Date())
    return budgetRules.value.filter(r => r.start_date <= todayStr && r.end_date >= todayStr)
  })

  const getCategorySpent = (category: string, startDate: string, endDate: string): number => {
    return expenses.entries.reduce((sum, entry) => {
      if (entry.amount <= 0) return sum
      if (entry.sub_type === 'transfer') return sum
      if (entry.note && entry.note.includes('[轉帳]')) return sum
      if (entry.date < startDate || entry.date > endDate) return sum
      if (category !== 'all' && (entry.category ?? null) !== category) return sum
      return sum + entry.amount
    }, 0)
  }

  const getRuleProgress = (rule: BudgetRule) => {
    const spent = getCategorySpent(rule.category, rule.start_date, rule.end_date)
    const remaining = rule.amount - spent
    const percent = rule.amount > 0 ? Math.min(100, Math.round((spent / rule.amount) * 100)) : 0
    const today = new Date()
    const endDate = parseISODate(rule.end_date)
    const diffMs = endDate.getTime() - today.getTime()
    const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1)
    const dailyPace = remaining > 0 ? Math.round(remaining / daysLeft) : 0
    let status: 'safe' | 'warning' | 'danger' = 'safe'
    if (percent >= 100) status = 'danger'
    else if (percent >= 75) status = 'warning'
    return { spent, remaining, percent, status, dailyPace, daysLeft }
  }

  const hasBudget = computed(() => budgetRules.value.length > 0)

  return {
    budgetRules,
    loading,
    activeBudgets,
    hasBudget,
    loadBudgetRules,
    addBudgetRule,
    updateBudgetRule,
    deleteBudgetRule,
    getCategorySpent,
    getRuleProgress,
  }
})
