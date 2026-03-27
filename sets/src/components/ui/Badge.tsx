type SetType = 'normal' | 'warmup' | 'dropset' | 'failure'

interface BadgeProps {
  type: SetType
  className?: string
}

const badgeConfig: Record<SetType, { label: string; styles: string }> = {
  normal: {
    label: 'Normal',
    styles: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]',
  },
  warmup: {
    label: 'Warm-up',
    styles: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  },
  dropset: {
    label: 'Drop Set',
    styles: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  failure: {
    label: 'Failure',
    styles: 'bg-red-500/10 text-[var(--danger)] border-red-500/20',
  },
}

export function Badge({ type, className = '' }: BadgeProps) {
  const config = badgeConfig[type]
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        config.styles,
        className,
      ].join(' ')}
    >
      {config.label}
    </span>
  )
}
