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
        'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5',
        onClick
          ? 'cursor-pointer hover:border-[var(--border)] transition-colors duration-150'
          : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {header && (
        <div className="mb-4 pb-4 border-b border-[var(--border-subtle)]">
          {header}
        </div>
      )}
      {children}
    </div>
  )
}
