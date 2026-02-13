import { RefreshCw, Sparkles, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react'
import { useAIInsight } from '@/hooks'
import { Spinner, Button } from '@/components/ui'
import type { AIInsight as AIInsightType } from '@/types'

const INSIGHT_STYLES: Record<AIInsightType['type'], { border: string; gradient: string; icon: React.ReactNode; label: string }> = {
  tip:      { border: '#a78bfa', gradient: 'linear-gradient(135deg, #12122a, #1a1230)', icon: <Lightbulb size={16} />,      label: 'SAVING TIP' },
  warning:  { border: '#F77F00', gradient: 'linear-gradient(135deg, #1a1200, #2a1800)', icon: <AlertTriangle size={16} />, label: 'HEADS UP' },
  positive: { border: '#06d6a0', gradient: 'linear-gradient(135deg, #001a14, #001f18)', icon: <TrendingUp size={16} />,    label: 'GREAT JOB' },
}

export function AIInsightPanel() {
  const { insight, loading, error, refresh } = useAIInsight()
  const style = INSIGHT_STYLES[insight?.type ?? 'tip']

  return (
    <div
      role="region"
      aria-label="AI Insight"
      style={{
        background: style.gradient,
        border: `1px solid ${style.border}30`,
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: '-100%', right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${style.border}80, transparent)`,
        animation: loading ? 'shimmer 1.5s linear infinite' : 'none',
        backgroundSize: '200% 100%',
      }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', bottom: -30, right: -30, width: 100, height: 100,
        borderRadius: '50%', background: style.border, opacity: 0.07, filter: 'blur(25px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)',
          background: `${style.border}20`, border: `1px solid ${style.border}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: style.border, flexShrink: 0,
          boxShadow: `0 0 20px ${style.border}25`,
        }}>
          {loading ? <Spinner size={15} color={style.border} /> : style.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={10} style={{ color: style.border }} />
            <span style={{ fontSize: '10px', color: style.border, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {style.label}
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', gap: '5px', paddingTop: '4px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: style.border,
                  animation: `pulse-dot 1.2s ${i * 0.18}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          ) : error ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Could not load insight. Check your connection.
            </p>
          ) : (
            <p style={{
              margin: 0, fontSize: '14px', lineHeight: '1.65',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              {insight?.text ?? 'Add expenses to unlock AI-powered saving tips.'}
            </p>
          )}
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
          icon={<RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />}
          aria-label="Refresh AI insight"
          style={{ flexShrink: 0, marginLeft: 'auto' }}
        >
          {loading ? '' : 'REFRESH'}
        </Button>
      </div>
    </div>
  )
}
