import { describe, it, expect } from 'vitest'
import {
  autoDetectCategory,
  formatCurrency,
  validateExpenseForm,
  hasErrors,
  filterAndSortExpenses,
  computeCategorySummaries,
  computeAveragePerDay,
  generateId,
} from '@/utils/helpers'
import type { Expense, FilterState } from '@/types'

// ─── autoDetectCategory ───────────────────────────────────────────────────────

describe('autoDetectCategory', () => {
  it('detects Food from common keywords', () => {
    expect(autoDetectCategory('lunch at pizza hut')).toBe('Food')
    expect(autoDetectCategory('Sushi dinner')).toBe('Food')
    expect(autoDetectCategory('coffee and pastry')).toBe('Food')
    expect(autoDetectCategory('Grocery run')).toBe('Food')
  })

  it('detects Travel', () => {
    expect(autoDetectCategory('Uber to airport')).toBe('Travel')
    expect(autoDetectCategory('Hotel booking')).toBe('Travel')
  })

  it('detects Entertainment', () => {
    expect(autoDetectCategory('Netflix subscription')).toBe('Entertainment')
    expect(autoDetectCategory('Spotify premium')).toBe('Entertainment')
  })

  it('detects Health', () => {
    expect(autoDetectCategory('Gym membership')).toBe('Health')
    expect(autoDetectCategory('doctor visit')).toBe('Health')
  })

  it('detects Utilities', () => {
    expect(autoDetectCategory('Electricity bill')).toBe('Utilities')
    expect(autoDetectCategory('phone recharge')).toBe('Utilities')
  })

  it('returns Other for unknown descriptions', () => {
    expect(autoDetectCategory('xyz 123 nonsense')).toBe('Other')
    expect(autoDetectCategory('')).toBe('Other')
  })
})

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(45)).toBe('$45.00')
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles decimals', () => {
    expect(formatCurrency(12.99)).toBe('$12.99')
  })
})

// ─── validateExpenseForm ──────────────────────────────────────────────────────

describe('validateExpenseForm', () => {
  it('returns no errors for valid input', () => {
    const errors = validateExpenseForm({ description: 'Lunch', amount: 15, date: '2026-02-10' })
    expect(hasErrors(errors)).toBe(false)
  })

  it('requires description', () => {
    const errors = validateExpenseForm({ description: '', amount: 10, date: '2026-02-10' })
    expect(errors.description).toBeDefined()
  })

  it('rejects single-char description', () => {
    const errors = validateExpenseForm({ description: 'a', amount: 10, date: '2026-02-10' })
    expect(errors.description).toBeDefined()
  })

  it('requires positive amount', () => {
    expect(validateExpenseForm({ description: 'Test', amount: 0, date: '2026-02-10' }).amount).toBeDefined()
    expect(validateExpenseForm({ description: 'Test', amount: -5, date: '2026-02-10' }).amount).toBeDefined()
  })

  it('requires date', () => {
    const errors = validateExpenseForm({ description: 'Test', amount: 10, date: '' })
    expect(errors.date).toBeDefined()
  })

  it('rejects amount over 1,000,000', () => {
    const errors = validateExpenseForm({ description: 'Test', amount: 2_000_000, date: '2026-02-10' })
    expect(errors.amount).toBeDefined()
  })
})

// ─── filterAndSortExpenses ────────────────────────────────────────────────────

const MOCK_EXPENSES: Expense[] = [
  { id: '1', description: 'Coffee', amount: 5,   category: 'Food',  date: '2026-02-10', note: '', createdAt: '' },
  { id: '2', description: 'Uber',   amount: 20,  category: 'Travel',date: '2026-02-09', note: '', createdAt: '' },
  { id: '3', description: 'Netflix',amount: 15,  category: 'Entertainment', date: '2026-02-08', note: 'monthly', createdAt: '' },
]

const BASE_FILTER: FilterState = {
  category: 'All', search: '', dateFrom: '', dateTo: '',
  sortField: 'date', sortDir: 'desc',
}

describe('filterAndSortExpenses', () => {
  it('returns all when no filter', () => {
    expect(filterAndSortExpenses(MOCK_EXPENSES, BASE_FILTER)).toHaveLength(3)
  })

  it('filters by category', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, category: 'Food' })
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('Food')
  })

  it('filters by search in description', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, search: 'ube' })
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Uber')
  })

  it('filters by search in note', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, search: 'monthly' })
    expect(result).toHaveLength(1)
  })

  it('sorts by amount descending', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, sortField: 'amount', sortDir: 'desc' })
    expect(result[0].amount).toBe(20)
    expect(result[2].amount).toBe(5)
  })

  it('sorts by amount ascending', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, sortField: 'amount', sortDir: 'asc' })
    expect(result[0].amount).toBe(5)
  })

  it('filters by date range', () => {
    const result = filterAndSortExpenses(MOCK_EXPENSES, { ...BASE_FILTER, dateFrom: '2026-02-09', dateTo: '2026-02-09' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })
})

// ─── computeCategorySummaries ─────────────────────────────────────────────────

describe('computeCategorySummaries', () => {
  it('calculates totals correctly', () => {
    const summaries = computeCategorySummaries(MOCK_EXPENSES, [])
    const food = summaries.find((s) => s.name === 'Food')!
    expect(food.total).toBe(5)
    expect(food.count).toBe(1)
  })

  it('calculates percentages', () => {
    const summaries = computeCategorySummaries(MOCK_EXPENSES, [])
    const total = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0) // 40
    const food = summaries.find((s) => s.name === 'Food')!
    expect(food.percentage).toBeCloseTo((5 / 40) * 100, 1)
  })

  it('includes budget data when set', () => {
    const summaries = computeCategorySummaries(MOCK_EXPENSES, [{ category: 'Food', limit: 100 }])
    const food = summaries.find((s) => s.name === 'Food')!
    expect(food.budgetLimit).toBe(100)
    expect(food.budgetUsed).toBeCloseTo(5, 1)
  })
})

// ─── computeAveragePerDay ─────────────────────────────────────────────────────

describe('computeAveragePerDay', () => {
  it('calculates average correctly', () => {
    const avg = computeAveragePerDay(MOCK_EXPENSES) // 3 unique days, total 40
    expect(avg).toBeCloseTo(40 / 3, 1)
  })

  it('returns 0 for empty list', () => {
    expect(computeAveragePerDay([])).toBe(0)
  })
})

// ─── generateId ──────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId))
    expect(ids.size).toBe(100)
  })
})
