

export interface BudgetConfig {
    monthlyBudget: number
    weeklyBudget: number
    user_id: string
}

const STORAGE_KEY = 'dinnerPicker.budget.v1'

export const useBudget = () => {
    const { user } = useAuth()
    const { summaries } = useTotalExpenses()

    const monthlyBudget = useState<number>('budget-monthly', () => 0)
    const weeklyBudget = useState<number>('budget-weekly', () => 0)

    // ── Load / Save ─────────────────────────────────────
    const loadBudget = () => {
        if (!import.meta.client || !user.value) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const parsed: BudgetConfig[] = raw ? JSON.parse(raw) : []
            const mine = parsed.find(b => b.user_id === user.value?.id)
            if (mine) {
                monthlyBudget.value = mine.monthlyBudget
                weeklyBudget.value = mine.weeklyBudget
            }
        } catch (err) {
            console.error('Failed to load budget config', err)
        }
    }

    const saveBudget = () => {
        if (!import.meta.client || !user.value) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const existing: BudgetConfig[] = raw ? JSON.parse(raw) : []
            const others = existing.filter(b => b.user_id !== user.value?.id)
            others.push({
                monthlyBudget: monthlyBudget.value,
                weeklyBudget: weeklyBudget.value,
                user_id: user.value.id,
            })
            localStorage.setItem(STORAGE_KEY, JSON.stringify(others))
        } catch (err) {
            console.error('Failed to save budget config', err)
        }
    }

    const setMonthlyBudget = (amount: number) => {
        monthlyBudget.value = Math.max(0, Math.round(amount))
        saveBudget()
    }

    const setWeeklyBudget = (amount: number) => {
        weeklyBudget.value = Math.max(0, Math.round(amount))
        saveBudget()
    }

    // ── Computed stats ──────────────────────────────────
    const monthSpent = computed(() => summaries.value.monthExpense)
    const weekSpent = computed(() => summaries.value.weekExpense)

    const monthRemaining = computed(() =>
        monthlyBudget.value > 0 ? monthlyBudget.value - monthSpent.value : 0
    )
    const weekRemaining = computed(() =>
        weeklyBudget.value > 0 ? weeklyBudget.value - weekSpent.value : 0
    )

    const monthPercent = computed(() =>
        monthlyBudget.value > 0
            ? Math.min(100, Math.round((monthSpent.value / monthlyBudget.value) * 100))
            : 0
    )
    const weekPercent = computed(() =>
        weeklyBudget.value > 0
            ? Math.min(100, Math.round((weekSpent.value / weeklyBudget.value) * 100))
            : 0
    )

    /** 'safe' | 'warning' | 'danger' */
    const monthStatus = computed(() => {
        if (monthPercent.value >= 100) return 'danger'
        if (monthPercent.value >= 75) return 'warning'
        return 'safe'
    })
    const weekStatus = computed(() => {
        if (weekPercent.value >= 100) return 'danger'
        if (weekPercent.value >= 75) return 'warning'
        return 'safe'
    })

    // ── Computed: daily pace ────────────────────────────
    const monthDailyPace = computed(() => {
        if (monthlyBudget.value <= 0) return null
        const today = new Date()
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const dayOfMonth = today.getDate()
        const remaining = monthRemaining.value
        const daysLeft = daysInMonth - dayOfMonth + 1 // include today
        if (remaining <= 0 || daysLeft <= 0) return 0
        return Math.round(remaining / daysLeft)
    })

    const weekDailyPace = computed(() => {
        if (weeklyBudget.value <= 0) return null
        const today = new Date()
        const dayOfWeek = today.getDay()
        // Week starts Monday: Mon=1..Sun=7
        const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek
        const daysLeft = 7 - adjustedDay + 1 // include today
        const remaining = weekRemaining.value
        if (remaining <= 0 || daysLeft <= 0) return 0
        return Math.round(remaining / daysLeft)
    })

    const hasBudget = computed(() => monthlyBudget.value > 0 || weeklyBudget.value > 0)

    return {
        monthlyBudget,
        weeklyBudget,
        monthSpent,
        weekSpent,
        monthRemaining,
        weekRemaining,
        monthPercent,
        weekPercent,
        monthStatus,
        weekStatus,
        monthDailyPace,
        weekDailyPace,
        hasBudget,
        loadBudget,
        setMonthlyBudget,
        setWeeklyBudget,
    }
}
