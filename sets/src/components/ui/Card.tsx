import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, header, className = '', onClick }: CardProps) {
  return (
    <div
      className={[
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4',
        onClick ? 'cursor-pointer hover:border-[var(--text-tertiary)] transition-colors duration-150' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {header && (
        <div className="mb-3 pb-3 border-b border-[var(--border)]">
          {header}
        </div>
      )}
      {children}
    </div>
  )
}
