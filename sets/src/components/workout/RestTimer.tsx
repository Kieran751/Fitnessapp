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
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border-t border-[var(--border)]"
      >
        <span className="text-sm font-medium text-[var(--text-secondary)]">Rest</span>
        <span
          className="text-lg font-semibold text-[var(--accent)] tabular-nums"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {formatSeconds(timer.remainingSeconds)}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">tap to expand</span>
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
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-elevated)] border-t border-[var(--border)] rounded-t-2xl pb-safe"
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
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider px-4 text-center truncate max-w-[280px]">
            {timer.exerciseName}
          </p>

          {/* Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 136 136">
              {/* Track */}
              <circle
                cx="68" cy="68" r={RADIUS}
                fill="none"
                stroke="var(--border)"
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
            <span
              className="text-3xl font-semibold tabular-nums text-[var(--text-primary)] z-10"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatSeconds(timer.remainingSeconds)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => adjust(-30)}
              className="flex flex-col items-center gap-1 text-[var(--text-secondary)]"
            >
              <span className="text-lg font-semibold">−30s</span>
            </button>

            <button
              type="button"
              onClick={skip}
              className="h-10 px-6 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)]"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={() => adjust(30)}
              className="flex flex-col items-center gap-1 text-[var(--text-secondary)]"
            >
              <span className="text-lg font-semibold">+30s</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
