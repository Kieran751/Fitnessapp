import { useState, useEffect, useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { supabase } from '../../lib/supabase'
import { nivoTheme, getDateBoundary, type TimeRange } from './nivoTheme'

interface SetWithExercise {
  exerciseId: number
  exercises: { muscleGroup: string } | null
}

export function MuscleVolumeChart({ range }: { range: TimeRange }) {
  const [sets, setSets] = useState<SetWithExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('sets')
        .select('exerciseId, timestamp, exercises(muscleGroup)')

      const boundary = getDateBoundary(range)
      if (boundary) {
        query = query.gte('timestamp', boundary)
      }

      const { data } = await query
      setSets((data ?? []) as unknown as SetWithExercise[])
      setLoading(false)
    }
    load()
  }, [range])

  const chartData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of sets) {
      const group = s.exercises?.muscleGroup ?? 'Other'
      counts.set(group, (counts.get(group) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([muscle, setCount]) => ({ muscle, sets: setCount }))
  }, [sets])

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
          No training data yet
        </p>
      </div>
    )
  }

  const chartHeight = Math.max(chartData.length * 40, 120)

  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveBar
        data={chartData}
        keys={['sets']}
        indexBy="muscle"
        layout="horizontal"
        theme={nivoTheme}
        margin={{ top: 4, right: 32, bottom: 4, left: 90 }}
        padding={0.3}
        colors={['#4F7CFF']}
        borderRadius={4}
        enableLabel={true}
        label={(d) => `${d.value}`}
        labelTextColor="rgba(255,255,255,0.8)"
        enableGridY={false}
        enableGridX={false}
        axisBottom={null}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
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
            <p className="font-semibold">{data.muscle as string}</p>
            <p className="mt-0.5">{data.sets as number} sets</p>
          </div>
        )}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  )
}
