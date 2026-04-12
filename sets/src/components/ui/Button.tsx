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
    'text-[var(--on-primary)] font-semibold',
  secondary:
    'bg-[var(--glass)] text-[var(--text-primary)] border border-[var(--glass-border)] backdrop-blur-[12px] hover:bg-[var(--glass-hover)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--glass)] hover:text-[var(--text-primary)]',
  danger:
    'bg-[var(--danger-muted)] text-[var(--danger)] hover:bg-[var(--danger-surface)]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-14 px-5 text-base',
  lg: 'h-16 px-7 text-lg',
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
  const isPrimary = variant === 'primary'

  return (
    <motion.div
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined }}
    >
      <button
        type={type}
        className={[
          'sets-btn inline-flex flex-1 items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-150 cursor-pointer select-none outline-none focus-visible:[box-shadow:0_0_0_3px_var(--accent-ring)]',
          variantStyles[variant],
          sizeStyles[size],
          disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          className,
        ].join(' ')}
        style={isPrimary && !disabled ? {
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          boxShadow: '0 8px 32px rgba(79, 124, 255, 0.25)',
          fontFamily: "'Manrope', sans-serif",
        } : {
          fontFamily: "'Manrope', sans-serif",
        }}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  )
}
