// ─── Domain Types ────────────────────────────────────────────────────────────

export type CategoryName =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Utilities'
  | 'Other'

export interface CategoryMeta {
  icon: string
  color: string
  bgColor: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: CategoryName
  date: string // ISO yyyy-MM-dd
  note: string
  createdAt: string // ISO timestamp
}

export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>

// ─── Store Types ─────────────────────────────────────────────────────────────

export interface BudgetLimit {
  category: CategoryName
  limit: number
}

export type SortField = 'date' | 'amount' | 'description'
export type SortDir = 'asc' | 'desc'

export interface FilterState {
  category: CategoryName | 'All'
  dateFrom: string
  dateTo: string
  search: string
  sortField: SortField
  sortDir: SortDir
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export type InsightType = 'tip' | 'warning' | 'positive'

export interface AIInsight {
  text: string
  type: InsightType
  generatedAt: string
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface CategorySummary {
  name: CategoryName
  total: number
  count: number
  percentage: number
  meta: CategoryMeta
  budgetLimit?: number
  budgetUsed?: number
}

export interface DailySummary {
  date: string
  total: number
  count: number
}

export interface MonthSummary {
  label: string
  total: number
}
