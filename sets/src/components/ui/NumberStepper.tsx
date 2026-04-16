import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  step?: number
  /** After holding 2 s, jumps switch to this step size */
  fastStep?: number
  min?: number
  max?: number
  label?: string
  unit?: string
  /** Compact inline layout for tight row spaces */
  compact?: boolean
}

export function NumberStepper({
  value, onChange, step = 1, fastStep, min, max, label, unit, compact = false,
}: NumberStepperProps) {
  const valueRef = useRef(value)
  valueRef.current = value

  const intervalRef    = useRef<ReturnType<typeof setInterval>  | null>(null)
  const holdRef        = useRef<ReturnType<typeof setTimeout>   | null>(null)
  const fastRef        = useRef<ReturnType<typeof setTimeout>   | null>(null)

  const canDecrement = min === undefined || value > min
  const canIncrement = max === undefined || value < max
  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1)

  // Native picker options (used in compact mode)
  const pickerOptions = useMemo(() => {
    const pMin = min ?? 0
    const pMax = unit ? 300 : 100
    return Array.from({ length: pMax - pMin + 1 }, (_, i) => pMin + i)
  }, [min, unit])

  function applyChange(dir: 1 | -1, s: number) {
    const next = parseFloat((valueRef.current + dir * s).toFixed(10))
    if (dir === -1 && min !== undefined && next < min) return
    if (dir ===  1 && max !== undefined && next > max) return
    navigator.vibrate?.(10)
    onChange(next)
  }

  function clearAll() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (holdRef.current)     { clearTimeout(holdRef.current);      holdRef.current     = null }
    if (fastRef.current)     { clearTimeout(fastRef.current);      fastRef.current     = null }
  }

  function handlePointerDown(dir: 1 | -1) {
    applyChange(dir, step)
    holdRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => applyChange(dir, step), 120)
      if (fastStep) {
        fastRef.current = setTimeout(() => {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = setInterval(() => applyChange(dir, fastStep), 120)
        }, 1600)
      }
    }, 400)
  }

  // ── Compact layout (set rows) ──────────────────────────────────────
  if (compact) {
    const btnStyle = { width: 36, height: 44, flexShrink: 0 } as const
    return (
      <div className="flex items-center bg-[var(--glass)] border border-[var(--glass-border)] rounded-xl overflow-hidden" style={{ minWidth: 0 }}>
        <button
          type="button"
          onPointerDown={canDecrement ? () => handlePointerDown(-1) : undefined}
          onPointerUp={clearAll}
          onPointerLeave={clearAll}
          onPointerCancel={clearAll}
          disabled={!canDecrement}
          style={btnStyle}
          className={[
            'flex items-center justify-center transition-colors select-none touch-none',
            canDecrement
              ? 'text-[var(--text-primary)] active:bg-[var(--glass-hover)]'
              : 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed',
          ].join(' ')}
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>

        <div className="flex-1 relative flex items-center justify-center gap-0.5 self-stretch" style={{ minWidth: 0 }}>
          <span className="font-mono tabular font-semibold text-base text-[var(--text-primary)]">
            {displayValue}
          </span>
          {unit && (
            <span className="text-[10px] text-[var(--text-tertiary)]">{unit}</span>
          )}
          {/* Native iOS picker overlay — tapping opens scroll wheel */}
          <select
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer"
            style={{ fontSize: '16px' }}
          >
            {pickerOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onPointerDown={canIncrement ? () => handlePointerDown(1) : undefined}
          onPointerUp={clearAll}
          onPointerLeave={clearAll}
          onPointerCancel={clearAll}
          disabled={!canIncrement}
          style={btnStyle}
          className={[
            'flex items-center justify-center transition-colors select-none touch-none',
            canIncrement
              ? 'text-[var(--accent)] active:bg-[var(--primary-surface)]'
              : 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed',
          ].join(' ')}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  // ── Default layout ─────────────────────────────────────────────────
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
            onClick={() => applyChange(-1, step)}
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
            onClick={() => applyChange(1, step)}
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
