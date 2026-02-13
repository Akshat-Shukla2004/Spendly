import { useAppStore } from '@/store/useAppStore'
import {
  computeCategorySummaries, computeDailySummaries, computeMonthlyTotal,
  computeAveragePerDay, formatCurrency,
} from '@/utils/helpers'
import { Card } from '@/components/ui'
import { AIInsightPanel } from '@/components/AIInsightPanel'
import { DonutChart, SpendingBarChart, CategoryProgressBar } from '@/components/charts'
import { PageHeader } from '@/components/layout/AppLayout'

export function AnalyticsPage() {
  const expenses = useAppStore((s) => s.expenses)
  const budgets  = useAppStore((s) => s.budgetLimits)

  const summaries    = computeCategorySummaries(expenses, budgets)
  const dailyData    = computeDailySummaries(expenses)
  const monthTotal   = computeMonthlyTotal(expenses)
  const avgPerDay    = computeAveragePerDay(expenses)
  const grandTotal   = expenses.reduce((s, e) => s + e.amount, 0)
  const activeCats   = summaries.filter((s) => s.total > 0)
  const topCategory  = activeCats.reduce((a, b) => (a.total > b.total ? a : b), activeCats[0])
  const maxSingleDay = dailyData.reduce((m, d) => Math.max(m, d.total), 0)
  const maxDay       = dailyData.find((d) => d.total === maxSingleDay)

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Analytics"
        subtitle="Visual breakdown of your spending habits"
      />

      {/* Summary stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'THIS MONTH',    value: formatCurrency(monthTotal),  sub: 'Current billing period' },
          { label: 'AVG / DAY',     value: formatCurrency(avgPerDay),   sub: 'Across all tracked days' },
          { label: 'TOP CATEGORY',  value: topCategory ? `${topCategory.meta.icon} ${topCategory.name}` : '—', sub: topCategory ? formatCurrency(topCategory.total) : '' },
          { label: 'BIGGEST DAY',   value: maxDay ? formatCurrency(maxSingleDay) : '—', sub: maxDay?.date ?? '' },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Donut */}
        <Card>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
            SPENDING BY CATEGORY
          </div>
          <DonutChart data={summaries} total={grandTotal} />
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {activeCats.map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-raised)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: '11px', color: c.meta.color, fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                  {c.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar chart */}
        <Card>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
            DAILY SPENDING — LAST 7 DAYS
          </div>
          <SpendingBarChart data={dailyData} />

          {/* Day breakdown stats */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Total Days',   value: new Set(expenses.map((e) => e.date)).size },
              { label: 'Transactions', value: expenses.length },
              { label: 'Largest Txn',  value: formatCurrency(expenses.reduce((m, e) => Math.max(m, e.amount), 0)) },
              { label: 'Smallest Txn', value: formatCurrency(expenses.reduce((m, e) => Math.min(m, e.amount), Infinity)) },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>{s.label}</div>
                <div style={{ fontSize: '16px', color: 'var(--brand-secondary)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category progress bars with budget tracking */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
          CATEGORY BREAKDOWN
          <span style={{ marginLeft: '12px', color: 'var(--text-disabled)' }}>· thin bar = budget usage</span>
        </div>
        {summaries.filter((s) => s.total > 0).map((s) => (
          <CategoryProgressBar key={s.name} summary={s} />
        ))}
        {summaries.filter((s) => s.total > 0).length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>No data yet.</p>
        )}
      </Card>

      {/* AI */}
      <AIInsightPanel />
    </div>
  )
}
