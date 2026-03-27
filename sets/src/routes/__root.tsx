import { createRootRoute, Outlet } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { BottomNav } from '../components/ui/BottomNav'
import { ActiveWorkout } from '../components/workout/ActiveWorkout'
import { WorkoutSummary } from '../components/workout/WorkoutSummary'
import { workoutSessionAtom, workoutSummaryAtom } from '../store/atoms'

function RootLayout() {
  const session = useAtomValue(workoutSessionAtom)
  const summary = useAtomValue(workoutSummaryAtom)

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--bg-primary)]">
      <motion.main
        className="flex-1 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.main>

      {!session && !summary && <BottomNav />}

      <AnimatePresence>
        {session && <ActiveWorkout key="active-workout" />}
      </AnimatePresence>

      <AnimatePresence>
        {summary && !session && <WorkoutSummary key="summary" />}
      </AnimatePresence>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
