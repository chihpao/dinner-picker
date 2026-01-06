export interface AccountEntry {
    id: string
    name: string
    kind: 'bank' | 'cash' | 'card'
    balance: number
    createdAt: number
    user_id: string
}

export const useAccounts = () => {
    const STORAGE_KEY = 'dinnerPicker.accounts.v1'
    const PENDING_KEY = 'dinnerPicker.accounts.pending'
    const TABLE = 'accounts'

    const supa = useSupabase()
    const { user } = useAuth()

    const accounts = useState<AccountEntry[]>('accounts', () => [])
    const loading = useState('accounts-loading', () => false)

    const loadLocalAccounts = (): AccountEntry[] => {
        if (!import.meta.client) return []
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const parsed = raw ? JSON.parse(raw) : []
            if (!Array.isArray(parsed)) return []
            return parsed.filter((entry: AccountEntry) => entry.user_id === user.value?.id)
        } catch (err) {
            console.error('Failed to parse local accounts', err)
            return []
        }
    }

    const saveLocalAccounts = (newEntries: AccountEntry[]) => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const existing = raw ? JSON.parse(raw) : []
            const others = Array.isArray(existing) ? existing.filter((e: AccountEntry) => e.user_id !== user.value?.id) : []
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...newEntries]))
        } catch (err) {
            console.error('Failed to save local accounts', err)
        }
    }

    const loadPendingAccounts = (): AccountEntry[] => {
        if (!import.meta.client) return []
        try {
            const raw = localStorage.getItem(PENDING_KEY)
            const parsed = raw ? JSON.parse(raw) : []
            if (!Array.isArray(parsed)) return []
            return parsed.filter((entry: AccountEntry) => entry.user_id === user.value?.id)
        } catch (err) {
            console.error('Failed to parse pending accounts', err)
            return []
        }
    }

    const savePendingAccounts = (newEntries: AccountEntry[]) => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(PENDING_KEY)
            const existing = raw ? JSON.parse(raw) : []
            const others = Array.isArray(existing) ? existing.filter((e: AccountEntry) => e.user_id !== user.value?.id) : []
            localStorage.setItem(PENDING_KEY, JSON.stringify([...others, ...newEntries]))
        } catch (err) {
            console.error('Failed to save pending accounts', err)
        }
    }

    const fetchAccountsFromSupabase = async () => {
        if (!user.value) return []
        loading.value = true
        const { data, error } = await supa
            .from(TABLE)
            .select('*')
            .eq('user_id', user.value.id)
            .order('created_at', { ascending: false })
        loading.value = false
        if (error) throw error
        return (data ?? []).map(account => ({
            id: account.id,
            name: account.name,
            kind: account.kind ?? 'bank',
            balance: account.balance ?? 0,
            createdAt: account.created_at ? new Date(account.created_at).getTime() : Date.now(),
            user_id: account.user_id,
        }))
    }

    const syncPending = async () => {
        if (!user.value) return
        const pending = loadPendingAccounts()
        if (!pending.length) return
        const stillPending: AccountEntry[] = []
        for (const account of pending) {
            try {
                const payload = {
                    id: account.id,
                    name: account.name,
                    kind: account.kind,
                    balance: account.balance ?? 0,
                    created_at: new Date(account.createdAt).toISOString(),
                    user_id: user.value.id,
                }
                const { error } = await supa.from(TABLE).insert(payload)
                if (error) throw error
            } catch (err) {
                console.error('Retry pending accounts failed', err)
                stillPending.push(account)
            }
        }
        savePendingAccounts(stillPending)
    }

    const loadAccounts = async () => {
        if (!user.value) {
            accounts.value = []
            return
        }

        try {
            await syncPending()
        } catch (err) {
            console.error('sync pending accounts failed', err)
        }

        try {
            const remote = await fetchAccountsFromSupabase()
            const pending = loadPendingAccounts()
            const existingIds = new Set(remote.map((a: AccountEntry) => a.id))
            accounts.value = [...pending.filter(a => !existingIds.has(a.id)), ...remote]
            saveLocalAccounts(accounts.value)
        } catch (err) {
            console.error('Supabase read failed for accounts, using local', err)
            const local = loadLocalAccounts()
            const pending = loadPendingAccounts()
            const existingIds = new Set(local.map(a => a.id))
            accounts.value = [...pending.filter(a => !existingIds.has(a.id)), ...local]
        }
    }

    const addAccount = async (account: AccountEntry) => {
        if (!user.value) return

        const pending = loadPendingAccounts()
        pending.unshift(account)
        savePendingAccounts(pending)

        accounts.value.unshift(account)
        saveLocalAccounts(accounts.value)

        try {
            const payload = {
                id: account.id,
                name: account.name,
                kind: account.kind,
                balance: account.balance ?? 0,
                created_at: new Date(account.createdAt).toISOString(),
                user_id: user.value.id,
            }
            const { error } = await supa.from(TABLE).insert(payload)
            if (error) throw error

            const remainingPending = loadPendingAccounts().filter(a => a.id !== account.id)
            savePendingAccounts(remainingPending)
        } catch (err) {
            console.warn('Cloud sync failed for accounts, kept in pending', err)
        }
    }

    const deleteAccount = async (id: string) => {
        if (!user.value) return
        const previous = [...accounts.value]
        accounts.value = accounts.value.filter(a => a.id !== id)
        saveLocalAccounts(accounts.value)

        try {
            const { error } = await supa.from(TABLE).delete().eq('id', id).eq('user_id', user.value.id)
            if (error) throw error
        } catch (err) {
            accounts.value = previous
            saveLocalAccounts(previous)
            alert(`刪除帳戶失敗：${(err as Error).message}`)
        }
    }

    const updateAccount = async (updated: AccountEntry) => {
        if (!user.value) return
        const original = accounts.value.find(a => a.id === updated.id)
        if (!original) return

        const merged: AccountEntry = {
            ...original,
            ...updated,
            user_id: user.value.id,
        }
        const previous = [...accounts.value]

        accounts.value = accounts.value.map(a => a.id === merged.id ? merged : a)
        saveLocalAccounts(accounts.value)

        const pending = loadPendingAccounts()
        const pendingIndex = pending.findIndex(a => a.id === merged.id)
        if (pendingIndex !== -1) {
            pending[pendingIndex] = merged
            savePendingAccounts(pending)
            return
        }

        try {
            const { error } = await supa.from(TABLE)
                .update({
                    name: merged.name,
                    kind: merged.kind,
                    balance: merged.balance ?? 0,
                })
                .eq('id', merged.id)
                .eq('user_id', user.value.id)
            if (error) throw error
        } catch (err) {
            accounts.value = previous
            saveLocalAccounts(previous)
            alert(`更新帳戶失敗：${(err as Error).message}`)
        }
    }

    return {
        accounts,
        loading,
        loadAccounts,
        addAccount,
        updateAccount,
        deleteAccount
    }
}
