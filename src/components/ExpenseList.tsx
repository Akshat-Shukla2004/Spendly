import { useState, useCallback } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, CATEGORY_NAMES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { Badge, EmptyState, Button, Select, Input } from '@/components/ui'
import type { Expense, CategoryName } from '@/types'

// ─── Single Row ───────────────────────────────────────────────────────────────

interface ExpenseRowProps {
  expense: Expense
  animateOut?: boolean
}

export function ExpenseRow({ expense: e, animateOut }: ExpenseRowProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editData, setEditData] = useState({ description: e.description, amount: String(e.amount), category: e.category, note: e.note })
  const { deleteExpense, updateExpense } = useAppStore()

  const meta = CATEGORIES[e.category]

  const handleDelete = useCallback(() => {
    setDeleting(true)
    setTimeout(() => deleteExpense(e.id), 280)
  }, [e.id, deleteExpense])

  const handleSave = useCallback(() => {
    const amount = parseFloat(editData.amount)
    if (!editData.description.trim() || isNaN(amount) || amount <= 0) return
    updateExpense(e.id, {
      description: editData.description.trim(),
      amount,
      category: editData.category as CategoryName,
      note: editData.note,
    })
    setEditing(false)
  }, [e.id, editData, updateExpense])

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: editing ? 'flex-start' : 'center',
    gap: '14px',
    padding: '14px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '6px',
    opacity: deleting || animateOut ? 0 : 1,
    transform: deleting || animateOut ? 'translateX(-12px)' : 'translateX(0)',
    transition: 'all 280ms var(--ease-out)',
  }

  return (
    <div
      role="listitem"
      style={rowStyle}
      className="expense-row"
    >
      {/* Category icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: meta.bgColor, border: `1px solid ${meta.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '19px', flexShrink: 0, userSelect: 'none',
      }}>
        {meta.icon}
      </div>

      {editing ? (
        /* ── Edit mode ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
            <input
              value={editData.description}
              onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
              style={INLINE_INPUT_STYLE}
              placeholder="Description"
              autoFocus
            />
            <input
              value={editData.amount}
              onChange={(e) => setEditData((d) => ({ ...d, amount: e.target.value }))}
              style={INLINE_INPUT_STYLE}
              type="number" placeholder="Amount"
            />
            <select
              value={editData.category}
              onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value as CategoryName }))}
              style={{ ...INLINE_INPUT_STYLE, cursor: 'pointer' }}
            >
              {CATEGORY_NAMES.map((n) => (
                <option key={n} value={n} style={{ background: 'var(--bg-raised)' }}>
                  {CATEGORIES[n].icon} {n}
                </option>
              ))}
            </select>
          </div>
          <input
            value={editData.note}
            onChange={(e) => setEditData((d) => ({ ...d, note: e.target.value }))}
            style={INLINE_INPUT_STYLE}
            placeholder="Note (optional)"
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={ACTION_BTN('#06d6a0')} aria-label="Save">
              <Check size={13} /> Save
            </button>
            <button onClick={() => setEditing(false)} style={ACTION_BTN('#94a3b8')} aria-label="Cancel">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {e.description}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {formatDate(e.date, 'MMM d, yyyy')}
              </span>
              <Badge color={meta.color} small>{e.category}</Badge>
              {e.note && (
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                  {e.note}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
            {formatCurrency(e.amount)}
          </div>

          {/* Row actions (visible on hover via CSS) */}
          <div className="row-actions" style={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity var(--duration-fast)', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={ICON_BTN} aria-label="Edit expense">
              <Pencil size={13} />
            </button>
            <button onClick={handleDelete} style={{ ...ICON_BTN, color: 'var(--accent-red)' }} aria-label="Delete expense">
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}

      <style>{`.expense-row:hover .row-actions { opacity: 1 !important; }`}</style>
    </div>
  )
}

// ─── List ─────────────────────────────────────────────────────────────────────

interface ExpenseListProps {
  expenses: Expense[]
  limit?: number
  emptyTitle?: string
  emptyDescription?: string
}

export function ExpenseList({ expenses, limit, emptyTitle = 'No expenses yet', emptyDescription }: ExpenseListProps) {
  const shown = limit ? expenses.slice(0, limit) : expenses

  if (shown.length === 0) {
    return (
      <EmptyState
        icon="💸"
        title={emptyTitle}
        description={emptyDescription ?? 'Add your first expense above to get started.'}
      />
    )
  }

  return (
    <div role="list" aria-label="Expense list">
      {shown.map((e) => (
        <ExpenseRow key={e.id} expense={e} />
      ))}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const INLINE_INPUT_STYLE: React.CSSProperties = {
  background: 'var(--bg-hover)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '7px 10px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
  outline: 'none',
  width: '100%',
}

const ICON_BTN: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '5px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  transition: 'color var(--duration-fast), background var(--duration-fast)',
}

function ACTION_BTN(color: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: `${color}15`, border: `1px solid ${color}30`,
    borderRadius: 'var(--radius-sm)', padding: '5px 10px',
    color, cursor: 'pointer', fontSize: '11px',
    fontFamily: 'var(--font-mono)', fontWeight: 500,
  }
}
