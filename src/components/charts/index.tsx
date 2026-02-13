import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts'
import { formatCurrency, formatDate } from '@/utils/helpers'
import type { CategorySummary, DailySummary } from '@/types'

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name?: string; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? 'var(--text-primary)' }}>
          {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: CategorySummary[]
  total: number
}

export function DonutChart({ data, total }: DonutChartProps) {
  const filtered = data.filter((d) => d.total > 0)
  if (filtered.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={88}
          paddingAngle={2}
          dataKey="total"
          stroke="none"
        >
          {filtered.map((entry, idx) => (
            <Cell key={idx} fill={entry.meta.color} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as CategorySummary
            return (
              <div style={{
                background: 'var(--bg-raised)',
                border: `1px solid ${d.meta.color}40`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}>
                <div style={{ color: d.meta.color, marginBottom: '3px' }}>{d.meta.icon} {d.name}</div>
                <div style={{ color: 'var(--text-primary)' }}>{formatCurrency(d.total)}</div>
                <div style={{ color: 'var(--text-muted)' }}>{d.percentage.toFixed(1)}%</div>
              </div>
            )
          }}
        />
        {/* Center label */}
        <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">TOTAL</text>
        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize={16} fontWeight={700} fontFamily="var(--font-display)">
          {formatCurrency(total)}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── SpendingBarChart ─────────────────────────────────────────────────────────

interface SpendingBarChartProps {
  data: DailySummary[]
}

export function SpendingBarChart({ data }: SpendingBarChartProps) {
  const last7 = [...data].slice(-7).map((d) => ({
    ...d,
    label: formatDate(d.date, 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={last7} barSize={22} margin={{ top: 4, bottom: 0, left: -20, right: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
          tickFormatter={(v) => `$${v}`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {last7.map((_, i) => (
            <Cell key={i} fill={i === last7.length - 1 ? '#a78bfa' : '#7c3aed'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── TrendLine ────────────────────────────────────────────────────────────────

export function TrendAreaChart({ data }: { data: DailySummary[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDate(d.date, 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={100}>
      <AreaChart data={chartData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"   stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%"  stopColor="#7c3aed" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#a78bfa40' }} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#a78bfa"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── CategoryProgressBar ──────────────────────────────────────────────────────

export function CategoryProgressBar({ summary }: { summary: CategorySummary }) {
  const { name, total, percentage, count, meta, budgetLimit, budgetUsed } = summary
  const overBudget = budgetUsed !== undefined && budgetUsed >= 100
  const nearBudget = budgetUsed !== undefined && budgetUsed >= 80 && !overBudget

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>{meta.icon}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{name}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {budgetLimit && (
            <span style={{
              fontSize: '10px',
              color: overBudget ? 'var(--accent-red)' : nearBudget ? 'var(--accent-amber)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              {overBudget ? '⚠ ' : ''}{formatCurrency(total)} / {formatCurrency(budgetLimit)}
            </span>
          )}
          <span style={{ fontSize: '13px', color: meta.color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(percentage, 100)}%`,
          background: overBudget ? 'var(--accent-red)' : nearBudget ? 'var(--accent-amber)' : meta.color,
          borderRadius: 'var(--radius-full)',
          boxShadow: `0 0 8px ${meta.color}60`,
          transition: 'width 0.5s var(--ease-out)',
        }} />
      </div>

      {/* Budget bar (if set) */}
      {budgetUsed !== undefined && (
        <div style={{ height: '2px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', marginTop: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(budgetUsed, 100)}%`,
            background: overBudget ? 'var(--accent-red)' : nearBudget ? 'var(--accent-amber)' : `${meta.color}80`,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s var(--ease-out)',
          }} />
        </div>
      )}
    </div>
  )
}
