import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-medium placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-150',
          'focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          error ? 'border-[var(--danger)]' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  )
}
