import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { fetchAIInsight } from '@/services/aiService'
import { validateExpenseForm, hasErrors, autoDetectCategory, todayISO, generateId } from '@/utils/helpers'
import type { ExpenseFormData, ValidationErrors } from '@/utils/helpers'
import type { CategoryName } from '@/types'

// ─── useAIInsight ─────────────────────────────────────────────────────────────

export function useAIInsight() {
  const expenses = useAppStore((s) => s.expenses)
  const { setInsight, setInsightLoading, setInsightError } = useAppStore()
  const { insight, loading, error } = useAppStore((s) => ({
    insight: s.insight,
    loading: s.insightLoading,
    error: s.insightError,
  }))

  const refresh = useCallback(async () => {
    if (expenses.length === 0) return
    setInsightLoading(true)
    setInsightError(null)
    try {
      const result = await fetchAIInsight(expenses)
      setInsight(result)
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : 'Failed to load insight')
    }
  }, [expenses, setInsight, setInsightLoading, setInsightError])

  // Auto-fetch on mount
  useEffect(() => {
    if (!insight) refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { insight, loading, error, refresh }
}

// ─── useExpenseForm ───────────────────────────────────────────────────────────

export interface ExpenseFormState {
  description: string
  amount: string
  category: CategoryName | ''
  date: string
  note: string
}

const EMPTY_FORM: ExpenseFormState = {
  description: '',
  amount: '',
  category: '',
  date: todayISO(),
  note: '',
}

export function useExpenseForm(onSuccess?: () => void) {
  const addExpense = useAppStore((s) => s.addExpense)
  const [form, setForm] = useState<ExpenseFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const detectedCategory = form.description
    ? autoDetectCategory(form.description)
    : null

  const setField = useCallback(
    <K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setTouched((prev) => new Set(prev).add(key))
    },
    []
  )

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field))
    if (field === 'description' && form.description && !form.category) {
      setForm((prev) => ({ ...prev, category: autoDetectCategory(prev.description) }))
    }
  }, [form.description, form.category])

  const validate = useCallback(() => {
    const errs = validateExpenseForm({
      description: form.description,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      date: form.date,
    })
    setErrors(errs)
    return !hasErrors(errs)
  }, [form])

  const submit = useCallback(() => {
    setTouched(new Set(['description', 'amount', 'date']))
    if (!validate()) return false
    setSubmitting(true)

    const data: ExpenseFormData = {
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: (form.category || detectedCategory || 'Other') as CategoryName,
      date: form.date,
      note: form.note.trim(),
    }

    addExpense(data)
    setForm(EMPTY_FORM)
    setErrors({})
    setTouched(new Set())
    setSubmitting(false)
    onSuccess?.()
    return true
  }, [form, detectedCategory, validate, addExpense, onSuccess])

  const reset = useCallback(() => {
    setForm(EMPTY_FORM)
    setErrors({})
    setTouched(new Set())
  }, [])

  const fieldError = useCallback(
    (field: keyof ValidationErrors) =>
      touched.has(field) ? errors[field] : undefined,
    [errors, touched]
  )

  return {
    form,
    errors,
    touched,
    submitting,
    detectedCategory,
    setField,
    handleBlur,
    submit,
    reset,
    fieldError,
  }
}

// ─── useCSVExport ─────────────────────────────────────────────────────────────

export function useCSVExport() {
  const expenses = useAppStore((s) => s.expenses)

  const exportCSV = useCallback(() => {
    const header = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Note']
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.amount.toFixed(2),
      `"${e.note.replace(/"/g, '""')}"`,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spendly-export-${todayISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [expenses])

  return { exportCSV }
}

// ─── useKeyboardShortcut ──────────────────────────────────────────────────────

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  meta = false
) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key && (!meta || e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler, meta])
}

// Re-export type for use in components
export type { ValidationErrors }
export { generateId }
