import { useState } from 'react'
import { Trash2, RotateCcw, Save, ShieldAlert } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/AppLayout'
import { CATEGORIES, CATEGORY_NAMES } from '@/utils/constants'
import { formatCurrency } from '@/utils/helpers'
import type { CategoryName } from '@/types'

// ─── Budget Row ───────────────────────────────────────────────────────────────

function BudgetRow({ category }: { category: CategoryName }) {
  const meta = CATEGORIES[category]
  const budgets = useAppStore((s) => s.budgetLimits)
  const { setBudgetLimit, removeBudgetLimit } = useAppStore()
  const existing = budgets.find((b) => b.category === category)
  const [value, setValue] = useState(String(existing?.limit ?? ''))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const n = parseFloat(value)
    if (!isNaN(n) && n > 0) {
      setBudgetLimit(category, n)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const handleRemove = () => {
    removeBudgetLimit(category)
    setValue('')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--radius-md)',
        background: meta.bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '18px', flexShrink: 0,
      }}>
        {meta.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{category}</div>
        {existing && (
          <div style={{ fontSize: '11px', color: meta.color, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            Limit: {formatCurrency(existing.limit)} / month
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            $
          </span>
          <input
            type="number"
            min="1"
            placeholder="No limit"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px 8px 24px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              width: '120px',
            }}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={!value}
          icon={<Save size={12} />}
        >
          {saved ? 'SAVED ✓' : 'SET'}
        </Button>
        {existing && (
          <Button size="sm" variant="danger" onClick={handleRemove} icon={<Trash2 size={12} />}>
            REMOVE
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { resetToSeed, clearAllData, expenses } = useAppStore((s) => ({
    resetToSeed: s.resetToSeed,
    clearAllData: s.clearAllData,
    expenses: s.expenses,
  }))
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Settings"
        subtitle="Manage budgets, data, and preferences"
      />

      {/* Budget Limits */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
          MONTHLY BUDGET LIMITS
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
          Set per-category limits. Warnings appear in Analytics when you hit 80% or 100%.
        </p>
        {CATEGORY_NAMES.map((cat) => (
          <BudgetRow key={cat} category={cat} />
        ))}
      </Card>

      {/* Data Management */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
          DATA MANAGEMENT
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
          All data is stored in your browser's localStorage. Nothing is sent to a server.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Reset to seed */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>Reset to sample data</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Replaces all data with demo expenses
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<RotateCcw size={13} />} onClick={resetToSeed}>
              RESET TO DEMO
            </Button>
          </div>

          {/* Clear all */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: 'rgba(255,107,107,0.05)', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,107,107,0.2)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-red)', marginBottom: '4px' }}>
                <ShieldAlert size={14} />
                Clear all data
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Permanently deletes all {expenses.length} expenses. Cannot be undone.
              </div>
            </div>
            {confirmClear ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="danger" size="sm" onClick={() => { clearAllData(); setConfirmClear(false) }}>
                  CONFIRM DELETE
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                  CANCEL
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setConfirmClear(true)}>
                CLEAR ALL
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
          ABOUT SPENDLY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            ['Version',     '1.0.0'],
            ['Stack',       'React 18 + TypeScript'],
            ['State',       'Zustand + Immer'],
            ['Charts',      'Recharts'],
            ['AI',          'Claude API'],
            ['Storage',     'localStorage'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
