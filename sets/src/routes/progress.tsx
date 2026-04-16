import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp, Dumbbell, BarChart3, CalendarDays, Trophy, Target } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../hooks/useToast'
import { ExerciseProgressChart } from '../components/progress/ExerciseProgressChart'
import { VolumeTrendsChart } from '../components/progress/VolumeTrendsChart'
import { WorkoutCalendar } from '../components/progress/WorkoutCalendar'
import { PRBoard } from '../components/progress/PRBoard'
import { MuscleVolumeChart } from '../components/progress/MuscleVolumeChart'
import type { TimeRange } from '../components/progress/nivoTheme'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})

const RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL']

function ProgressPage() {
  const [range, setRange] = useState<TimeRange>('3M')
  const [hasWorkouts, setHasWorkouts] = useState<boolean | null>(null)
  const { show } = useToast()

  useEffect(() => {
    supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .not('completedAt', 'is', null)
      .then(({ count, error }) => {
        if (error) {
          show("Couldn't load progress. Try again.", 'error')
          setHasWorkouts(false)
          return
        }
        setHasWorkouts((count ?? 0) > 0)
      })
  }, [])

  // Loading
  if (hasWorkouts === null) {
    return (
      <div className="flex flex-col min-h-full px-5 pt-safe pb-28">
        <div className="pt-8 pb-2">
          <h1
            className="text-4xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
          >
            Progress
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track your gains over time</p>
        </div>
        <div className="flex gap-2 mt-4 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={32} radius="lg" style={{ flex: 1 }} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton height={320} radius="3xl" />
          <Skeleton height={260} radius="3xl" />
          <Skeleton height={200} radius="3xl" />
          <Skeleton height={240} radius="3xl" />
          <Skeleton height={260} radius="3xl" />
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasWorkouts) {
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
            Progress
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track your gains over time</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex-1 flex items-center justify-center"
        >
          <EmptyState
            icon={TrendingUp}
            title="Complete a workout to see progress"
            description="Your strength trends, PRs, and volume will appear here"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe pb-28">
      {/* Header */}
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
          Progress
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Track your gains over time</p>
      </motion.div>

      {/* Time range selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex gap-2 mt-4 mb-6"
      >
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className="flex-1 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all duration-150 border"
            style={{
              fontFamily: "'Manrope', sans-serif",
              background: range === r ? 'var(--accent)' : 'var(--glass)',
              color: range === r ? '#fff' : 'var(--text-secondary)',
              borderColor: range === r ? 'var(--accent)' : 'var(--glass-border)',
            }}
          >
            {r}
          </button>
        ))}
      </motion.div>

      {/* Strength Progression */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Section icon={Dumbbell} title="Strength Progression" subtitle="Estimated 1RM over time">
          <ExerciseProgressChart range={range} />
        </Section>
      </motion.div>

      {/* Volume Trends */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mt-4"
      >
        <Section icon={BarChart3} title="Volume Trends" subtitle="Total weekly training volume">
          <VolumeTrendsChart range={range} />
        </Section>
      </motion.div>

      {/* Workout Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-4"
      >
        <Section icon={CalendarDays} title="Consistency" subtitle="Training day heatmap">
          <WorkoutCalendar range={range} />
        </Section>
      </motion.div>

      {/* Personal Records */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mt-4"
      >
        <Section icon={Trophy} title="Personal Records" subtitle="Your strongest lifts">
          <PRBoard range={range} />
        </Section>
      </motion.div>

      {/* Muscle Volume Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="mt-4"
      >
        <Section icon={Target} title="Muscle Focus" subtitle="Sets per muscle group">
          <MuscleVolumeChart range={range} />
        </Section>
      </motion.div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className="text-[var(--text-tertiary)]" />
        <h3
          className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>
      </div>
      <p
        className="text-[11px] text-[var(--text-tertiary)] mb-4"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {subtitle}
      </p>
      {children}
    </div>
  )
}
