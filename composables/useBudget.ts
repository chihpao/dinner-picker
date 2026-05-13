

export interface BudgetRule {
    id: string
    user_id: string
    category: string          // 'test1' | 'test2' | ... | 'all'
    amount: number            // 預算金額 (NT$)
    start_date: string        // YYYY-MM-DD
    end_date: string          // YYYY-MM-DD
    created_at: number
}

const TABLE = 'budget_rules'

export const useBudget = () => {
    const supa = useSupabase()
    const { user } = useAuth()
    const { entries } = useTotalExpenses()

    const budgetRules = useState<BudgetRule[]>('budget-rules', () => [])
    const loading = useState('budget-loading', () => false)

    // ── Load from Supabase ──────────────────────────────
    const loadBudgetRules = async () => {
        if (!user.value) {
            budgetRules.value = []
            return
        }
        loading.value = true
        try {
            const { data, error } = await supa
                .from(TABLE)
                .select('*')
                .eq('user_id', user.value.id)
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
        } catch (err) {
            console.error('Failed to load budget rules', err)
        } finally {
            loading.value = false
        }
    }

    // ── CRUD ────────────────────────────────────────────
    const addBudgetRule = async (rule: Omit<BudgetRule, 'id' | 'user_id' | 'created_at'>) => {
        if (!user.value) return
        const payload = {
            category: rule.category,
            amount: rule.amount,
            start_date: rule.start_date,
            end_date: rule.end_date,
            user_id: user.value.id,
        }
        try {
            const { data, error } = await supa
                .from(TABLE)
                .insert(payload)
                .select()
                .single()
            if (error) throw error
            if (data) {
                budgetRules.value.unshift({
                    id: data.id,
                    user_id: data.user_id,
                    category: data.category,
                    amount: data.amount,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    created_at: new Date(data.created_at).getTime(),
                })
            }
        } catch (err) {
            console.error('Failed to add budget rule', err)
            alert(`新增預算失敗：${(err as Error).message}`)
        }
    }

    const updateBudgetRule = async (id: string, updates: Partial<Pick<BudgetRule, 'category' | 'amount' | 'start_date' | 'end_date'>>) => {
        if (!user.value) return
        const prev = [...budgetRules.value]
        // Optimistic update
        budgetRules.value = budgetRules.value.map(r =>
            r.id === id ? { ...r, ...updates } : r
        )
        try {
            const { error } = await supa
                .from(TABLE)
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.value.id)
            if (error) throw error
        } catch (err) {
            budgetRules.value = prev
            console.error('Failed to update budget rule', err)
            alert(`更新預算失敗：${(err as Error).message}`)
        }
    }

    const deleteBudgetRule = async (id: string) => {
        if (!user.value) return
        try {
            const { error } = await supa
                .from(TABLE)
                .delete()
                .eq('id', id)
                .eq('user_id', user.value.id)
            if (error) throw error
            budgetRules.value = budgetRules.value.filter(r => r.id !== id)
        } catch (err) {
            console.error('Failed to delete budget rule', err)
            alert(`刪除預算失敗：${(err as Error).message}`)
        }
    }

    // ── Query helpers ───────────────────────────────────
    /** Rules where today falls within [start_date, end_date] */
    const activeBudgets = computed(() => {
        const todayStr = toISODate(new Date())
        return budgetRules.value.filter(r =>
            r.start_date <= todayStr && r.end_date >= todayStr
        )
    })

    /** Calculate how much was spent for a given category within a date range */
    const getCategorySpent = (category: string, startDate: string, endDate: string): number => {
        return entries.value.reduce((sum, entry) => {
            // Only count expenses (positive amounts), exclude transfers
            if (entry.amount <= 0) return sum
            if (entry.sub_type === 'transfer') return sum
            if (entry.note && entry.note.includes('[轉帳]')) return sum

            // Date range check
            if (entry.date < startDate || entry.date > endDate) return sum

            // Category check
            if (category !== 'all') {
                const entryCategory = entry.category ?? null
                if (entryCategory !== category) return sum
            }

            return sum + entry.amount
        }, 0)
    }

    /** Get progress info for a single budget rule */
    const getRuleProgress = (rule: BudgetRule) => {
        const spent = getCategorySpent(rule.category, rule.start_date, rule.end_date)
        const remaining = rule.amount - spent
        const percent = rule.amount > 0
            ? Math.min(100, Math.round((spent / rule.amount) * 100))
            : 0

        // Daily pace calculation
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
}
