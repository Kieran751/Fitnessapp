import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Play, Scale, Clock, Flame, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { NumberStepper } from '../components/ui/NumberStepper'
import { TemplateQuickStart } from '../components/dashboard/TemplateQuickStart'
import { WeeklyActivity } from '../components/dashboard/WeeklyActivity'
import { MuscleHeatmap } from '../components/dashboard/MuscleHeatmap'
import { useWorkout } from '../hooks/useWorkout'
import { useStreak } from '../hooks/useStreak'
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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate() {
  const now = new Date()
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
}

function DashboardPage() {
  const { startFreestyle, startFromTemplate } = useWorkout()
  const navigate = useNavigate()
  const settings = useAtomValue(settingsAtom)
  const streak = useStreak()
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

  const totalVolume = useLiveQuery(async () => {
    const allSets = await db.sets.toArray()
    return allSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
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

  function formatVolumeShort(vol: number) {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`
    return String(vol)
  }

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe pb-28">
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pt-8 pb-2"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center border border-[var(--glass-border)]"
            style={{
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
            }}
          >
            <User size={20} className="text-[var(--text-secondary)]" />
          </div>
          <h1
            className="text-xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            SETS
          </h1>
        </div>

        {streak > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.25)',
            }}
          >
            <Flame size={16} style={{ color: '#F59E0B' }} />
            <span
              className="text-sm font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: "'Manrope', sans-serif", color: '#F59E0B' }}
            >
              {streak} DAY STREAK
            </span>
          </div>
        )}
      </motion.div>

      {/* Date + Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-4"
      >
        <p
          className="text-xs font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {getFormattedDate()}
        </p>
        <h2
          className="text-[40px] font-bold text-[var(--text-primary)] mt-1 leading-[1.1]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
        >
          {getGreeting()},<br />Kieran
        </h2>
      </motion.div>

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-8"
      >
        <Button size="lg" fullWidth onClick={startFreestyle}>
          <Play size={18} fill="currentColor" />
          Start Workout
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-6 grid grid-cols-3 gap-3"
      >
        <div
          className="flex flex-col items-center py-4 px-3 rounded-2xl border border-[var(--glass-border)]"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <p className="font-mono tabular text-2xl font-bold text-[var(--text-primary)]">
            {thisWeekCount}
          </p>
          <p
            className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] mt-1"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            THIS WEEK
          </p>
        </div>
        <div
          className="flex flex-col items-center py-4 px-3 rounded-2xl border border-[var(--glass-border)]"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <p className="font-mono tabular text-2xl font-bold text-[var(--text-primary)]">
            {totalCount}
          </p>
          <p
            className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] mt-1"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            TOTAL
          </p>
        </div>
        <div
          className="flex flex-col items-center py-4 px-3 rounded-2xl border border-[var(--glass-border)]"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <p className="font-mono tabular text-2xl font-bold text-[var(--text-primary)]">
            {formatVolumeShort(totalVolume)}
          </p>
          <p
            className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] mt-1"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            VOLUME
          </p>
        </div>
      </motion.div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        className="mt-6"
      >
        <WeeklyActivity />
      </motion.div>

      {/* Body weight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mt-3"
      >
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-4 cursor-pointer border border-[var(--glass-border)] transition-all duration-150 hover:bg-[var(--glass-hover)]"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          onClick={() => {
            if (latestBodyWeight) setWeightValue(latestBodyWeight.weight)
            setShowWeightModal(true)
          }}
        >
          <div className="flex items-center gap-2.5">
            <Scale size={15} className="text-[var(--text-tertiary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Body Weight</span>
          </div>
          {latestBodyWeight ? (
            <span className="font-mono tabular text-base font-bold text-[var(--text-primary)]">
              {latestBodyWeight.weight} <span className="text-[var(--text-tertiary)] text-xs">{settings.units}</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-[0.05em]">Log weight</span>
          )}
        </div>
      </motion.div>

      {/* Template Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="mt-8"
      >
        <TemplateQuickStart startFromTemplate={startFromTemplate} />
      </motion.div>

      {/* Weekly Muscle Focus */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.32 }}
        className="mt-6"
      >
        <MuscleHeatmap />
      </motion.div>

      {/* Recent workouts */}
      {recentWorkouts && recentWorkouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Recent Sessions
            </h2>
            <Link
              to="/history"
              className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              VIEW ALL
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentWorkouts.map((w) => {
              const duration =
                w.completedAt && w.startedAt
                  ? formatDuration(new Date(w.startedAt), new Date(w.completedAt))
                  : null
              return (
                <motion.div key={w.id} whileTap={{ scale: 0.985 }}>
                  <button
                    type="button"
                    className="w-full text-left flex items-center justify-between rounded-2xl px-5 py-4 border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-all duration-150"
                    style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                    onClick={() =>
                      navigate({
                        to: '/history/$workoutId',
                        params: { workoutId: String(w.id) },
                      })
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--text-primary)] truncate tracking-tight">{w.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {w.completedAt ? formatRelativeDate(new Date(w.completedAt)) : ''}
                      </p>
                    </div>
                    {duration && (
                      <span className="flex items-center gap-1.5 font-mono tabular text-xs text-[var(--text-tertiary)] shrink-0 ml-3">
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
