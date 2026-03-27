import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <div className="flex flex-col min-h-full px-4 pt-safe">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-6 pb-2"
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">History</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Every session you've logged</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-1 flex items-center justify-center"
      >
        <EmptyState
          icon={History}
          title="No workouts yet"
          description="Your completed workouts will appear here after you log them"
        />
      </motion.div>
    </div>
  )
}
