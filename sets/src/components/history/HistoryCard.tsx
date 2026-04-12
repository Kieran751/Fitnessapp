import { motion } from 'framer-motion'
import { Clock, Dumbbell, Trophy } from 'lucide-react'
import { type Workout } from '../../db'
import { formatRelativeDate, formatDuration, formatVolume } from '../../lib/formatters'

interface HistoryCardProps {
  workout: Workout
  totalVolume: number
  exerciseCount: number
  setCount: number
  prCount: number
  unit: 'kg' | 'lbs'
  onClick: () => void
  index?: number
}

export function HistoryCard({
  workout,
  totalVolume,
  exerciseCount,
  setCount,
  prCount,
  unit,
  onClick,
  index = 0,
}: HistoryCardProps) {
  const duration =
    workout.completedAt && workout.startedAt
      ? formatDuration(new Date(workout.startedAt), new Date(workout.completedAt))
      : null

  const relDate = workout.completedAt
    ? formatRelativeDate(new Date(workout.completedAt))
    : formatRelativeDate(new Date(workout.startedAt))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.985 }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left rounded-3xl p-5 border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-all duration-150"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold text-[var(--text-primary)] truncate tracking-tight">
              {workout.name}
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{relDate}</p>
          </div>
          {prCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--gold-surface)] shrink-0">
              <Trophy size={11} className="text-[var(--gold)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--gold)]">
                {prCount} PR
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          {duration && (
            <span className="flex items-center gap-1.5 font-mono tabular">
              <Clock size={12} />
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Dumbbell size={12} />
            <span className="font-mono tabular">{exerciseCount}</span>ex &middot;{' '}
            <span className="font-mono tabular">{setCount}</span>sets
          </span>
          {totalVolume > 0 && (
            <span className="ml-auto font-mono tabular font-semibold text-[var(--text-primary)]">
              {formatVolume(totalVolume, unit)}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  )
}
