import { motion } from 'framer-motion'
import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-on)] font-semibold hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)]',
  secondary:
    'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
  danger:
    'bg-[var(--danger-muted)] text-[var(--danger)] hover:bg-[var(--danger)]/25',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-7 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined }}
    >
      <button
        type={type}
        className={[
          'sets-btn inline-flex flex-1 items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 cursor-pointer select-none outline-none focus-visible:[box-shadow:0_0_0_3px_var(--accent-ring)]',
          variantStyles[variant],
          sizeStyles[size],
          disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          className,
        ].join(' ')}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  )
}
