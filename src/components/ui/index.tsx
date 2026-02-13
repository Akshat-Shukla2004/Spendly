import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const BTN_BASE = `
  inline-flex items-center justify-center gap-2 font-medium cursor-pointer
  transition-all border select-none whitespace-nowrap
  focus-visible:outline-2 focus-visible:outline-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
`.trim().replace(/\s+/g, ' ')

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-violet-700 to-violet-500 text-white border-transparent shadow-brand hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.45)] active:translate-y-0',
  ghost:   'bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200',
  danger:  'bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10',
  outline: 'bg-transparent text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5',
}

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-sm px-6 py-3 rounded-xl tracking-wide',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className)}
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}
          >
            {label.toUpperCase()}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && (
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex',
            }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={className}
            style={{
              width: '100%',
              background: 'var(--bg-hover)',
              border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              padding: icon ? '11px 14px 11px 38px' : '11px 14px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'border-color var(--duration-base), box-shadow var(--duration-base)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--accent-red)' : 'var(--brand-secondary)'
              e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(255,107,107,0.15)' : 'rgba(124,58,237,0.2)'}`
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--accent-red)' : 'var(--border-default)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            {...props}
          />
        </div>
        {error && (
          <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
            ⚠ {error}
          </span>
        )}
        {hint && !error && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {hint}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}
          >
            {label.toUpperCase()}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          style={{
            width: '100%',
            background: 'var(--bg-hover)',
            border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '11px 14px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            transition: 'border-color var(--duration-base)',
          }}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: 'var(--bg-raised)' }}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
            ⚠ {error}
          </span>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  accent?: string
  onClick?: () => void
}

export function Card({ children, style, accent, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${accent ? `${accent}25` : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color var(--duration-base)',
        ...style,
      }}
    >
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        }} />
      )}
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  color?: string
  small?: boolean
}

export function Badge({ children, color = 'var(--brand-secondary)', small }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: small ? '2px 8px' : '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: `${color}18`,
      border: `1px solid ${color}30`,
      color,
      fontSize: small ? '10px' : '11px',
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '12px', padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '42px', opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
      {description && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '260px', lineHeight: 1.6 }}>
          {description}
        </div>
      )}
      {action}
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} title={text}>
      {children}
    </span>
  )
}
