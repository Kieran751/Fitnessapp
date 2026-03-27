import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  return (
    <div className="flex flex-col min-h-full px-4 pt-safe">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-6 pb-2"
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Progress</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your gains over time</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-1 flex items-center justify-center"
      >
        <EmptyState
          icon={TrendingUp}
          title="Complete a workout to see progress"
          description="Your strength trends, PRs, and volume will appear here"
        />
      </motion.div>
    </div>
  )
}
