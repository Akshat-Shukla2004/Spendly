import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { computeMonthlyTotal, computeAveragePerDay, computeDailySummaries, formatCurrency } from '@/utils/helpers'
import { Card } from '@/components/ui'
import { AIInsightPanel } from '@/components/AIInsightPanel'
import { ExpenseForm } from '@/components/ExpenseForm'
import { ExpenseList } from '@/components/ExpenseList'
import { TrendAreaChart } from '@/components/charts'
import { PageHeader } from '@/components/layout/AppLayout'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent, trend }: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card accent={accent}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: accent, opacity: 0.06, filter: 'blur(28px)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
            {label}
          </div>
          <div style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {trend === 'up' && <TrendingUp size={11} style={{ color: 'var(--accent-red)' }} />}
              {trend === 'down' && <TrendingDown size={11} style={{ color: '#06d6a0' }} />}
              {sub}
            </div>
          )}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)',
          background: `${accent}18`, border: `1px solid ${accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const expenses = useAppStore((s) => s.expenses)
  const monthTotal = computeMonthlyTotal(expenses)
  const allTimeTotal = expenses.reduce((s, e) => s + e.amount, 0)
  const avgPerDay = computeAveragePerDay(expenses)
  const dailySummaries = computeDailySummaries(expenses)
  const topExpense = expenses.reduce((m, e) => (e.amount > (m?.amount ?? 0) ? e : m), expenses[0])

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="THIS MONTH"
          value={formatCurrency(monthTotal)}
          sub={`${expenses.filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7))).length} transactions`}
          icon={<DollarSign size={17} />}
          accent="#a78bfa"
        />
        <StatCard
          label="ALL TIME"
          value={formatCurrency(allTimeTotal)}
          sub={`${expenses.length} total entries`}
          icon={<Activity size={17} />}
          accent="#06d6a0"
        />
        <StatCard
          label="AVG / DAY"
          value={formatCurrency(avgPerDay)}
          sub="tracked days"
          icon={<TrendingUp size={17} />}
          accent="#4ECDC4"
        />
        <StatCard
          label="LARGEST"
          value={topExpense ? formatCurrency(topExpense.amount) : '—'}
          sub={topExpense?.description.slice(0, 18) ?? ''}
          icon={<TrendingDown size={17} />}
          accent="#FF6B6B"
        />
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' }}>
        {/* Add expense */}
        <Card>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '18px' }}>
            + NEW EXPENSE
          </div>
          <ExpenseForm />
        </Card>

        {/* Spending trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
              SPENDING TREND
            </div>
            <TrendAreaChart data={dailySummaries} />
          </Card>
          <AIInsightPanel />
        </div>
      </div>

      {/* Recent */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            RECENT TRANSACTIONS
          </div>
          <a href="/expenses" style={{ fontSize: '11px', color: 'var(--brand-secondary)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
            View all →
          </a>
        </div>
        <ExpenseList expenses={expenses} limit={6} emptyDescription="Add your first expense using the form above." />
      </Card>
    </div>
  )
}
