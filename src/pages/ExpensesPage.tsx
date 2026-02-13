import { Download, Search, SlidersHorizontal, X } from 'lucide-react'
import { useAppStore, selectFilters } from '@/store/useAppStore'
import { filterAndSortExpenses, formatCurrency } from '@/utils/helpers'
import { useCSVExport } from '@/hooks'
import { Button, Card, Select, Input } from '@/components/ui'
import { ExpenseList } from '@/components/ExpenseList'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PageHeader } from '@/components/layout/AppLayout'
import { CATEGORY_NAMES, CATEGORIES } from '@/utils/constants'
import type { CategoryName, SortField, SortDir } from '@/types'

const CATEGORY_OPTIONS = [
  { value: 'All', label: 'All Categories' },
  ...CATEGORY_NAMES.map((n) => ({ value: n, label: `${CATEGORIES[n].icon} ${n}` })),
]

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'date-desc',        label: 'Newest First'    },
  { value: 'date-asc',         label: 'Oldest First'    },
  { value: 'amount-desc',      label: 'Highest Amount'  },
  { value: 'amount-asc',       label: 'Lowest Amount'   },
  { value: 'description-asc',  label: 'A → Z'           },
  { value: 'description-desc', label: 'Z → A'           },
]

export function ExpensesPage() {
  const expenses = useAppStore((s) => s.expenses)
  const filters = useAppStore(selectFilters)
  const { setFilter, resetFilters } = useAppStore()
  const { exportCSV } = useCSVExport()

  const filtered = filterAndSortExpenses(expenses, filters)
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)
  const hasActiveFilters = filters.category !== 'All' || filters.search || filters.dateFrom || filters.dateTo

  const handleSortChange = (val: string) => {
    const [field, dir] = val.split('-') as [SortField, SortDir]
    setFilter('sortField', field)
    setFilter('sortDir', dir)
  }

  const currentSort = `${filters.sortField}-${filters.sortDir}`

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Expenses"
        subtitle={`${filtered.length} of ${expenses.length} transactions`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={exportCSV}
            disabled={expenses.length === 0}
          >
            EXPORT CSV
          </Button>
        }
      />

      {/* Add form */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
          + ADD EXPENSE
        </div>
        <ExpenseForm compact />
      </Card>

      {/* Filters bar */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '10px', alignItems: 'end' }}>
          {/* Search */}
          <Input
            placeholder="Search by description, category, note..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            icon={<Search size={14} />}
          />

          {/* Category */}
          <div style={{ width: 160 }}>
            <Select
              options={CATEGORY_OPTIONS}
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value as CategoryName | 'All')}
            />
          </div>

          {/* Date range */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
            style={DATE_STYLE}
            title="From date"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
            style={DATE_STYLE}
            title="To date"
          />

          {/* Sort */}
          <div style={{ width: 160 }}>
            <Select
              options={SORT_OPTIONS}
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
            />
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={11} />
              Showing {filtered.length} results · {formatCurrency(totalFiltered)} total
            </div>
            <Button variant="ghost" size="sm" icon={<X size={12} />} onClick={resetFilters}>
              CLEAR FILTERS
            </Button>
          </div>
        )}
      </Card>

      {/* List */}
      <ExpenseList
        expenses={filtered}
        emptyTitle={hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
        emptyDescription={hasActiveFilters ? 'Try adjusting your filters.' : 'Add your first expense above.'}
      />
    </div>
  )
}

const DATE_STYLE: React.CSSProperties = {
  background: 'var(--bg-hover)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '11px 12px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
  outline: 'none',
  cursor: 'pointer',
  colorScheme: 'dark',
}
