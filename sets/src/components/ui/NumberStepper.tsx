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
    <div className="flex flex-col items-center gap-2">
      {label && <span className="label-caption">{label}</span>}
      <div className="flex items-center gap-2">
        <motion.div
          whileTap={{ scale: canDecrement ? 0.92 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button
            type="button"
            onClick={decrement}
            disabled={!canDecrement}
            className={[
              'min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[12px] transition-all duration-150',
              canDecrement
                ? 'text-[var(--text-primary)] hover:bg-[var(--glass-hover)]'
                : 'text-[var(--text-tertiary)] cursor-not-allowed opacity-40',
            ].join(' ')}
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
        </motion.div>

        <div className="flex items-baseline gap-1 min-w-[72px] justify-center">
          <span className="font-mono tabular text-2xl font-bold text-[var(--text-primary)]">
            {displayValue}
          </span>
          {unit && (
            <span className="text-sm text-[var(--text-tertiary)]">{unit}</span>
          )}
        </div>

        <motion.div
          whileTap={{ scale: canIncrement ? 0.92 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button
            type="button"
            onClick={increment}
            disabled={!canIncrement}
            className={[
              'min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[12px] transition-all duration-150',
              canIncrement
                ? 'text-[var(--accent)] hover:bg-[var(--primary-surface)]'
                : 'text-[var(--text-tertiary)] cursor-not-allowed opacity-40',
            ].join(' ')}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
