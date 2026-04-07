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
      'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  },
  warmup: {
    label: 'Warm-up',
    styles:
      'bg-[var(--gold-muted)] text-[var(--gold)] border border-transparent',
  },
  dropset: {
    label: 'Drop Set',
    styles: 'bg-[#C084FC]/12 text-[#C084FC] border border-transparent',
  },
  failure: {
    label: 'Failure',
    styles:
      'bg-[var(--danger-muted)] text-[var(--danger)] border border-transparent',
  },
}

const variantConfig: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  accent:
    'bg-[var(--accent-muted)] text-[var(--accent)] border border-transparent',
  gold:
    'bg-[var(--gold-muted)] text-[var(--gold)] border border-transparent',
  danger:
    'bg-[var(--danger-muted)] text-[var(--danger)] border border-transparent',
}

export function Badge({ type, variant, children, className = '' }: BadgeProps) {
  const styles = type
    ? setTypeConfig[type].styles
    : variantConfig[variant ?? 'default']
  const content = children ?? (type ? setTypeConfig[type].label : null)
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]',
        styles,
        className,
      ].join(' ')}
    >
      {content}
    </span>
  )
}
