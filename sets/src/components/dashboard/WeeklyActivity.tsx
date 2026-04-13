import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'


// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekBounds(offset = 0) {
  const now = new Date()
  const dow = now.getDay()
  const mondayShift = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayShift + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function getMonthBounds(offset = 0) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0, 0)
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

function getMonthWeeks(offset = 0) {
  const { start: monthStart, end: monthEnd } = getMonthBounds(offset)
  const dow = monthStart.getDay()
  const shift = dow === 0 ? -6 : 1 - dow
  const firstMonday = new Date(monthStart)
  firstMonday.setDate(monthStart.getDate() + shift)

  const weeks: { monday: Date; sunday: Date }[] = []
  const cur = new Date(firstMonday)
  while (cur <= monthEnd) {
    const monday = new Date(cur)
    const sunday = new Date(cur)
    sunday.setDate(cur.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    weeks.push({ monday, sunday })
    cur.setDate(cur.getDate() + 7)
  }
  return { weeks, monthStart }
}

function formatWeekRange(monday: Date, sunday: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()} – ${sunday.getDate()} ${monday.toLocaleDateString('en-GB', { month: 'short' })}`
  }
  return `${fmt(monday)} – ${fmt(sunday)}`
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

type View = 'week' | 'month'

// ── Component ─────────────────────────────────────────────────────────────────

export function WeeklyActivity() {
  const [view, setView]     = useState<View>('week')
  const [offset, setOffset] = useState(0)

  // Week-view state
  const [weekData, setWeekData] = useState<{ sets: number }[]>(
    Array.from({ length: 7 }, () => ({ sets: 0 }))
  )
  // Month-view state
  const [monthWeekData, setMonthWeekData] = useState<{ sets: number; label: string }[]>([])

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })()
  const canGoForward = offset < 0

  // Fetch helpers
  async function fetchSetsForRange(from: Date, to: Date): Promise<number> {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id')
      .not('completedAt', 'is', null)
      .gte('startedAt', from.toISOString())
      .lte('startedAt', to.toISOString())

    const ids = ((workouts ?? []) as { id: number }[]).map(w => w.id)
    if (ids.length === 0) return 0

    const { count } = await supabase
      .from('sets')
      .select('*', { count: 'exact', head: true })
      .in('workoutId', ids)

    return count ?? 0
  }

  useEffect(() => {
    if (view === 'week') {
      const { monday, sunday } = getWeekBounds(offset)

      async function load() {
        const { data: workoutsData } = await supabase
          .from('workouts')
          .select('id, startedAt')
          .not('completedAt', 'is', null)
          .gte('startedAt', monday.toISOString())
          .lte('startedAt', sunday.toISOString())

        const workouts = (workoutsData ?? []) as { id: number; startedAt: string }[]
        const ids = workouts.map(w => w.id)

        const days = Array.from({ length: 7 }, () => ({ sets: 0 }))

        if (ids.length > 0) {
          const { data: setsData } = await supabase
            .from('sets')
            .select('workoutId')
            .in('workoutId', ids)

          const allSets = (setsData ?? []) as { workoutId: number }[]
          for (const s of allSets) {
            const w = workouts.find(wk => wk.id === s.workoutId)
            if (w) {
              const d = new Date(w.startedAt).getDay()
              const idx = d === 0 ? 6 : d - 1
              days[idx].sets += 1
            }
          }
        }

        setWeekData(days)
      }
      load()
    } else {
      // Month view — load sets per week within the month
      const { weeks } = getMonthWeeks(offset)

      async function load() {
        const results: { sets: number; label: string }[] = []
        for (const { monday, sunday } of weeks) {
          const count = await fetchSetsForRange(monday, sunday)
          results.push({
            sets: count,
            label: String(monday.getDate()),
          })
        }
        setMonthWeekData(results)
      }
      load()
    }
  }, [view, offset])

  // ── Derived display values ────────────────────────────────────────────────

  const bars = view === 'week'
    ? weekData.map((d, i) => ({ sets: d.sets, label: DAY_LABELS[i], isToday: i === todayIdx && offset === 0 }))
    : monthWeekData.map(d => ({ sets: d.sets, label: d.label, isToday: false }))

  const maxSets = Math.max(...bars.map(b => b.sets), 1)
  const total   = bars.reduce((sum, b) => sum + b.sets, 0)

  // Header label
  const headerLabel = (() => {
    if (view === 'week') {
      const { monday, sunday } = getWeekBounds(offset)
      return offset === 0 ? 'This Week' : formatWeekRange(monday, sunday)
    }
    const { monthStart } = getMonthWeeks(offset)
    return formatMonth(monthStart)
  })()

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
      {/* Title + view toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Activity
        </h3>

        {/* Segmented control */}
        <div
          className="flex rounded-lg overflow-hidden border border-[var(--glass-border)] text-xs font-semibold"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {(['week', 'month'] as View[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); setOffset(0) }}
              className="px-3 py-1.5 transition-colors capitalize"
              style={{
                background: view === v ? 'var(--primary-surface)' : 'transparent',
                color: view === v ? 'var(--accent)' : 'var(--text-tertiary)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-hover)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-center">
          <span
            className="text-sm font-semibold text-[var(--text-secondary)]"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {headerLabel}
          </span>
          {total > 0 && (
            <span className="ml-2 text-xs text-[var(--text-tertiary)]">
              {total} set{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOffset(o => o + 1)}
          disabled={!canGoForward}
          className={[
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
            canGoForward
              ? 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-hover)]'
              : 'text-[var(--glass-border)] cursor-not-allowed',
          ].join(' ')}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-1.5" style={{ height: 100 }}>
        {bars.map((bar, i) => {
          const barPct   = bar.sets > 0 ? (bar.sets / maxSets) * 100 : 0
          const finalPct = Math.max(barPct, 4)

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1"
              style={{ height: '100%', justifyContent: 'flex-end' }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${finalPct}%` }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  width: '100%',
                  minHeight: 4,
                  borderRadius: '4px 4px 0 0',
                  background: bar.isToday
                    ? 'var(--accent)'
                    : bar.sets > 0
                      ? 'rgba(79, 124, 255, 0.5)'
                      : 'var(--bg-elevated)',
                  boxShadow: bar.isToday ? '0 0 12px rgba(79, 124, 255, 0.3)' : 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between gap-1.5 mt-2">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="flex-1 text-center font-bold uppercase"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 10,
              color: bar.isToday ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  )
}
