import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import { ActiveWorkout } from '../components/workout/ActiveWorkout'
import { WorkoutSummary } from '../components/workout/WorkoutSummary'
import { Toast } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { workoutSessionAtom, workoutSummaryAtom, settingsAtom } from '../store/atoms'

function RootLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      navigate({ to: '/login' })
    }
  }, [loading, user, pathname, navigate])

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[var(--bg-primary)]">
        <div className="bloom-primary" aria-hidden="true" />
        <div className="bloom-secondary" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <h1
            className="text-4xl font-bold text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}
          >
            SETS
          </h1>
          <div
            className="w-8 h-8 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin"
          />
        </motion.div>
      </div>
    )
  }

  const isLoginPage = pathname === '/login'

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--bg-primary)]">
      <div className="bloom-primary" aria-hidden="true" />
      <div className="bloom-secondary" aria-hidden="true" />
      <motion.main
        className={`flex-1 ${isLoginPage ? '' : 'pb-20'} relative z-1`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.main>

      {!isLoginPage && !session && !summary && <BottomNav />}

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
