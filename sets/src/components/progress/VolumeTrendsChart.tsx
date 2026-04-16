import { useState, useEffect, useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useAtomValue } from 'jotai'
import { supabase } from '../../lib/supabase'
import { settingsAtom } from '../../store/atoms'
import { nivoTheme, getDateBoundary, type TimeRange } from './nivoTheme'

interface SetRow {
  weight: number
  reps: number
  timestamp: string
}

function getISOWeek(date: Date): string {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const yearStart = new Date(d.getFullYear(), 0, 4)
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${weekNo}`
}

function weekLabel(weekKey: string, date: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const weekNum = weekKey.split('-W')[1]
  return `W${weekNum} ${months[date.getMonth()]}`
}

export function VolumeTrendsChart({ range }: { range: TimeRange }) {
  const settings = useAtomValue(settingsAtom)
  const [sets, setSets] = useState<SetRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('sets')
        .select('weight, reps, timestamp')
        .gt('weight', 0)
        .order('timestamp', { ascending: true })

      const boundary = getDateBoundary(range)
      if (boundary) {
        query = query.gte('timestamp', boundary)
      }

      const { data } = await query
      setSets((data ?? []) as SetRow[])
      setLoading(false)
    }
    load()
  }, [range])

  const unit = settings.units

  const chartData = useMemo(() => {
    const weeks = new Map<string, { volume: number; firstDate: Date }>()

    for (const s of sets) {
      const date = new Date(s.timestamp)
      const key = getISOWeek(date)
      const vol = s.weight * s.reps
      const existing = weeks.get(key)
      if (existing) {
        existing.volume += vol
      } else {
        weeks.set(key, { volume: vol, firstDate: date })
      }
    }

    return [...weeks.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { volume, firstDate }]) => ({
        week: weekLabel(key, firstDate),
        volume: unit === 'lbs' ? Math.round(volume * 2.205) : Math.round(volume),
      }))
  }, [sets, unit])

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          No volume data yet
        </p>
      </div>
    )
  }

  function formatVol(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return String(v)
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveBar
        data={chartData}
        keys={['volume']}
        indexBy="week"
        theme={nivoTheme}
        margin={{ top: 12, right: 12, bottom: 40, left: 52 }}
        padding={0.35}
        colors={['#4F7CFF']}
        borderRadius={4}
        enableLabel={false}
        enableGridY={true}
        enableGridX={false}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: -45,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (v: number) => formatVol(v),
        }}
        tooltip={({ data }) => (
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
            <p className="font-semibold">{data.week as string}</p>
            <p className="font-mono mt-1">{(data.volume as number).toLocaleString()} {unit}</p>
          </div>
        )}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  )
}
