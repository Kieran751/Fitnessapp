import { type LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
        <Icon size={28} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] max-w-[240px]">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
