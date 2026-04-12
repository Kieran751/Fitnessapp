import { type ReactNode } from 'react'

type SetType = 'normal' | 'warmup' | 'dropset' | 'failure'
type BadgeVariant = 'default' | 'accent' | 'gold' | 'danger'

interface BadgeProps {
  type?: SetType
  variant?: BadgeVariant
  children?: ReactNode
  className?: string
}

const setTypeConfig: Record<SetType, { label: string; styles: string }> = {
  normal: {
    label: 'Normal',
    styles:
      'bg-[var(--glass)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
  },
  warmup: {
    label: 'Warm-up',
    styles:
      'bg-[var(--gold-surface)] text-[var(--gold)] border border-transparent',
  },
  dropset: {
    label: 'Drop Set',
    styles: 'bg-[var(--secondary-surface)] text-[var(--secondary)] border border-transparent',
  },
  failure: {
    label: 'Failure',
    styles:
      'bg-[var(--danger-surface)] text-[var(--danger)] border border-transparent',
  },
}

const variantConfig: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--glass)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
  accent:
    'bg-[var(--primary-surface)] text-[var(--accent)] border border-transparent',
  gold:
    'bg-[var(--gold-surface)] text-[var(--gold)] border border-transparent',
  danger:
    'bg-[var(--danger-surface)] text-[var(--danger)] border border-transparent',
}

export function Badge({ type, variant, children, className = '' }: BadgeProps) {
  const styles = type
    ? setTypeConfig[type].styles
    : variantConfig[variant ?? 'default']
  const content = children ?? (type ? setTypeConfig[type].label : null)
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]',
        styles,
        className,
      ].join(' ')}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {content}
    </span>
  )
}
