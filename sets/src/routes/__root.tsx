import { createRootRoute, Outlet } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import { ActiveWorkout } from '../components/workout/ActiveWorkout'
import { WorkoutSummary } from '../components/workout/WorkoutSummary'
import { Toast } from '../components/ui/Toast'
import { workoutSessionAtom, workoutSummaryAtom, settingsAtom } from '../store/atoms'

function RootLayout() {
  const session = useAtomValue(workoutSessionAtom)
  const summary = useAtomValue(workoutSummaryAtom)
  const settings = useAtomValue(settingsAtom)

  // Apply theme on load and whenever it changes
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [settings.theme])

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--bg-primary)]">
      <div className="bloom-primary" aria-hidden="true" />
      <div className="bloom-secondary" aria-hidden="true" />
      <motion.main
        className="flex-1 pb-20 relative z-1"
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

      <Toast />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
