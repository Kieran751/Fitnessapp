import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronDown } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { supabase } from '../../lib/supabase'
import { settingsAtom } from '../../store/atoms'
import { formatRelativeDate } from '../../lib/formatters'
import { getDateBoundary, type TimeRange } from './nivoTheme'

interface PREntry {
  id: number
  value: number
  achievedAt: string
  exercises: { name: string } | null
}

export function PRBoard({ range }: { range: TimeRange }) {
  const settings = useAtomValue(settingsAtom)
  const [prs, setPrs] = useState<PREntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('personal_records')
        .select('id, value, achievedAt, exercises(name)')
        .eq('type', '1rm')
        .order('achievedAt', { ascending: false })

      const boundary = getDateBoundary(range)
      if (boundary) {
        query = query.gte('achievedAt', boundary)
      }

      const { data } = await query
      setPrs((data ?? []) as unknown as PREntry[])
      setLoading(false)
    }
    load()
  }, [range])

  const unit = settings.units

  if (loading) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (prs.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          No PRs recorded yet
        </p>
      </div>
    )
  }

  // Deduplicate by exercise — keep only the latest PR per exercise
  const seen = new Set<string>()
  const uniquePrs = prs.filter(pr => {
    const name = pr.exercises?.name ?? 'Unknown'
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })

  const visible = expanded ? uniquePrs : uniquePrs.slice(0, 8)
  const hasMore = uniquePrs.length > 8

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        <AnimatePresence initial={false}>
          {visible.map((pr, i) => {
            const displayValue = unit === 'lbs'
              ? Math.round(pr.value * 2.205)
              : Math.round(pr.value * 10) / 10
            return (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="rounded-2xl p-3.5 border border-[var(--glass-border)]"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Trophy size={12} style={{ color: '#F59E0B' }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(245,158,11,0.7)', fontFamily: "'Manrope', sans-serif" }}
                  >
                    Est. 1RM
                  </span>
                </div>
                <p
                  className="text-xl font-bold truncate"
                  style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {displayValue}
                  <span className="text-xs ml-1 opacity-60">{unit}</span>
                </p>
                <p
                  className="text-xs font-semibold text-[var(--text-primary)] truncate mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {pr.exercises?.name ?? 'Unknown'}
                </p>
                <p
                  className="text-[10px] text-[var(--text-tertiary)] mt-0.5"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {formatRelativeDate(new Date(pr.achievedAt))}
                </p>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <motion.div whileTap={{ scale: 0.97 }} className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[var(--accent)] cursor-pointer bg-transparent border-none"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {expanded ? 'Show Less' : `View All (${uniquePrs.length})`}
            <ChevronDown
              size={14}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>
        </motion.div>
      )}
    </div>
  )
}
