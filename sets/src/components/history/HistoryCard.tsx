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
        className="w-full text-left bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--text-tertiary)] transition-colors duration-150"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{workout.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{relDate}</p>
          </div>
          {prCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--warning)]/15 border border-[var(--warning)]/30 shrink-0">
              <Trophy size={11} className="text-[var(--warning)]" />
              <span className="text-xs font-semibold text-[var(--warning)]">{prCount} PR</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Dumbbell size={12} />
            {exerciseCount} exercises · {setCount} sets
          </span>
          {totalVolume > 0 && (
            <span className="ml-auto font-medium text-[var(--text-primary)]">
              {formatVolume(totalVolume, unit)}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  )
}
