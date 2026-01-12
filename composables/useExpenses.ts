import { computed } from 'vue'

export interface ExpenseEntry {
    id: string
    date: string
    amount: number
    note: string
    createdAt: number
    user_id: string
    account_id?: string | null
    sub_type?: string
}

type LedgerKind = 'total'

const ledgerConfig: Record<LedgerKind, {
    storageKey: string
    pendingKey: string
    table: string
    statePrefix: string
    includeAccount: boolean
}> = {
    total: {
        storageKey: 'dinnerPicker.total.expenses.v1',
        pendingKey: 'dinnerPicker.total.expenses.pending',
        table: 'total_expenses',
        statePrefix: 'total-expense',
        includeAccount: true
    }
}

export const useExpenses = (ledger: LedgerKind = 'total') => {
    const config = ledgerConfig[ledger]
    const STORAGE_KEY = config.storageKey
    const PENDING_KEY = config.pendingKey
    const TABLE = config.table

    const supa = useSupabase()
    const { user } = useAuth()

    const entries = useState<ExpenseEntry[]>(`${config.statePrefix}-entries`, () => [])
    const loading = useState(`${config.statePrefix}-loading`, () => false)

    // Loaders
    const loadLocalEntries = (): ExpenseEntry[] => {
        if (!import.meta.client) return []
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const parsed = raw ? JSON.parse(raw) : []
            if (!Array.isArray(parsed)) return []
            return parsed.filter((entry: ExpenseEntry) => entry.user_id === user.value?.id)
        } catch (err) {
            console.error('Failed to parse local entries', err)
            return []
        }
    }

    const saveLocalEntries = (newEntries: ExpenseEntry[]) => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const existing = raw ? JSON.parse(raw) : []
            const others = Array.isArray(existing) ? existing.filter((e: ExpenseEntry) => e.user_id !== user.value?.id) : []
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...newEntries]))
        } catch (err) {
            console.error('Failed to save local entries', err)
        }
    }

    const loadPendingEntries = (): ExpenseEntry[] => {
        if (!import.meta.client) return []
        try {
            const raw = localStorage.getItem(PENDING_KEY)
            const parsed = raw ? JSON.parse(raw) : []
            if (!Array.isArray(parsed)) return []
            return parsed.filter((entry: ExpenseEntry) => entry.user_id === user.value?.id)
        } catch (err) {
            console.error('Failed to parse pending entries', err)
            return []
        }
    }

    const savePendingEntries = (newEntries: ExpenseEntry[]) => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(PENDING_KEY)
            const existing = raw ? JSON.parse(raw) : []
            const others = Array.isArray(existing) ? existing.filter((e: ExpenseEntry) => e.user_id !== user.value?.id) : []
            localStorage.setItem(PENDING_KEY, JSON.stringify([...others, ...newEntries]))
        } catch (err) {
            console.error('Failed to save pending entries', err)
        }
    }

    const fetchEntriesFromSupabase = async () => {
        if (!user.value) return []
        loading.value = true
        const { data, error } = await supa
            .from(TABLE)
            .select('*')
            .eq('user_id', user.value.id)
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
        }))
    }

    const syncPending = async () => {
        if (!user.value) return
        const pending = loadPendingEntries()
        if (!pending.length) return
        const stillPending: ExpenseEntry[] = []
        for (const entry of pending) {
            try {
                const payload = {
                    id: entry.id,
                    date: entry.date,
                    amount: entry.amount,
                    note: entry.note ?? '',
                    created_at: new Date(entry.createdAt).toISOString(),
                    user_id: user.value.id,
                    sub_type: entry.sub_type ?? 'general',
                    ...(config.includeAccount ? { account_id: entry.account_id ?? null } : {}),
                }
                const { error } = await supa.from(TABLE).insert(payload)
                if (error) throw error
            } catch (err) {
                console.error('Retry pending failed', err)
                stillPending.push(entry)
            }
        }
        savePendingEntries(stillPending)
    }

    const loadEntries = async () => {
        if (!user.value) {
            entries.value = []
            return
        }

        try {
            await syncPending()
        } catch (err) {
            console.error('sync pending failed', err)
        }

        try {
            const remoteEntries = await fetchEntriesFromSupabase()
            const pending = loadPendingEntries()
            const existingIds = new Set(remoteEntries.map((e: ExpenseEntry) => e.id))
            // Merge pending (pending wins)
            entries.value = [...pending.filter(e => !existingIds.has(e.id)), ...remoteEntries]
            saveLocalEntries(entries.value)
        } catch (err) {
            console.error('Supabase read failed, using local', err)
            const local = loadLocalEntries()
            const pending = loadPendingEntries()
            const existingIds = new Set(local.map(e => e.id))
            entries.value = [...pending.filter(e => !existingIds.has(e.id)), ...local]
        }
    }

    const addEntry = async (entry: ExpenseEntry) => {
        if (!user.value) return

        // Optimistic
        const pending = loadPendingEntries()
        pending.unshift(entry)
        savePendingEntries(pending)

        // Update UI immediately
        entries.value.unshift(entry)
        saveLocalEntries(entries.value)

        try {
            const payload = {
                id: entry.id,
                date: entry.date,
                amount: entry.amount,
                note: entry.note ?? '',
                created_at: new Date(entry.createdAt).toISOString(),
                user_id: user.value.id,
                sub_type: entry.sub_type ?? 'general',
                ...(config.includeAccount ? { account_id: entry.account_id ?? null } : {}),
            }
            const { error } = await supa.from(TABLE).insert(payload)
            if (error) throw error

            // Success: remove from pending
            const remainingPending = loadPendingEntries().filter(e => e.id !== entry.id)
            savePendingEntries(remainingPending)
        } catch (err) {
            console.warn('Cloud sync failed, kept in pending', err)
        }
    }

    const deleteEntry = async (id: string) => {
        if (!user.value) return

        try {
            const { error } = await supa.from(TABLE).delete().eq('id', id).eq('user_id', user.value.id)
            if (error) throw error
            
            // Remove from UI and Local Storage
            entries.value = entries.value.filter(e => e.id !== id)
            saveLocalEntries(entries.value)

            // Remove from Pending Storage (Critical fix for reappearing entries)
            const pending = loadPendingEntries()
            const newPending = pending.filter(e => e.id !== id)
            if (newPending.length !== pending.length) {
                savePendingEntries(newPending)
            }
        } catch (err) {
            alert(`刪除失敗：${(err as Error).message}`)
        }
    }

    const updateEntry = async (updated: ExpenseEntry) => {
        if (!user.value) return
        const original = entries.value.find(e => e.id === updated.id)
        if (!original) return

        // Keep immutable data while applying edits
        const merged: ExpenseEntry = {
            ...original,
            ...updated,
            user_id: user.value.id,
        }
        const previousEntries = [...entries.value]

        // Update UI + local cache optimistically
        entries.value = entries.value.map(e => e.id === merged.id ? merged : e)
        saveLocalEntries(entries.value)

        // If the entry is still pending sync, only update local pending store
        const pending = loadPendingEntries()
        const pendingIndex = pending.findIndex(e => e.id === merged.id)
        if (pendingIndex !== -1) {
            pending[pendingIndex] = merged
            savePendingEntries(pending)
            return
        }

        try {
            const { error } = await supa.from(TABLE)
                .update({
                    date: merged.date,
                    amount: merged.amount,
                    note: merged.note ?? '',
                    sub_type: merged.sub_type ?? 'general',
                    ...(config.includeAccount ? { account_id: merged.account_id ?? null } : {}),
                })
                .eq('id', merged.id)
                .eq('user_id', user.value.id)
            if (error) throw error
        } catch (err) {
            entries.value = previousEntries
            saveLocalEntries(previousEntries)
            alert(`更新失敗：${(err as Error).message}`)
        }
    }

    const clearAll = async () => {
        if (!user.value) return

        try {
            const { error } = await supa.from(TABLE).delete().eq('user_id', user.value.id)
            if (error) throw error
            entries.value = []
            saveLocalEntries([])
            savePendingEntries([])
        } catch (err) {
            alert(`清空失敗：${(err as Error).message}`)
        }
    }

    const calculateSummaries = (filterFn?: (e: ExpenseEntry) => boolean) => {
        const today = new Date()
        const todayISO = toISODate(today)
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
            // Ignore transfer entries for summary statistics
            if (entry.note && entry.note.includes('[轉帳]')) {
                return acc
            }
            
            // Custom filter
            if (filterFn && !filterFn(entry)) {
                return acc
            }

            const entryDate = parseISODate(entry.date)
            const isIncome = entry.amount < 0
            const absAmount = Math.abs(entry.amount)
            
            // Helper to update a specific period
            const updatePeriod = (period: 'today' | 'week' | 'month' | 'year') => {
                // Net total (Sum of signed amounts)
                acc[period] += entry.amount

                if (isIncome) {
                    acc[`${period}Income`] += absAmount
                } else {
                    acc[`${period}Expense`] += absAmount
                }
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
}

export const useTotalExpenses = () => useExpenses('total')
