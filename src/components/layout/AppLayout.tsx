import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, BarChart3, Settings, Wallet } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/utils/helpers'

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses',  icon: List,            label: 'Expenses'  },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { total, monthTotal, count } = useAppStore((s) => ({
    total: s.expenses.reduce((a, e) => a + e.amount, 0),
    monthTotal: s.expenses
      .filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7)))
      .reduce((a, e) => a + e.amount, 0),
    count: s.expenses.length,
  }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '18px', fontWeight: 700,
            fontFamily: 'var(--font-display)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            }}>
              💸
            </div>
            <div>
              <div style={{ lineHeight: 1, background: 'linear-gradient(135deg, #a78bfa, #06d6a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Spendly
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-disabled)', letterSpacing: '0.15em', fontFamily: 'var(--font-mono)', WebkitTextFillColor: 'initial' }}>
                SMART TRACKER
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          margin: '0 12px 24px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Wallet size={13} style={{ color: 'var(--brand-secondary)' }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>THIS MONTH</span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {formatCurrency(monthTotal)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {count} transactions total
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  marginBottom: '2px',
                  color: active ? 'var(--brand-secondary)' : 'var(--text-muted)',
                  background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
                  fontSize: '13px',
                  fontWeight: active ? 500 : 400,
                  textDecoration: 'none',
                  transition: 'all var(--duration-base)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                }}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
            Data stored locally.<br />No account needed.
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{
        marginLeft: 220,
        flex: 1,
        padding: '32px',
        maxWidth: 'calc(100vw - 220px)',
      }}>
        {children}
      </main>
    </div>
  )
}

// ─── Page header ──────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, actions }: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '10px' }}>{actions}</div>}
    </div>
  )
}
