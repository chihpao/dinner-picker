import { defineStore } from 'pinia'
import { isTransferEntry } from '~/utils'

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: '飲食' },
  { value: 'misc', label: '雜費' },
  { value: 'entertainment', label: '娛樂' },
  { value: 'tobacco', label: '菸' },
  { value: 'saving', label: '存款' },
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value']

export interface ExpenseEntry {
  id: string
  date: string
  amount: number
  note: string
  createdAt: number
  user_id: string
  account_id?: string | null
  sub_type?: string
  category?: string | null
}

export const useExpensesStore = defineStore('expenses', () => {
  const supa = useSupabase()
  const auth = useAuthStore()

  const entries = ref<ExpenseEntry[]>([])
  const loading = ref(false)

  const STORAGE_KEY = 'dinnerPicker.total.expenses.v1'
  const PENDING_KEY = 'dinnerPicker.total.expenses.pending'
  const TABLE = 'total_expenses'

  const getStore = (key: string): ExpenseEntry[] => {
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter((e: ExpenseEntry) => e.user_id === auth.user?.id) : []
    } catch { return [] }
  }

  const setStore = (key: string, newEntries: ExpenseEntry[]) => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : []
      const others = Array.isArray(existing) ? existing.filter((e: ExpenseEntry) => e.user_id !== auth.user?.id) : []
      localStorage.setItem(key, JSON.stringify([...others, ...newEntries]))
    } catch {}
  }

  const fetchEntriesFromSupabase = async () => {
    if (!auth.user) return []
    loading.value = true
    const { data, error } = await supa
      .from(TABLE)
      .select('*')
      .eq('user_id', auth.user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    loading.value = false
    if (error) throw error
    return (data ?? []).map(entry => ({
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note ?? '',
      createdAt: entry.created_at ? new Date(entry.created_at).getTime() : Date.now(),
      user_id: entry.user_id,
      account_id: entry.account_id ?? null,
      sub_type: entry.sub_type ?? 'general',
      category: entry.category ?? null,
    }))
  }

  const syncPending = async () => {
    if (!auth.user) return
    const pending = getStore(PENDING_KEY)
    if (!pending.length) return

    const payloads = pending.map(entry => ({
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note ?? '',
      created_at: new Date(entry.createdAt).toISOString(),
      user_id: auth.user!.id,
      sub_type: entry.sub_type ?? 'general',
      category: entry.category ?? null,
      account_id: entry.account_id ?? null,
    }))

    try {
      const { error } = await supa.from(TABLE).insert(payloads)
      if (error) throw error
      setStore(PENDING_KEY, [])
    } catch (err) {
      console.error('Batch sync failed', err)
    }
  }

  const loadEntries = async () => {
    if (!auth.user) {
      entries.value = []
      return
    }
    try { await syncPending() } catch {}
    try {
      const remoteEntries = await fetchEntriesFromSupabase()
      const pending = getStore(PENDING_KEY)
      const existingIds = new Set(remoteEntries.map((e: ExpenseEntry) => e.id))
      entries.value = [...pending.filter(e => !existingIds.has(e.id)), ...remoteEntries]
      setStore(STORAGE_KEY, entries.value)
    } catch {
      const local = getStore(STORAGE_KEY)
      const pending = getStore(PENDING_KEY)
      const existingIds = new Set(local.map(e => e.id))
      entries.value = [...pending.filter(e => !existingIds.has(e.id)), ...local]
    }
  }

  const addEntry = async (entry: ExpenseEntry) => {
    if (!auth.user) return
    const pending = getStore(PENDING_KEY)
    pending.unshift(entry)
    setStore(PENDING_KEY, pending)
    entries.value.unshift(entry)
    setStore(STORAGE_KEY, entries.value)

    try {
      const payload = {
        id: entry.id,
        date: entry.date,
        amount: entry.amount,
        note: entry.note ?? '',
        created_at: new Date(entry.createdAt).toISOString(),
        user_id: auth.user.id,
        sub_type: entry.sub_type ?? 'general',
        category: entry.category ?? null,
        account_id: entry.account_id ?? null,
      }
      const { error } = await supa.from(TABLE).insert(payload)
      if (error) throw error
      setStore(PENDING_KEY, getStore(PENDING_KEY).filter(e => e.id !== entry.id))
    } catch {}
  }

  const deleteEntry = async (id: string) => {
    if (!auth.user) return
    try {
      const { error } = await supa.from(TABLE).delete().eq('id', id).eq('user_id', auth.user.id)
      if (error) throw error
      entries.value = entries.value.filter(e => e.id !== id)
      setStore(STORAGE_KEY, entries.value)
      setStore(PENDING_KEY, getStore(PENDING_KEY).filter(e => e.id !== id))
    } catch (err) {
      alert(`刪除失敗：${(err as Error).message}`)
    }
  }

  const updateEntry = async (updated: ExpenseEntry) => {
    if (!auth.user) return
    const original = entries.value.find(e => e.id === updated.id)
    if (!original) return

    const merged: ExpenseEntry = { ...original, ...updated, user_id: auth.user.id }
    const previousEntries = [...entries.value]
    entries.value = entries.value.map(e => e.id === merged.id ? merged : e)
    setStore(STORAGE_KEY, entries.value)

    const pending = getStore(PENDING_KEY)
    const pendingIndex = pending.findIndex(e => e.id === merged.id)
    if (pendingIndex !== -1) {
      pending[pendingIndex] = merged
      setStore(PENDING_KEY, pending)
      return
    }

    try {
      const { error } = await supa.from(TABLE)
        .update({
          date: merged.date,
          amount: merged.amount,
          note: merged.note ?? '',
          sub_type: merged.sub_type ?? 'general',
          category: merged.category ?? null,
          account_id: merged.account_id ?? null,
        })
        .eq('id', merged.id)
        .eq('user_id', auth.user.id)
      if (error) throw error
    } catch (err) {
      entries.value = previousEntries
      setStore(STORAGE_KEY, previousEntries)
      alert(`更新失敗：${(err as Error).message}`)
    }
  }

  const clearAll = async () => {
    if (!auth.user) return
    try {
      const { error } = await supa.from(TABLE).delete().eq('user_id', auth.user.id)
      if (error) throw error
      entries.value = []
      setStore(STORAGE_KEY, [])
      setStore(PENDING_KEY, [])
    } catch (err) {
      alert(`清空失敗：${(err as Error).message}`)
    }
  }

  const calculateSummaries = (filterFn?: (e: ExpenseEntry) => boolean) => {
    const today = new Date()
    const weekStart = startOfWeek(today)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const yearStart = new Date(today.getFullYear(), 0, 1)
    const yearEnd = new Date(today.getFullYear() + 1, 0, 1)

    const initial = {
      today: 0, todayExpense: 0, todayIncome: 0,
      week: 0, weekExpense: 0, weekIncome: 0,
      month: 0, monthExpense: 0, monthIncome: 0,
      year: 0, yearExpense: 0, yearIncome: 0,
    }

    return entries.value.reduce((acc, entry) => {
      if (isTransferEntry(entry)) return acc
      if (filterFn && !filterFn(entry)) return acc

      const entryDate = parseISODate(entry.date)
      const isIncome = entry.amount < 0
      const absAmount = Math.abs(entry.amount)

      const updatePeriod = (period: 'today' | 'week' | 'month' | 'year') => {
        acc[period] += entry.amount
        if (isIncome) acc[`${period}Income`] += absAmount
        else acc[`${period}Expense`] += absAmount
      }

      if (isSameDay(entryDate, today)) updatePeriod('today')
      if (entryDate >= weekStart && entryDate < weekEnd) updatePeriod('week')
      if (entryDate >= monthStart && entryDate < monthEnd) updatePeriod('month')
      if (entryDate >= yearStart && entryDate < yearEnd) updatePeriod('year')

      return acc
    }, initial)
  }

  const summaries = computed(() => calculateSummaries())
  const zibaoSummaries = computed(() => calculateSummaries((e) => e.sub_type === 'zibao'))

  return {
    entries,
    loading,
    summaries,
    zibaoSummaries,
    loadEntries,
    addEntry,
    deleteEntry,
    updateEntry,
    clearAll
  }
})
