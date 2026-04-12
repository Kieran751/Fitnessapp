import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart3 } from 'lucide-react'
import { db } from '../../db'

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

const MUSCLE_GROUP_MAP: Record<string, string[]> = {
  Chest:      ['chest-l', 'chest-r'],
  Back:       ['lats-l', 'lats-r', 'lower-back'],
  Shoulders:  ['delt-l', 'delt-r', 'rear-delt-l', 'rear-delt-r'],
  Biceps:     ['bicep-l', 'bicep-r'],
  Triceps:    ['tricep-l', 'tricep-r'],
  Quads:      ['quad-l', 'quad-r'],
  Hamstrings: ['ham-l', 'ham-r'],
  Glutes:     ['glute-l', 'glute-r'],
  Calves:     ['calf-fl', 'calf-fr', 'calf-bl', 'calf-br'],
  Abs:        ['abs'],
  Core:       ['abs', 'lower-back'],
  Forearms:   ['fore-l', 'fore-r'],
  Traps:      ['traps'],
  Cardio:     [],
}

type IntensityLevel = 'none' | 'secondary' | 'primary'

// Each overlay: cx/cy as % of image width/height, rx/ry as % of image width/height
const OVERLAYS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  // ── Front figure (left half of image) ──────────────────────────
  'delt-l':   { cx: 11,  cy: 25,  rx: 5,  ry: 5  },
  'delt-r':   { cx: 38,  cy: 25,  rx: 5,  ry: 5  },
  'chest-l':  { cx: 20,  cy: 33,  rx: 6,  ry: 7  },
  'chest-r':  { cx: 30,  cy: 33,  rx: 6,  ry: 7  },
  'bicep-l':  { cx: 8,   cy: 42,  rx: 4,  ry: 6  },
  'bicep-r':  { cx: 42,  cy: 42,  rx: 4,  ry: 6  },
  'fore-l':   { cx: 6,   cy: 53,  rx: 3,  ry: 5  },
  'fore-r':   { cx: 44,  cy: 53,  rx: 3,  ry: 5  },
  'abs':      { cx: 25,  cy: 50,  rx: 7,  ry: 9  },
  'quad-l':   { cx: 20,  cy: 70,  rx: 5,  ry: 8  },
  'quad-r':   { cx: 30,  cy: 70,  rx: 5,  ry: 8  },
  'calf-fl':  { cx: 21,  cy: 86,  rx: 3,  ry: 5  },
  'calf-fr':  { cx: 29,  cy: 86,  rx: 3,  ry: 5  },

  // ── Back figure (right half of image) ──────────────────────────
  'traps':        { cx: 75,  cy: 23,  rx: 8,  ry: 4  },
  'rear-delt-l':  { cx: 62,  cy: 26,  rx: 5,  ry: 5  },
  'rear-delt-r':  { cx: 88,  cy: 26,  rx: 5,  ry: 5  },
  'lats-l':       { cx: 64,  cy: 38,  rx: 6,  ry: 9  },
  'lats-r':       { cx: 86,  cy: 38,  rx: 6,  ry: 9  },
  'tricep-l':     { cx: 60,  cy: 42,  rx: 4,  ry: 6  },
  'tricep-r':     { cx: 90,  cy: 42,  rx: 4,  ry: 6  },
  'lower-back':   { cx: 75,  cy: 52,  rx: 7,  ry: 5  },
  'glute-l':      { cx: 68,  cy: 62,  rx: 7,  ry: 7  },
  'glute-r':      { cx: 82,  cy: 62,  rx: 7,  ry: 7  },
  'ham-l':        { cx: 68,  cy: 74,  rx: 5,  ry: 8  },
  'ham-r':        { cx: 82,  cy: 74,  rx: 5,  ry: 8  },
  'calf-bl':      { cx: 69,  cy: 87,  rx: 3,  ry: 5  },
  'calf-br':      { cx: 81,  cy: 87,  rx: 3,  ry: 5  },
}

export function MuscleHeatmap() {
  const { monday, sunday } = getWeekBounds()

  const muscleData = useLiveQuery(async () => {
    const workouts = await db.workouts
      .filter(w =>
        w.completedAt != null &&
        new Date(w.startedAt) >= monday &&
        new Date(w.startedAt) <= sunday
      ).toArray()

    const workoutIds = workouts.map(w => w.id).filter((id): id is number => id != null)
    if (workoutIds.length === 0) return {} as Record<string, number>

    const sets = await db.sets.filter(s => workoutIds.includes(s.workoutId)).toArray()
    const exercises = await db.exercises.toArray()
    const exerciseMap = new Map(exercises.map(e => [e.id, e]))

    const groupCounts: Record<string, number> = {}
    for (const s of sets) {
      const ex = exerciseMap.get(s.exerciseId)
      if (ex) groupCounts[ex.muscleGroup] = (groupCounts[ex.muscleGroup] ?? 0) + 1
    }
    return groupCounts
  }, [monday.getTime(), sunday.getTime()])

  const groupCounts = muscleData ?? {}
  const maxCount = Math.max(...Object.values(groupCounts).filter(c => c > 0), 0)

  const levels: Record<string, IntensityLevel> = {}
  for (const [group, count] of Object.entries(groupCounts)) {
    if (count <= 0) continue
    const lvl: IntensityLevel = maxCount > 0 && count >= maxCount * 0.6 ? 'primary' : 'secondary'
    for (const region of MUSCLE_GROUP_MAP[group] ?? []) {
      if (levels[region] !== 'primary') levels[region] = lvl
    }
  }

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
        <h3 className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Weekly Muscle Focus
        </h3>
        <BarChart3 size={16} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      {/* Image + glow overlays */}
      <div className="relative w-full select-none" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <img
          src="/muscle-map.png"
          alt="Muscle map"
          className="w-full block"
          style={{ mixBlendMode: 'normal' }}
          draggable={false}
        />

        {/* Glow overlay layer */}
        <div className="absolute inset-0" style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
          {Object.entries(OVERLAYS).map(([id, { cx, cy, rx, ry }]) => {
            const level = levels[id] ?? 'none'
            if (level === 'none') return null

            const isPrimary = level === 'primary'
            const innerAlpha = isPrimary ? 0.75 : 0.35
            const outerAlpha = isPrimary ? 0.25 : 0.1

            return (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  left: `${cx - rx * 2}%`,
                  top: `${cy - ry * 2}%`,
                  width: `${rx * 4}%`,
                  height: `${ry * 4}%`,
                  background: `radial-gradient(ellipse at center,
                    rgba(79,124,255,${innerAlpha}) 0%,
                    rgba(79,124,255,${outerAlpha}) 45%,
                    transparent 70%)`,
                  filter: isPrimary ? 'blur(2px)' : 'blur(1px)',
                }}
              />
            )
          })}
        </div>

        {/* FRONT / BACK labels */}
        <div className="absolute bottom-2 left-0 w-1/2 flex justify-center pointer-events-none">
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'rgba(139,146,168,0.8)', textTransform: 'uppercase' }}>
            FRONT
          </span>
        </div>
        <div className="absolute bottom-2 right-0 w-1/2 flex justify-center pointer-events-none">
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'rgba(139,146,168,0.8)', textTransform: 'uppercase' }}>
            BACK
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'rgba(79,124,255,0.75)', boxShadow: '0 0 6px rgba(79,124,255,0.5)' }} />
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            PRIMARY FOCUS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'rgba(79,124,255,0.35)' }} />
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            SECONDARY
          </span>
        </div>
      </div>
    </div>
  )
}
