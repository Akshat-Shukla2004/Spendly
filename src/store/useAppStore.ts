import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { generateId, todayISO } from '@/utils/helpers'
import { storage } from '@/services/storage'
import { SEED_EXPENSES, DEFAULT_BUDGET_LIMITS } from '@/utils/constants'
import { autoDetectCategory } from '@/utils/helpers'
import type {
  Expense,
  ExpenseFormData,
  BudgetLimit,
  FilterState,
  AIInsight,
  CategoryName,
} from '@/types'

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AppState {
  expenses: Expense[]
  budgetLimits: BudgetLimit[]
  filters: FilterState
  insight: AIInsight | null
  insightLoading: boolean
  insightError: string | null

  // Expense CRUD
  addExpense: (data: ExpenseFormData) => Expense
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => void
  deleteExpense: (id: string) => void
  importExpenses: (data: ExpenseFormData[]) => void

  // Budget
  setBudgetLimit: (category: CategoryName, limit: number) => void
  removeBudgetLimit: (category: CategoryName) => void

  // Filters
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void

  // AI
  setInsight: (insight: AIInsight) => void
  setInsightLoading: (loading: boolean) => void
  setInsightError: (error: string | null) => void

  // Data management
  resetToSeed: () => void
  clearAllData: () => void
}

// ─── Default Filter ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  dateFrom: '',
  dateTo: '',
  search: '',
  sortField: 'date',
  sortDir: 'desc',
}

// ─── Bootstrap Data ───────────────────────────────────────────────────────────

function loadInitialExpenses(): Expense[] {
  const saved = storage.getExpenses()
  if (saved.length > 0) return saved

  const seeded: Expense[] = SEED_EXPENSES.map((s) => ({
    id: generateId(),
    ...s,
    createdAt: new Date().toISOString(),
  }))
  storage.setExpenses(seeded)
  return seeded
}

function loadInitialBudgets(): BudgetLimit[] {
  const saved = storage.getBudgets()
  if (saved.length > 0) return saved
  storage.setBudgets(DEFAULT_BUDGET_LIMITS)
  return DEFAULT_BUDGET_LIMITS
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  immer((set) => ({
    expenses: loadInitialExpenses(),
    budgetLimits: loadInitialBudgets(),
    filters: DEFAULT_FILTERS,
    insight: null,
    insightLoading: false,
    insightError: null,

    // ── Expense CRUD ──────────────────────────────────────────────────────────

    addExpense: (data) => {
      const expense: Expense = {
        id: generateId(),
        ...data,
        category: data.category || autoDetectCategory(data.description),
        createdAt: new Date().toISOString(),
      }
      set((state) => {
        state.expenses.unshift(expense)
        storage.setExpenses(state.expenses)
      })
      return expense
    },

    updateExpense: (id, data) => {
      set((state) => {
        const idx = state.expenses.findIndex((e) => e.id === id)
        if (idx === -1) return
        Object.assign(state.expenses[idx], data)
        storage.setExpenses(state.expenses)
      })
    },

    deleteExpense: (id) => {
      set((state) => {
        state.expenses = state.expenses.filter((e) => e.id !== id)
        storage.setExpenses(state.expenses)
      })
    },

    importExpenses: (data) => {
      const newExpenses: Expense[] = data.map((d) => ({
        id: generateId(),
        ...d,
        createdAt: new Date().toISOString(),
      }))
      set((state) => {
        state.expenses = [...newExpenses, ...state.expenses]
        storage.setExpenses(state.expenses)
      })
    },

    // ── Budget ────────────────────────────────────────────────────────────────

    setBudgetLimit: (category, limit) => {
      set((state) => {
        const idx = state.budgetLimits.findIndex((b) => b.category === category)
        if (idx >= 0) {
          state.budgetLimits[idx].limit = limit
        } else {
          state.budgetLimits.push({ category, limit })
        }
        storage.setBudgets(state.budgetLimits)
      })
    },

    removeBudgetLimit: (category) => {
      set((state) => {
        state.budgetLimits = state.budgetLimits.filter((b) => b.category !== category)
        storage.setBudgets(state.budgetLimits)
      })
    },

    // ── Filters ───────────────────────────────────────────────────────────────

    setFilter: (key, value) => {
      set((state) => {
        (state.filters[key] as typeof value) = value
      })
    },

    resetFilters: () => {
      set((state) => {
        state.filters = DEFAULT_FILTERS
      })
    },

    // ── AI ────────────────────────────────────────────────────────────────────

    setInsight: (insight) => {
      set((state) => {
        state.insight = insight
        state.insightLoading = false
        state.insightError = null
      })
    },

    setInsightLoading: (loading) => {
      set((state) => {
        state.insightLoading = loading
      })
    },

    setInsightError: (error) => {
      set((state) => {
        state.insightError = error
        state.insightLoading = false
      })
    },

    // ── Data Management ───────────────────────────────────────────────────────

    resetToSeed: () => {
      const seeded: Expense[] = SEED_EXPENSES.map((s) => ({
        id: generateId(),
        ...s,
        createdAt: new Date().toISOString(),
      }))
      set((state) => {
        state.expenses = seeded
        state.budgetLimits = DEFAULT_BUDGET_LIMITS
        storage.setExpenses(seeded)
        storage.setBudgets(DEFAULT_BUDGET_LIMITS)
      })
    },

    clearAllData: () => {
      set((state) => {
        state.expenses = []
        storage.clearAll()
      })
    },
  }))
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectExpenses = (s: AppState) => s.expenses
export const selectBudgets = (s: AppState) => s.budgetLimits
export const selectFilters = (s: AppState) => s.filters
export const selectInsight = (s: AppState) => ({
  insight: s.insight,
  loading: s.insightLoading,
  error: s.insightError,
})

export const selectTotals = (s: AppState) => {
  const total = s.expenses.reduce((acc, e) => acc + e.amount, 0)
  const today = todayISO().slice(0, 7)
  const monthTotal = s.expenses
    .filter((e) => e.date.startsWith(today))
    .reduce((acc, e) => acc + e.amount, 0)
  return { total, monthTotal, count: s.expenses.length }
}
