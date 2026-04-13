import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { NumberStepper } from '../ui/NumberStepper'
import { type SetState } from '../../store/atoms'

interface SetRowProps {
  set: SetState
  setIdx: number
  exerciseIdx: number
  previousWeight?: number
  previousReps?: number
  unit: 'kg' | 'lbs'
  canDelete: boolean
  onLog: (exerciseIdx: number, setIdx: number) => void
  onUpdate: (exerciseIdx: number, setIdx: number, updates: Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>) => void
  onUncomplete: (exerciseIdx: number, setIdx: number) => void
  onRemove: (exerciseIdx: number, setIdx: number) => void
}

export function SetRow({
  set, setIdx, exerciseIdx,
  previousWeight, previousReps,
  unit, canDelete, onLog, onUpdate, onUncomplete, onRemove,
}: SetRowProps) {
  const [showGreen, setShowGreen] = useState(false)
  const [showPR, setShowPR] = useState(false)
  const x = useMotionValue(0)
  const deleteBg = useTransform(x, [-80, -20, 0], [1, 0, 0])

  // Watch for PR (set asynchronously after background DB check)
  useEffect(() => {
    if (set.isPR) {
      setShowPR(true)
      const timer = setTimeout(() => setShowPR(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [set.isPR])

  function handleLog() {
    onLog(exerciseIdx, setIdx)
    setShowGreen(true)
    setTimeout(() => setShowGreen(false), 500)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && canDelete) {
      onRemove(exerciseIdx, setIdx)
    }
  }

  const hasPrev = previousWeight !== undefined && previousReps !== undefined
  const weightStep = 1
  const weightFastStep = unit === 'lbs' ? 10 : 5

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Red delete background revealed on swipe */}
      {canDelete && (
        <motion.div
          className="absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-r-xl"
          style={{ opacity: deleteBg, backgroundColor: 'var(--danger)' }}
        >
          <Trash2 size={16} className="text-white" />
        </motion.div>
      )}

      <motion.div
        drag={canDelete ? 'x' : false}
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative"
      >
        <div
          className={['px-3 py-2.5 rounded-xl', set.isLogged ? 'opacity-90' : ''].join(' ')}
          style={{
            backgroundColor: showGreen
              ? 'rgba(79, 124, 255, 0.14)'
              : set.isLogged
                ? 'rgba(79, 124, 255, 0.05)'
                : 'transparent',
            transform: showGreen ? 'scale(1.01)' : 'scale(1)',
            transition: 'background-color 0.4s, transform 0.4s',
          }}
        >
          <div className="flex items-center gap-2">
            {/* Set number */}
            <div
              className={[
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tabular',
                set.isLogged
                  ? 'bg-[var(--primary-surface)] text-[var(--accent)]'
                  : 'bg-[var(--glass)] text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {set.setNumber}
            </div>

            {/* Previous */}
            <div style={{ width: 44, flexShrink: 0 }} className="text-center">
              <span className="font-mono tabular text-xs text-[var(--text-tertiary)]">
                {hasPrev ? `${previousWeight}\u00D7${previousReps}` : '\u2014'}
              </span>
            </div>

            {/* Weight */}
            <div className="flex-1 min-w-0">
              {set.isLogged ? (
                <p className="text-center font-mono tabular font-semibold text-sm text-[var(--text-primary)]">
                  {set.weight}
                </p>
              ) : (
                <NumberStepper
                  value={set.weight}
                  onChange={v => onUpdate(exerciseIdx, setIdx, { weight: v })}
                  step={weightStep}
                  fastStep={weightFastStep}
                  min={0}
                  unit={unit}
                  compact
                />
              )}
            </div>

            {/* Reps */}
            <div className="flex-1 min-w-0">
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
                  compact
                />
              )}
            </div>

            {/* Log / check button */}
            <motion.div whileTap={{ scale: 0.9 }} style={{ flexShrink: 0 }}>
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
        </div>
      </motion.div>
    </div>
  )
}
