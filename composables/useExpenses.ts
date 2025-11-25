import { ref, computed, watch } from 'vue'

export interface ExpenseEntry {
    id: string
    date: string
    amount: number
    note: string
    createdAt: number
    user_id: string
}

export const useExpenses = () => {
    const STORAGE_KEY = 'dinnerPicker.expenses.v1'
    const PENDING_KEY = 'dinnerPicker.expenses.pending'
    const TABLE = 'expenses'

    const supa = useSupabase()
    const { user } = useAuth()

    const entries = useState<ExpenseEntry[]>('expense-entries', () => [])
    const loading = useState('expenses-loading', () => false)

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
            entries.value = entries.value.filter(e => e.id !== id)
            saveLocalEntries(entries.value)
        } catch (err) {
            alert(`刪除失敗：${err.message}`)
        }
    }

    const clearAll = async () => {
        if (!user.value) return
        if (!confirm('確定要刪除所有紀錄嗎？此操作無法復原。')) return

        try {
            const { error } = await supa.from(TABLE).delete().eq('user_id', user.value.id)
            if (error) throw error
            entries.value = []
            saveLocalEntries([])
            savePendingEntries([])
        } catch (err) {
            alert(`清空失敗：${err.message}`)
        }
    }

    const summaries = computed(() => {
        const today = new Date()
        const todayISO = toISODate(today)
        const weekStart = startOfWeek(today)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

        return entries.value.reduce((acc, entry) => {
            const entryDate = parseISODate(entry.date)
            if (isSameDay(entryDate, today)) acc.today += entry.amount
            if (entryDate >= weekStart && entryDate < weekEnd) acc.week += entry.amount
            if (entryDate >= monthStart && entryDate < monthEnd) acc.month += entry.amount
            return acc
        }, { today: 0, week: 0, month: 0 })
    })

    return {
        entries,
        loading,
        summaries,
        loadEntries,
        addEntry,
        deleteEntry,
        clearAll
    }
}
