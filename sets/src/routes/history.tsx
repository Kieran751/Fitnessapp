import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { EmptyState } from '../components/ui/EmptyState'
import { HistoryCard } from '../components/history/HistoryCard'
import { type Workout } from '../db'
import { supabase } from '../lib/supabase'
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

  const [summaries, setSummaries] = useState<WorkoutSummary[] | undefined>(undefined)

  useEffect(() => {
    async function load() {
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .not('completedAt', 'is', null)
        .order('completedAt', { ascending: false })

      if (!workouts || workouts.length === 0) {
        setSummaries([])
        return
      }

      const result: WorkoutSummary[] = []
      for (const workout of workouts as Workout[]) {
        if (workout.id == null) continue
        const { data: sets } = await supabase
          .from('sets')
          .select('*')
          .eq('workoutId', workout.id)

        const setsArr = sets ?? []
        const totalVolume = setsArr.reduce((sum, s) => sum + s.weight * s.reps, 0)
        const exerciseIds = new Set(setsArr.map((s) => s.exerciseId))

        const { count: prCount } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('workoutId', workout.id)

        result.push({
          workout,
          totalVolume,
          exerciseCount: exerciseIds.size,
          setCount: setsArr.length,
          prCount: prCount ?? 0,
        })
      }
      setSummaries(result)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe pb-28">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-8 pb-2"
      >
        <h1
          className="text-4xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
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
        <div className="flex flex-col gap-3 mt-4">
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
