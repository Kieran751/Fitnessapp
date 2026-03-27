import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Dumbbell, Settings, Zap, Calendar, TrendingUp, BookMarked, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useWorkout } from '../hooks/useWorkout'
import { db, type Template } from '../db'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { startFreestyle, startFromTemplate } = useWorkout()
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    db.templates.toArray().then(setTemplates)
  }, [])

  return (
    <div className="flex flex-col min-h-full px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--accent)]"
            style={{ fontFamily: 'General Sans, sans-serif', letterSpacing: '-0.02em' }}
          >
            SETS
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Ready to train?</p>
        </motion.div>

        <Link to="/settings">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <Settings size={18} />
          </motion.div>
        </Link>
      </div>

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-6"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <Dumbbell size={20} className="text-[var(--accent)]" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Quick Start</p>
                <p className="text-sm text-[var(--text-secondary)]">Begin an empty workout</p>
              </div>
            </div>
            <Button size="lg" fullWidth onClick={startFreestyle}>
              <Zap size={18} />
              Start Workout
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        <Card className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Calendar size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">This Week</span>
          </div>
          <p className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            0
          </p>
          <p className="text-xs text-[var(--text-secondary)]">workouts</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <TrendingUp size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            0
          </p>
          <p className="text-xs text-[var(--text-secondary)]">all time</p>
        </Card>
      </motion.div>

      {/* Templates section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Your Templates
          </h2>
          <Link to="/templates" className="text-xs font-medium text-[var(--accent)]">
            See all
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookMarked size={24} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No templates yet</p>
            <Link to="/templates" className="text-xs text-[var(--accent)] mt-1">Create a template</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.slice(0, 3).map(t => (
              <Card key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t.exercises.length} exercises</p>
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    type="button"
                    onClick={() => startFromTemplate(t)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold"
                  >
                    <Play size={13} fill="currentColor" />
                    Start
                  </button>
                </motion.div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
