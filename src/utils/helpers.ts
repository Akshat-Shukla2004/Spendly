import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { CATEGORY_RULES, CATEGORIES } from './constants'
import type {
  CategoryName,
  Expense,
  ExpenseFormData,
  CategorySummary,
  DailySummary,
  FilterState,
  BudgetLimit,
} from '@/types'

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string, fmt = 'MMM d'): string {
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr: string): string {
  return formatDate(dateStr, 'MMMM d, yyyy')
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// ─── Auto-categorisation ──────────────────────────────────────────────────────

export function autoDetectCategory(description: string): CategoryName {
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(description)) return category
  }
  return 'Other'
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationErrors {
  description?: string
  amount?: string
  date?: string
}

export function validateExpenseForm(data: Partial<ExpenseFormData>): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  } else if (data.description.trim().length < 2) {
    errors.description = 'Description must be at least 2 characters'
  } else if (data.description.trim().length > 120) {
    errors.description = 'Description must be under 120 characters'
  }

  if (data.amount === undefined || data.amount === null || String(data.amount) === '') {
    errors.amount = 'Amount is required'
  } else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    errors.amount = 'Amount must be a positive number'
  } else if (Number(data.amount) > 1_000_000) {
    errors.amount = 'Amount seems too large'
  }

  if (!data.date) {
    errors.date = 'Date is required'
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

// ─── Filtering & Sorting ──────────────────────────────────────────────────────

export function filterAndSortExpenses(
  expenses: Expense[],
  filters: FilterState
): Expense[] {
  let result = [...expenses]

  if (filters.category !== 'All') {
    result = result.filter((e) => e.category === filters.category)
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.note.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    )
  }

  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom)
  }
  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo)
  }

  result.sort((a, b) => {
    let cmp = 0
    if (filters.sortField === 'date') {
      cmp = a.date.localeCompare(b.date)
    } else if (filters.sortField === 'amount') {
      cmp = a.amount - b.amount
    } else if (filters.sortField === 'description') {
      cmp = a.description.localeCompare(b.description)
    }
    return filters.sortDir === 'asc' ? cmp : -cmp
  })

  return result
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function computeCategorySummaries(
  expenses: Expense[],
  budgetLimits: BudgetLimit[]
): CategorySummary[] {
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (Object.keys(CATEGORIES) as CategoryName[]).map((name) => {
    const subset = expenses.filter((e) => e.category === name)
    const catTotal = subset.reduce((s, e) => s + e.amount, 0)
    const budgetLimit = budgetLimits.find((b) => b.category === name)

    return {
      name,
      total: catTotal,
      count: subset.length,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
      meta: CATEGORIES[name],
      budgetLimit: budgetLimit?.limit,
      budgetUsed: budgetLimit ? (catTotal / budgetLimit.limit) * 100 : undefined,
    }
  })
}

export function computeDailySummaries(expenses: Expense[]): DailySummary[] {
  const map = new Map<string, { total: number; count: number }>()

  for (const e of expenses) {
    const existing = map.get(e.date) ?? { total: 0, count: 0 }
    map.set(e.date, { total: existing.total + e.amount, count: existing.count + 1 })
  }

  return [...map.entries()]
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function computeMonthlyTotal(expenses: Expense[], date = new Date()): number {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return expenses
    .filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), { start, end })
      } catch {
        return false
      }
    })
    .reduce((s, e) => s + e.amount, 0)
}

export function computeAveragePerDay(expenses: Expense[]): number {
  const uniqueDays = new Set(expenses.map((e) => e.date)).size
  if (uniqueDays === 0) return 0
  return expenses.reduce((s, e) => s + e.amount, 0) / uniqueDays
}

export function getBudgetAlerts(summaries: CategorySummary[]): CategorySummary[] {
  return summaries.filter((s) => s.budgetUsed !== undefined && s.budgetUsed >= 80)
}
