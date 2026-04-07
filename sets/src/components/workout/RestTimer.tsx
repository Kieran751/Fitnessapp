import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useRestTimer } from '../../hooks/useRestTimer'
import { formatSeconds } from '../../lib/formatters'

const RADIUS = 56
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RestTimer() {
  const { timer, skip, adjust, minimize, expand } = useRestTimer()

  if (!timer.isActive) return null

  const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0
  const offset = CIRCUMFERENCE * (1 - progress)

  // Minimised bar
  if (timer.isMinimized) {
    return (
      <motion.button
        type="button"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        onClick={expand}
        className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-full shadow-2xl"
      >
        <span className="label-caption">Rest</span>
        <span className="font-mono tabular text-xl font-bold text-[var(--accent)]">
          {formatSeconds(timer.remainingSeconds)}
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">expand</span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key="rest-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-overlay)] border-t border-[var(--border)] rounded-t-3xl pb-safe"
      >
        {/* Minimise button */}
        <div className="flex justify-end px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={minimize}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center pb-8 gap-4">
          {/* Exercise name */}
          <p className="label-caption px-4 text-center truncate max-w-[280px]">
            {timer.exerciseName}
          </p>

          {/* Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 136 136"
              style={{ filter: 'drop-shadow(0 0 12px rgba(190,242,100,0.35))' }}
            >
              {/* Track */}
              <circle
                cx="68" cy="68" r={RADIUS}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="4"
              />
              {/* Progress */}
              <circle
                cx="68" cy="68" r={RADIUS}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span className="font-mono tabular text-5xl font-bold text-[var(--text-primary)] z-10">
              {formatSeconds(timer.remainingSeconds)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => adjust(-30)}
              className="h-11 px-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              −30s
            </button>

            <button
              type="button"
              onClick={skip}
              className="h-11 px-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={() => adjust(30)}
              className="h-11 px-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              +30s
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
