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
    <div className="flex flex-col items-center justify-center text-center gap-5 py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center">
        <Icon size={32} className="text-[var(--accent)]" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2 max-w-[280px]">
        <p className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{title}</p>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
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
