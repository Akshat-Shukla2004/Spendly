import type { Expense, BudgetLimit } from '@/types'

const STORAGE_KEYS = {
  EXPENSES: 'spendly:expenses:v1',
  BUDGETS: 'spendly:budgets:v1',
  INSIGHT: 'spendly:insight:v1',
} as const

// ─── Generic helpers ──────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] Failed to persist ${key}:`, err)
  }
}

// ─── Expense persistence ──────────────────────────────────────────────────────

export const storage = {
  getExpenses(): Expense[] {
    return safeGet<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  },

  setExpenses(expenses: Expense[]): void {
    safeSet(STORAGE_KEYS.EXPENSES, expenses)
  },

  getBudgets(): BudgetLimit[] {
    return safeGet<BudgetLimit[]>(STORAGE_KEYS.BUDGETS, [])
  },

  setBudgets(budgets: BudgetLimit[]): void {
    safeSet(STORAGE_KEYS.BUDGETS, budgets)
  },

  getCachedInsight(): { text: string; ts: number } | null {
    return safeGet(STORAGE_KEYS.INSIGHT, null)
  },

  setCachedInsight(text: string): void {
    safeSet(STORAGE_KEYS.INSIGHT, { text, ts: Date.now() })
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  },
}
