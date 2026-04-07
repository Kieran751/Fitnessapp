import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { EmptyState } from '../components/ui/EmptyState'
import { HistoryCard } from '../components/history/HistoryCard'
import { db, type Workout } from '../db'
import { settingsAtom } from '../store/atoms'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

interface WorkoutSummary {
  workout: Workout
  totalVolume: number
  exerciseCount: number
  setCount: number
  prCount: number
}

function HistoryPage() {
  const navigate = useNavigate()
  const settings = useAtomValue(settingsAtom)

  const summaries = useLiveQuery(async (): Promise<WorkoutSummary[]> => {
    const workouts = await db.workouts
      .filter((w) => w.completedAt != null)
      .toArray()

    // Sort descending by completedAt
    workouts.sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return bTime - aTime
    })

    const result: WorkoutSummary[] = []
    for (const workout of workouts) {
      if (workout.id == null) continue
      const sets = await db.sets.where('workoutId').equals(workout.id).toArray()
      const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      const exerciseIds = new Set(sets.map((s) => s.exerciseId))
      const prs = await db.personalRecords
        .where('workoutId')
        .equals(workout.id)
        .count()
      result.push({
        workout,
        totalVolume,
        exerciseCount: exerciseIds.size,
        setCount: sets.length,
        prCount: prs,
      })
    }
    return result
  }, [])

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-8 pb-2"
      >
        <h1
          className="text-4xl font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.03em' }}
        >
          History
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Every session you've logged</p>
      </motion.div>

      {summaries === undefined ? (
        // Loading state
        <div className="flex-1" />
      ) : summaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex-1 flex items-center justify-center"
        >
          <EmptyState
            icon={History}
            title="No workouts yet"
            description="Your completed workouts will appear here after you log them"
          />
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3 mt-4 pb-8">
          {summaries.map((s, i) => (
            <HistoryCard
              key={s.workout.id}
              workout={s.workout}
              totalVolume={s.totalVolume}
              exerciseCount={s.exerciseCount}
              setCount={s.setCount}
              prCount={s.prCount}
              unit={settings.units}
              index={i}
              onClick={() => navigate({ to: '/history/$workoutId', params: { workoutId: String(s.workout.id) } })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
