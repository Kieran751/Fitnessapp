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
  primary: 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)]',
  secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-tertiary)]',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
  danger: 'bg-transparent text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-base rounded-xl',
  lg: 'h-14 px-6 text-lg rounded-xl',
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
      style={{ display: fullWidth ? 'flex' : 'inline-flex' }}
    >
      <button
        type={type}
        className={[
          'inline-flex flex-1 items-center justify-center gap-2 font-medium transition-colors duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
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
