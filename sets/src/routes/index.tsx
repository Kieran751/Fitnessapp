import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Play, Clock, Flame, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { NumberStepper } from '../components/ui/NumberStepper'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../hooks/useToast'
import { TemplateQuickStart } from '../components/dashboard/TemplateQuickStart'
import { WeeklyActivity } from '../components/dashboard/WeeklyActivity'
import { MuscleHeatmap } from '../components/dashboard/MuscleHeatmap'
import { BodyWeightChart } from '../components/dashboard/BodyWeightChart'
import { useWorkout } from '../hooks/useWorkout'
import { useStreak } from '../hooks/useStreak'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { settingsAtom } from '../store/atoms'
import { formatRelativeDate, formatDuration } from '../lib/formatters'
import type { Workout } from '../db'

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
  const { user } = useAuth()
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightValue, setWeightValue] = useState(80)

  const { monday, sunday } = getWeekBounds()

  const [statsLoading, setStatsLoading] = useState(true)
  const [thisWeekCount, setThisWeekCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[] | undefined>(undefined)
  const { show } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const [weekRes, totalRes, setsRes, recentRes] = await Promise.all([
          supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .not('completedAt', 'is', null)
            .gte('startedAt', monday.toISOString())
            .lte('startedAt', sunday.toISOString()),
          supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .not('completedAt', 'is', null),
          supabase.from('sets').select('weight, reps'),
          supabase
            .from('workouts')
            .select('*')
            .not('completedAt', 'is', null)
            .order('completedAt', { ascending: false })
            .limit(3),
        ])

        setThisWeekCount(weekRes.count ?? 0)
        setTotalCount(totalRes.count ?? 0)
        const vol = (setsRes.data ?? []).reduce((sum, s) => sum + s.weight * s.reps, 0)
        setTotalVolume(vol)
        setRecentWorkouts((recentRes.data ?? []) as Workout[])
      } catch {
        show("Couldn't load your dashboard. Pull down to retry.", 'error')
        setRecentWorkouts([])
      } finally {
        setStatsLoading(false)
      }
    }
    load()
  }, [])

  async function saveBodyWeight() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const userId = authUser!.id
      const { error } = await supabase
        .from('body_weights')
        .insert({ weight: weightValue, date: new Date(), userId })
      if (error) throw error
      setShowWeightModal(false)
    } catch {
      show("Couldn't save body weight. Try again.", 'error')
    }
  }

  const weightStep = settings.units === 'kg' ? 0.5 : 1
  const displayName = user?.user_metadata?.display_name || 'there'

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
          {getGreeting()},<br />{displayName}
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
        {statsLoading ? (
          <>
            <Skeleton height={88} radius="2xl" />
            <Skeleton height={88} radius="2xl" />
            <Skeleton height={88} radius="2xl" />
          </>
        ) : (
          <>
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
          </>
        )}
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
        <BodyWeightChart
          unit={settings.units}
          onLogWeight={() => setShowWeightModal(true)}
        />
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

      {/* Recent workouts skeleton */}
      {recentWorkouts === undefined && (
        <div className="mt-8 flex flex-col gap-2.5">
          <div className="h-7 w-40 mb-1">
            <Skeleton height={20} width={140} radius="md" />
          </div>
          <Skeleton height={64} radius="2xl" />
          <Skeleton height={64} radius="2xl" />
          <Skeleton height={64} radius="2xl" />
        </div>
      )}

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
