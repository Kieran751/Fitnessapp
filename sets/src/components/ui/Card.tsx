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
        'bg-[var(--glass)] backdrop-blur-[24px] border border-[var(--glass-border)] rounded-3xl p-5',
        onClick
          ? 'cursor-pointer hover:bg-[var(--glass-hover)] transition-all duration-150'
          : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {header && (
        <div className="mb-4 pb-4 border-b border-[var(--glass-border)]">
          {header}
        </div>
      )}
      {children}
    </div>
  )
}
