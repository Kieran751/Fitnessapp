import { motion } from 'framer-motion'
import { Check, Trophy } from 'lucide-react'
import { useAtom } from 'jotai'
import { workoutSummaryAtom } from '../../store/atoms'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { formatDuration, formatVolume } from '../../lib/formatters'

export function WorkoutSummary() {
  const [summary, setSummary] = useAtom(workoutSummaryAtom)

  if (!summary) return null

  const durationMs = summary.completedAt.getTime() - summary.startedAt.getTime()

  const totalVolume = summary.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.isLogged).reduce((a, s) => a + s.weight * s.reps, 0)
  }, 0)

  const totalSets = summary.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.isLogged).length,
    0,
  )

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)] overflow-y-auto"
    >
      <div className="px-4 pt-safe pt-8 pb-12 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-[var(--success)]/20 flex items-center justify-center"
          >
            <Check size={32} className="text-[var(--success)]" strokeWidth={3} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Workout Complete</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{summary.workoutName}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Duration', value: formatDuration(durationMs) },
            { label: 'Volume', value: formatVolume(totalVolume) },
            { label: 'Sets', value: String(totalSets) },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Card className="text-center">
                <p
                  className="text-xl font-bold text-[var(--text-primary)] tabular-nums"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* PRs */}
        {summary.prs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Personal Records</span>
              </div>
              <div className="flex flex-col gap-2">
                {summary.prs.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">{pr.exerciseName}</span>
                    <span className="text-xs font-semibold text-amber-400">{pr.type} · {pr.value}kg</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Exercise breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Exercises</h2>
          <div className="flex flex-col gap-3">
            {summary.exercises.map((ex, i) => {
              const logged = ex.sets.filter(s => s.isLogged)
              if (logged.length === 0) return null
              return (
                <Card key={i}>
                  <p className="font-semibold text-sm text-[var(--text-primary)] mb-2">{ex.exercise.name}</p>
                  <div className="flex flex-col gap-1">
                    {logged.map((s, si) => (
                      <div key={si} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="w-4 text-[var(--text-tertiary)]">{si + 1}</span>
                        <span
                          className="tabular-nums"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {s.weight}kg × {s.reps} reps
                        </span>
                        {s.isPR && <span className="text-amber-400 text-[10px] font-bold">PR</span>}
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* Done */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button fullWidth size="lg" onClick={() => setSummary(null)}>
            Done
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
