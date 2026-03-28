import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Dumbbell, Settings, Zap, Calendar, TrendingUp, Scale, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { NumberStepper } from '../components/ui/NumberStepper'
import { TemplateQuickStart } from '../components/dashboard/TemplateQuickStart'
import { useWorkout } from '../hooks/useWorkout'
import { db } from '../db'
import { settingsAtom } from '../store/atoms'
import { formatRelativeDate, formatDuration } from '../lib/formatters'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay() // 0 = Sun
  // ISO week: Mon=0 offset
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function DashboardPage() {
  const { startFreestyle, startFromTemplate } = useWorkout()
  const navigate = useNavigate()
  const settings = useAtomValue(settingsAtom)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightValue, setWeightValue] = useState(80)

  const { monday, sunday } = getWeekBounds()

  const thisWeekCount = useLiveQuery(async () => {
    const workouts = await db.workouts
      .filter(
        (w) =>
          w.completedAt != null &&
          new Date(w.startedAt) >= monday &&
          new Date(w.startedAt) <= sunday,
      )
      .count()
    return workouts
  }, []) ?? 0

  const totalCount = useLiveQuery(async () => {
    return db.workouts.filter((w) => w.completedAt != null).count()
  }, []) ?? 0

  const recentWorkouts = useLiveQuery(async () => {
    const workouts = await db.workouts
      .filter((w) => w.completedAt != null)
      .toArray()
    workouts.sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return bTime - aTime
    })
    return workouts.slice(0, 3)
  }, [])

  const latestBodyWeight = useLiveQuery(async () => {
    const entries = await db.bodyWeights.orderBy('date').reverse().limit(1).toArray()
    return entries[0] ?? null
  }, [])

  async function saveBodyWeight() {
    await db.bodyWeights.add({ weight: weightValue, date: new Date() })
    setShowWeightModal(false)
  }

  const weightStep = settings.units === 'kg' ? 0.5 : 1

  return (
    <div className="flex flex-col min-h-full px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--accent)]"
            style={{ fontFamily: 'General Sans, sans-serif', letterSpacing: '-0.02em' }}
          >
            SETS
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Ready to train?</p>
        </motion.div>

        <Link to="/settings">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <Settings size={18} />
          </motion.div>
        </Link>
      </div>

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-6"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <Dumbbell size={20} className="text-[var(--accent)]" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Quick Start</p>
                <p className="text-sm text-[var(--text-secondary)]">Begin an empty workout</p>
              </div>
            </div>
            <Button size="lg" fullWidth onClick={startFreestyle}>
              <Zap size={18} />
              Start Workout
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        <Card className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Calendar size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">This Week</span>
          </div>
          <p
            className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {thisWeekCount}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">workouts</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <TrendingUp size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <p
            className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {totalCount}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">all time</p>
        </Card>
      </motion.div>

      {/* Body weight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mt-3"
      >
        <div
          className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 cursor-pointer hover:border-[var(--text-tertiary)] transition-colors duration-150"
          onClick={() => {
            if (latestBodyWeight) setWeightValue(latestBodyWeight.weight)
            setShowWeightModal(true)
          }}
        >
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Scale size={15} />
            <span className="text-sm font-medium text-[var(--text-primary)]">Body Weight</span>
          </div>
          {latestBodyWeight ? (
            <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {latestBodyWeight.weight} {settings.units}
            </span>
          ) : (
            <span className="text-xs text-[var(--accent)]">Log weight</span>
          )}
        </div>
      </motion.div>

      {/* Template Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="mt-6"
      >
        <TemplateQuickStart startFromTemplate={startFromTemplate} />
      </motion.div>

      {/* Recent workouts */}
      {recentWorkouts && recentWorkouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Recent
            </h2>
            <Link to="/history" className="text-xs font-medium text-[var(--accent)]">
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentWorkouts.map((w) => {
              const duration =
                w.completedAt && w.startedAt
                  ? formatDuration(new Date(w.startedAt), new Date(w.completedAt))
                  : null
              return (
                <motion.div key={w.id} whileTap={{ scale: 0.985 }}>
                  <button
                    type="button"
                    className="w-full text-left flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 hover:border-[var(--text-tertiary)] transition-colors duration-150"
                    onClick={() =>
                      navigate({
                        to: '/history/$workoutId',
                        params: { workoutId: String(w.id) },
                      })
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{w.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {w.completedAt ? formatRelativeDate(new Date(w.completedAt)) : ''}
                      </p>
                    </div>
                    {duration && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)] shrink-0 ml-3">
                        <Clock size={11} />
                        {duration}
                      </span>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="pb-6" />

      {/* Body weight modal */}
      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Log Body Weight"
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <NumberStepper
            value={weightValue}
            onChange={setWeightValue}
            step={weightStep}
            min={20}
            max={300}
            label="Weight"
            unit={settings.units}
          />
          <Button fullWidth onClick={saveBodyWeight}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
