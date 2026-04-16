import { useState, useEffect, useMemo } from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'
import { supabase } from '../../lib/supabase'
import { getDateBoundary, type TimeRange } from './nivoTheme'

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function WorkoutCalendar({ range }: { range: TimeRange }) {
  const [workouts, setWorkouts] = useState<Array<{ completedAt: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('workouts')
        .select('completedAt')
        .not('completedAt', 'is', null)
        .order('completedAt', { ascending: true })

      const boundary = getDateBoundary(range)
      if (boundary) {
        query = query.gte('completedAt', boundary)
      }

      const { data } = await query
      setWorkouts((data ?? []) as Array<{ completedAt: string }>)
      setLoading(false)
    }
    load()
  }, [range])

  const { calendarData, from, to } = useMemo(() => {
    if (workouts.length === 0) {
      const now = new Date()
      const threeMonthsAgo = new Date(now)
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      return { calendarData: [], from: toDateString(threeMonthsAgo), to: toDateString(now) }
    }

    const counts = new Map<string, number>()
    for (const w of workouts) {
      const day = w.completedAt.split('T')[0]
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }

    const data = [...counts.entries()].map(([day, value]) => ({ day, value }))

    // Determine date bounds
    const boundary = getDateBoundary(range)
    const fromDate = boundary ? boundary.split('T')[0] : data[0]?.day ?? toDateString(new Date())
    const toDate = toDateString(new Date())

    return { calendarData: data, from: fromDate, to: toDate }
  }, [workouts, range])

  if (loading) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          No workouts logged yet
        </p>
      </div>
    )
  }

  return (
    <div style={{ height: 180 }}>
      <ResponsiveCalendar
        data={calendarData}
        from={from}
        to={to}
        emptyColor="rgba(255,255,255,0.03)"
        colors={['rgba(79,124,255,0.2)', 'rgba(79,124,255,0.45)', 'rgba(79,124,255,0.7)', '#4F7CFF']}
        dayBorderWidth={1}
        dayBorderColor="rgba(255,255,255,0.04)"
        monthBorderWidth={0}
        monthLegendOffset={10}
        yearLegend={() => ''
        }
        tooltip={({ day, value }) => (
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontFamily: "'Manrope', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            <p className="font-semibold">{new Date(day + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</p>
            <p className="mt-0.5">{value ? `${value} workout${Number(value) !== 1 ? 's' : ''}` : 'Rest day'}</p>
          </div>
        )}
        theme={{
          text: { fill: 'var(--text-tertiary)', fontFamily: "'Manrope', sans-serif", fontSize: 10 },
          labels: { text: { fill: 'var(--text-tertiary)', fontSize: 10 } },
        }}
      />
    </div>
  )
}
