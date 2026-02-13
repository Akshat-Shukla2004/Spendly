import { useRef } from 'react'
import { PlusCircle, Wand2 } from 'lucide-react'
import { useExpenseForm } from '@/hooks'
import { Button, Input, Select, Badge } from '@/components/ui'
import { CATEGORIES, CATEGORY_NAMES } from '@/utils/constants'

interface ExpenseFormProps {
  onSuccess?: () => void
  compact?: boolean
}

const CATEGORY_OPTIONS = [
  { value: '', label: '✨ Auto-detect' },
  ...CATEGORY_NAMES.map((n) => ({ value: n, label: `${CATEGORIES[n].icon} ${n}` })),
]

export function ExpenseForm({ onSuccess, compact }: ExpenseFormProps) {
  const descRef = useRef<HTMLInputElement>(null)
  const {
    form,
    detectedCategory,
    setField,
    handleBlur,
    submit,
    reset,
    fieldError,
  } = useExpenseForm(onSuccess)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      submit()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Row 1: Description */}
      <Input
        ref={descRef}
        label="Description"
        placeholder="What did you spend on?"
        value={form.description}
        onChange={(e) => setField('description', e.target.value)}
        onBlur={() => handleBlur('description')}
        onKeyDown={handleKeyDown}
        error={fieldError('description')}
        icon={<span style={{ fontSize: '14px' }}>💬</span>}
        autoFocus={!compact}
      />

      {/* Auto-detect hint */}
      {detectedCategory && !form.category && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '-8px', fontSize: '11px', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          <Wand2 size={11} style={{ color: 'var(--brand-secondary)' }} />
          Auto-detected:
          <Badge color={CATEGORIES[detectedCategory].color} small>
            {CATEGORIES[detectedCategory].icon} {detectedCategory}
          </Badge>
        </div>
      )}

      {/* Row 2: Amount + Category + Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <Input
          label="Amount ($)"
          placeholder="0.00"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(e) => setField('amount', e.target.value)}
          onBlur={() => handleBlur('amount')}
          onKeyDown={handleKeyDown}
          error={fieldError('amount')}
          icon={<span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>$</span>}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => setField('category', e.target.value as typeof form.category)}
          options={CATEGORY_OPTIONS}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          onBlur={() => handleBlur('date')}
          error={fieldError('date')}
        />
      </div>

      {/* Row 3: Note */}
      <Input
        label="Note (optional)"
        placeholder="Add a note..."
        value={form.note}
        onChange={(e) => setField('note', e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button
          onClick={submit}
          icon={<PlusCircle size={15} />}
          size="md"
          style={{ flex: 1 }}
        >
          ADD EXPENSE
        </Button>
        <Button variant="ghost" onClick={reset} size="md">
          CLEAR
        </Button>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        ⌘ + Enter to submit quickly
      </div>
    </div>
  )
}
