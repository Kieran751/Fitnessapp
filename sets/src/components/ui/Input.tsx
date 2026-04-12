import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="label-caption"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'h-[52px] px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] font-medium placeholder:text-[var(--text-tertiary)] outline-none transition-all duration-150',
          'focus:border-[var(--accent)] focus:[box-shadow:0_0_0_3px_var(--primary-glow)]',
          error ? 'border-[var(--danger)]' : '',
          className,
        ].join(' ')}
        style={{ fontFamily: "'Manrope', sans-serif" }}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  )
}
