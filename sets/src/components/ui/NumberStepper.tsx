import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  label?: string
  unit?: string
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  label,
  unit,
}: NumberStepperProps) {
  const decrement = () => {
    const next = parseFloat((value - step).toFixed(10))
    if (min === undefined || next >= min) onChange(next)
  }

  const increment = () => {
    const next = parseFloat((value + step).toFixed(10))
    if (max === undefined || next <= max) onChange(next)
  }

  const canDecrement = min === undefined || value > min
  const canIncrement = max === undefined || value < max

  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1)

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-1">
        <motion.div
          whileTap={{ scale: canDecrement ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button
            type="button"
            onClick={decrement}
            disabled={!canDecrement}
            className={[
              'min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg transition-colors duration-150',
              canDecrement
                ? 'text-[var(--text-primary)] hover:bg-[var(--border)] active:bg-[var(--border)]'
                : 'text-[var(--text-tertiary)] cursor-not-allowed',
            ].join(' ')}
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
        </motion.div>

        <div className="flex items-baseline gap-1 min-w-[64px] justify-center">
          <span
            className="text-2xl font-semibold tabular-nums"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {displayValue}
          </span>
          {unit && (
            <span className="text-sm text-[var(--text-secondary)]">{unit}</span>
          )}
        </div>

        <motion.div
          whileTap={{ scale: canIncrement ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button
            type="button"
            onClick={increment}
            disabled={!canIncrement}
            className={[
              'min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg transition-colors duration-150',
              canIncrement
                ? 'text-[var(--accent)] hover:bg-[var(--accent)]/10 active:bg-[var(--accent)]/20'
                : 'text-[var(--text-tertiary)] cursor-not-allowed',
            ].join(' ')}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
