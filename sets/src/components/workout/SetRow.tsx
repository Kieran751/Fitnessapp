import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { NumberStepper } from '../ui/NumberStepper'
import { type SetState, type SetType } from '../../store/atoms'

const SET_TYPE_CONFIG: Record<SetType, { label: string; style: string; next: SetType }> = {
  normal:  { label: 'N',  style: 'bg-[var(--glass)] text-[var(--text-tertiary)]', next: 'warmup' },
  warmup:  { label: 'W',  style: 'bg-[var(--gold-surface)] text-[var(--gold)]', next: 'dropset' },
  dropset: { label: 'D',  style: 'bg-[var(--secondary-surface)] text-[var(--secondary)]', next: 'failure' },
  failure: { label: 'F',  style: 'bg-[var(--danger-surface)] text-[var(--danger)]', next: 'normal' },
}

interface SetRowProps {
  set: SetState
  setIdx: number
  exerciseIdx: number
  previousWeight?: number
  previousReps?: number
  unit: 'kg' | 'lbs'
  onLog: (exerciseIdx: number, setIdx: number) => Promise<{ isPR: boolean }>
  onUpdate: (exerciseIdx: number, setIdx: number, updates: Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>) => void
  onUncomplete: (exerciseIdx: number, setIdx: number) => void
}

export function SetRow({
  set, setIdx, exerciseIdx,
  previousWeight, previousReps,
  unit, onLog, onUpdate, onUncomplete,
}: SetRowProps) {
  const [logging, setLogging] = useState(false)
  const [showGreen, setShowGreen] = useState(false)
  const [showPR, setShowPR] = useState(false)

  async function handleLog() {
    if (logging) return
    setLogging(true)
    const result = await onLog(exerciseIdx, setIdx)
    setShowGreen(true)
    setTimeout(() => setShowGreen(false), 500)
    if (result.isPR) {
      setShowPR(true)
      setTimeout(() => setShowPR(false), 3000)
    }
    setLogging(false)
  }

  function cycleSetType() {
    onUpdate(exerciseIdx, setIdx, { setType: SET_TYPE_CONFIG[set.setType].next })
  }

  const hasPrev = previousWeight !== undefined && previousReps !== undefined
  const weightStep = unit === 'lbs' ? 5 : 2.5

  return (
    <motion.div
      layout
      animate={{
        backgroundColor: showGreen
          ? 'rgba(79, 124, 255, 0.14)'
          : set.isLogged
            ? 'rgba(79, 124, 255, 0.05)'
            : 'transparent',
        scale: showGreen ? 1.01 : 1,
      }}
      transition={{ duration: 0.4 }}
      className={['rounded-xl px-3 py-2.5', set.isLogged ? 'opacity-90' : ''].join(' ')}
    >
      <div className="flex items-center gap-2">
        {/* Set type badge */}
        <button
          type="button"
          onClick={set.isLogged ? undefined : cycleSetType}
          className={[
            'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tabular transition-colors',
            set.setType === 'normal' && set.isLogged
              ? 'bg-[var(--primary-surface)] text-[var(--accent)]'
              : SET_TYPE_CONFIG[set.setType].style,
          ].join(' ')}
        >
          {set.setType === 'normal' ? set.setNumber : SET_TYPE_CONFIG[set.setType].label}
        </button>

        {/* Previous */}
        <div className="w-16 text-center">
          <span className="font-mono tabular text-xs text-[var(--text-tertiary)]">
            {hasPrev ? `${previousWeight}\u00D7${previousReps}` : '\u2014'}
          </span>
        </div>

        {/* Weight */}
        <div className="flex-1">
          {set.isLogged ? (
            <p className="text-center font-mono tabular font-semibold text-sm text-[var(--text-primary)]">
              {set.weight}
            </p>
          ) : (
            <NumberStepper
              value={set.weight}
              onChange={v => onUpdate(exerciseIdx, setIdx, { weight: v })}
              step={weightStep}
              min={0}
              unit={unit}
            />
          )}
        </div>

        {/* Reps */}
        <div className="flex-1">
          {set.isLogged ? (
            <p className="text-center font-mono tabular font-semibold text-sm text-[var(--text-primary)]">
              {set.reps}
            </p>
          ) : (
            <NumberStepper
              value={set.reps}
              onChange={v => onUpdate(exerciseIdx, setIdx, { reps: v })}
              step={1}
              min={1}
            />
          )}
        </div>

        {/* Log / check button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <button
            type="button"
            onClick={set.isLogged ? () => onUncomplete(exerciseIdx, setIdx) : handleLog}
            className={[
              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
              set.isLogged
                ? 'text-[var(--on-primary)]'
                : 'border-2 border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
            ].join(' ')}
            style={set.isLogged ? {
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              boxShadow: '0 4px 16px rgba(79, 124, 255, 0.25)',
            } : undefined}
          >
            <Check size={16} strokeWidth={3} />
          </button>
        </motion.div>
      </div>

      {/* PR badge */}
      <AnimatePresence>
        {showPR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-1 flex justify-end"
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full bg-[var(--gold-surface)] text-[var(--gold)]">
              New PR
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
