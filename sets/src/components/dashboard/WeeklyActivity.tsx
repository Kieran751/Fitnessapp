import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Workout, WorkoutSet } from '../../db'

function getWeekBounds(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export function WeeklyActivity() {
  const { monday, sunday } = getWeekBounds(0)
  const { monday: prevMonday, sunday: prevSunday } = getWeekBounds(-1)

  const todayIndex = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  const [thisWeekData, setThisWeekData] = useState<{ workouts: number; sets: number }[]>(
    Array.from({ length: 7 }, () => ({ workouts: 0, sets: 0 }))
  )
  const [prevWeekTotal, setPrevWeekTotal] = useState(0)

  useEffect(() => {
    async function loadThisWeek() {
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .not('completedAt', 'is', null)
        .gte('startedAt', monday.toISOString())
        .lte('startedAt', sunday.toISOString())

      const workouts = (workoutsData ?? []) as Workout[]
      const workoutIds = workouts.map((w) => w.id).filter((id): id is number => id != null)

      let allSets: WorkoutSet[] = []
      if (workoutIds.length > 0) {
        const { data: setsData } = await supabase
          .from('sets')
          .select('*')
          .in('workoutId', workoutIds)
        allSets = (setsData ?? []) as WorkoutSet[]
      }

      const days: { workouts: number; sets: number }[] = Array.from({ length: 7 }, () => ({
        workouts: 0,
        sets: 0,
      }))

      for (const w of workouts) {
        const d = new Date(w.startedAt).getDay()
        const idx = d === 0 ? 6 : d - 1
        days[idx].workouts += 1
      }

      for (const s of allSets) {
        const workout = workouts.find((w) => w.id === s.workoutId)
        if (workout) {
          const d = new Date(workout.startedAt).getDay()
          const idx = d === 0 ? 6 : d - 1
          days[idx].sets += 1
        }
      }

      setThisWeekData(days)
    }

    async function loadPrevWeek() {
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .not('completedAt', 'is', null)
        .gte('startedAt', prevMonday.toISOString())
        .lte('startedAt', prevSunday.toISOString())

      const workouts = (workoutsData ?? []) as Workout[]
      const workoutIds = workouts.map((w) => w.id).filter((id): id is number => id != null)

      if (workoutIds.length > 0) {
        const { data: setsData } = await supabase
          .from('sets')
          .select('*')
          .in('workoutId', workoutIds)
        setPrevWeekTotal((setsData ?? []).length)
      } else {
        setPrevWeekTotal(0)
      }
    }

    loadThisWeek()
    loadPrevWeek()
  }, [monday.getTime(), sunday.getTime()])

  const days = thisWeekData
  const maxSets = Math.max(...days.map((d) => d.sets), 1)
  const totalThisWeek = days.reduce((sum, d) => sum + d.sets, 0)
  const prevTotal = prevWeekTotal

  const percentChange =
    prevTotal > 0 ? Math.round(((totalThisWeek - prevTotal) / prevTotal) * 100) : null

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Weekly Activity
        </h3>
        {percentChange !== null && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              fontFamily: "'Manrope', sans-serif",
              background:
                percentChange >= 0
                  ? 'rgba(52, 211, 153, 0.12)'
                  : 'rgba(251, 113, 133, 0.12)',
              color: percentChange >= 0 ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {percentChange >= 0 ? '+' : ''}
            {percentChange}% vs last week
          </span>
        )}
      </div>

      {/* Bar chart */}
      <div
        className="flex items-end justify-between gap-2"
        style={{ height: 120 }}
      >
        {days.map((day, i) => {
          const barHeight = day.sets > 0 ? (day.sets / maxSets) * 100 : 0
          const minHeight = 4
          const finalHeight = Math.max(barHeight, minHeight)
          const isToday = i === todayIndex
          const hasData = day.sets > 0

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1"
              style={{ height: '100%', justifyContent: 'flex-end' }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${finalHeight}%` }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: [0.23, 1, 0.32, 1],
                }}
                style={{
                  width: '100%',
                  maxWidth: 32,
                  minHeight: minHeight,
                  borderRadius: '4px 4px 0 0',
                  background: isToday
                    ? 'var(--accent)'
                    : hasData
                      ? 'rgba(79, 124, 255, 0.5)'
                      : 'var(--bg-elevated)',
                  boxShadow: isToday
                    ? '0 0 12px rgba(79, 124, 255, 0.3)'
                    : 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Day labels */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIndex
          return (
            <span
              key={i}
              className="flex-1 text-center font-bold uppercase"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 11,
                color: isToday ? 'var(--accent)' : 'var(--text-tertiary)',
              }}
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
