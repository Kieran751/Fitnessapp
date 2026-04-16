import { useState, useEffect, useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useAtomValue } from 'jotai'
import { supabase } from '../../lib/supabase'
import { settingsAtom } from '../../store/atoms'
import { nivoTheme, getDateBoundary, type TimeRange } from './nivoTheme'

interface ExerciseOption {
  id: number
  name: string
  muscleGroup: string
  count: number
}

interface SetRow {
  weight: number
  reps: number
  timestamp: string
  workoutId: number
}

function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function ExerciseProgressChart({ range }: { range: TimeRange }) {
  const settings = useAtomValue(settingsAtom)
  const [exercises, setExercises] = useState<ExerciseOption[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [sets, setSets] = useState<SetRow[]>([])
  const [prValue, setPrValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Load exercise options (exercises user has actually logged)
  useEffect(() => {
    async function loadExercises() {
      const { data } = await supabase
        .from('sets')
        .select('exerciseId, exercises(name, muscleGroup)')

      if (!data) { setLoading(false); return }

      const counts = new Map<number, { name: string; muscleGroup: string; count: number }>()
      for (const s of data as unknown as Array<{ exerciseId: number; exercises: { name: string; muscleGroup: string } | null }>) {
        if (!s.exercises) continue
        const existing = counts.get(s.exerciseId)
        if (existing) {
          existing.count++
        } else {
          counts.set(s.exerciseId, { name: s.exercises.name, muscleGroup: s.exercises.muscleGroup, count: 1 })
        }
      }

      const sorted = [...counts.entries()]
        .map(([id, info]) => ({ id, ...info }))
        .sort((a, b) => b.count - a.count)

      setExercises(sorted)
      if (sorted.length > 0 && selectedId === null) {
        setSelectedId(sorted[0].id)
      }
      setLoading(false)
    }
    loadExercises()
  }, [])

  // Load sets for selected exercise within range
  useEffect(() => {
    if (selectedId === null) return

    async function loadSets() {
      let query = supabase
        .from('sets')
        .select('weight, reps, timestamp, workoutId')
        .eq('exerciseId', selectedId!)
        .gt('weight', 0)
        .order('timestamp', { ascending: true })

      const boundary = getDateBoundary(range)
      if (boundary) {
        query = query.gte('timestamp', boundary)
      }

      const { data } = await query
      setSets((data ?? []) as SetRow[])

      // Load PR
      const { data: pr } = await supabase
        .from('personal_records')
        .select('value')
        .eq('exerciseId', selectedId!)
        .eq('type', '1rm')
        .order('value', { ascending: false })
        .limit(1)

      setPrValue(pr && pr.length > 0 ? pr[0].value : null)
    }
    loadSets()
  }, [selectedId, range])

  // Group sets by workout, find best est 1RM per session
  const chartData = useMemo(() => {
    const byWorkout = new Map<number, { date: string; best1RM: number; weight: number; reps: number }>()

    for (const s of sets) {
      const est = epley1RM(s.weight, s.reps)
      const existing = byWorkout.get(s.workoutId)
      if (!existing || est > existing.best1RM) {
        byWorkout.set(s.workoutId, {
          date: s.timestamp.split('T')[0],
          best1RM: Math.round(est * 10) / 10,
          weight: s.weight,
          reps: s.reps,
        })
      }
    }

    // Sort by date and deduplicate by date (keep best)
    const byDate = new Map<string, { best1RM: number; weight: number; reps: number }>()
    for (const v of byWorkout.values()) {
      const existing = byDate.get(v.date)
      if (!existing || v.best1RM > existing.best1RM) {
        byDate.set(v.date, { best1RM: v.best1RM, weight: v.weight, reps: v.reps })
      }
    }

    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ x: date, y: v.best1RM, weight: v.weight, reps: v.reps }))
  }, [sets])

  const unit = settings.units
  const displayValue = (v: number) => unit === 'lbs' ? Math.round(v * 2.205) : v

  const selectedExercise = exercises.find(e => e.id === selectedId)

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Log some sets to see strength trends
        </p>
      </div>
    )
  }

  const lineData = [{
    id: 'e1rm',
    data: chartData.map(p => ({ x: p.x, y: displayValue(p.y), weight: p.weight, reps: p.reps })),
  }]

  const prDisplay = prValue ? displayValue(prValue) : null

  return (
    <div>
      {/* Exercise selector */}
      <div className="mb-4">
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full h-10 px-3 rounded-xl text-sm text-[var(--text-primary)] border border-[var(--glass-border)] outline-none appearance-none cursor-pointer"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '16px',
          }}
        >
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
        {selectedExercise && (
          <span
            className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]"
            style={{ background: 'rgba(79,124,255,0.12)', fontFamily: "'Manrope', sans-serif" }}
          >
            {selectedExercise.muscleGroup}
          </span>
        )}
      </div>

      {/* Chart */}
      {chartData.length <= 1 ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2">
          {chartData.length === 1 && (
            <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">
              {displayValue(chartData[0].y)} <span className="text-sm text-[var(--text-tertiary)]">{unit}</span>
            </p>
          )}
          <p className="text-xs text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Log more sessions to see trends
          </p>
        </div>
      ) : (
        <div style={{ height: 250 }}>
          <ResponsiveLine
            data={lineData}
            theme={nivoTheme}
            margin={{ top: 20, right: 16, bottom: 40, left: 48 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
            curve="monotoneX"
            enableArea={true}
            areaOpacity={0.1}
            colors={['#4F7CFF']}
            lineWidth={2}
            pointSize={6}
            pointColor="#4F7CFF"
            pointBorderWidth={2}
            pointBorderColor="#4F7CFF"
            enableGridX={false}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: -45,
              format: (v: string) => {
                const d = new Date(v)
                return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`
              },
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              format: (v: number) => `${v}`,
            }}
            tooltip={({ point }) => {
              const d = point.data as { x: string; y: number; weight?: number; reps?: number }
              const date = new Date(d.x as string)
              const dateStr = `${date.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()]}`
              return (
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
                  <p className="font-semibold">{dateStr}</p>
                  <p className="font-mono mt-1">Est. 1RM: <strong>{d.y} {unit}</strong></p>
                </div>
              )
            }}
            markers={prDisplay ? [{
              axis: 'y',
              value: prDisplay,
              lineStyle: { stroke: '#F59E0B', strokeWidth: 1.5, strokeDasharray: '6 4' },
              legend: `PR: ${prDisplay} ${unit}`,
              legendPosition: 'top-right' as const,
              textStyle: { fill: '#F59E0B', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
            }] : []}
            useMesh={true}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      )}
    </div>
  )
}
