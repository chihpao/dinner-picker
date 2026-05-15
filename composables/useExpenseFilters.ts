import { ref } from 'vue'

export const useExpenseFilters = () => {
    const searchQuery = useState('expense-filter-search', () => '')
    const filterType = useState('expense-filter-type', () => 'all')
    const filterCategory = useState('expense-filter-category', () => 'all')
    const startDate = useState('expense-filter-start-date', () => '')
    const endDate = useState('expense-filter-end-date', () => '')

    const resetFilters = () => {
        searchQuery.value = ''
        filterType.value = 'all'
        filterCategory.value = 'all'
        startDate.value = ''
        endDate.value = ''
    }

    const setBudgetFilter = (category: string, start: string, end: string) => {
        resetFilters()
        filterCategory.value = category
        startDate.value = start
        endDate.value = end
        filterType.value = 'expense' // Budgets only track expenses
    }

    const hasActiveFilters = computed(() => {
        return searchQuery.value !== '' || 
               filterType.value !== 'all' || 
               filterCategory.value !== 'all' || 
               startDate.value !== '' || 
               endDate.value !== ''
    })

    return {
        searchQuery,
        filterType,
        filterCategory,
        startDate,
        endDate,
        resetFilters,
        setBudgetFilter,
        hasActiveFilters
    }
}
