import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { BodyWeight } from '../../db'

interface BodyWeightChartProps {
  unit: 'kg' | 'lbs'
  onLogWeight: () => void
}

function getMonthBounds(offset = 0) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0, 0)
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatDay(date: Date) {
  return date.getDate()
}

export function BodyWeightChart({ unit, onLogWeight }: BodyWeightChartProps) {
  const [offset, setOffset] = useState(0)
  const [entries, setEntries] = useState<BodyWeight[]>([])
  const [loading, setLoading] = useState(true)

  const canGoForward = offset < 0
  const { start, end } = getMonthBounds(offset)
  const monthLabel = formatMonth(start)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('body_weights')
        .select('*')
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: true })

      setEntries((data ?? []) as BodyWeight[])
      setLoading(false)
    }
    load()
  }, [offset])

  const latest = entries[entries.length - 1]
  const min = entries.length > 1 ? Math.min(...entries.map(e => e.weight)) : (latest?.weight ?? 60) - 2
  const max = entries.length > 1 ? Math.max(...entries.map(e => e.weight)) : (latest?.weight ?? 80) + 2
  const range = Math.max(max - min, 2)

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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale size={15} className="text-[var(--text-tertiary)]" />
          <h3
            className="text-base font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Body Weight
          </h3>
        </div>

        {latest && (
          <span className="font-mono tabular text-base font-bold text-[var(--text-primary)]">
            {latest.weight}
            <span className="text-[var(--text-tertiary)] text-xs ml-1">{unit}</span>
          </span>
        )}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-hover)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <span
          className="text-sm font-semibold text-[var(--text-secondary)]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {monthLabel}
        </span>

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

      {/* Chart */}
      {loading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="h-20 flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-[var(--text-tertiary)]">No entries this month</p>
        </div>
      ) : (
        <div className="relative h-20">
          {/* SVG line + dots */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${Math.max(entries.length - 1, 1)} 1`}
          >
            {/* Line connecting dots */}
            {entries.length > 1 && (
              <polyline
                points={entries.map((e, i) => {
                  const x = i / (entries.length - 1)
                  const y = 1 - (e.weight - min) / range
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="rgba(79, 124, 255, 0.4)"
                strokeWidth="0.04"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Dots (rendered in HTML for easy sizing) */}
          <div className="absolute inset-0 flex items-end justify-between">
            {entries.map((entry, i) => {
              const pct = entries.length > 1
                ? ((entry.weight - min) / range) * 100
                : 50
              const isLatest = i === entries.length - 1

              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center"
                  style={{ flex: 1 }}
                >
                  {/* Weight label for latest */}
                  {isLatest && entries.length > 1 && (
                    <span
                      className="absolute -top-5 text-[10px] font-bold font-mono text-[var(--accent)]"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {entry.weight}
                    </span>
                  )}
                  {/* Column — dot positioned by bottom percentage */}
                  <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `${pct}%`,
                        left: '50%',
                        transform: 'translate(-50%, 50%)',
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                          width: isLatest ? 10 : 6,
                          height: isLatest ? 10 : 6,
                          borderRadius: '50%',
                          background: isLatest ? 'var(--accent)' : 'rgba(79, 124, 255, 0.55)',
                          boxShadow: isLatest ? '0 0 8px rgba(79, 124, 255, 0.5)' : 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Day label */}
                  <span
                    className="text-[9px] text-[var(--text-tertiary)] mt-1"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {formatDay(new Date(entry.date))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Log button */}
      <button
        type="button"
        onClick={onLogWeight}
        className="mt-4 w-full h-9 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.05em] text-[var(--accent)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--primary-surface)] transition-colors"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        + Log Weight
      </button>
    </div>
  )
}
