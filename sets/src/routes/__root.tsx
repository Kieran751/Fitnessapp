import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { BottomNav } from '../components/ui/BottomNav'
import { ActiveWorkout } from '../components/workout/ActiveWorkout'
import { WorkoutSummary } from '../components/workout/WorkoutSummary'
import { Toast } from '../components/ui/Toast'
import { InstallPrompt } from '../components/ui/InstallPrompt'
import { WelcomeFlow } from '../components/onboarding/WelcomeFlow'
import { useAuth } from '../hooks/useAuth'
import {
  workoutSessionAtom, workoutSummaryAtom, settingsAtom,
  deferredInstallPromptAtom, isOfflineAtom,
  type BeforeInstallPromptEvent,
} from '../store/atoms'
import { supabase } from '../lib/supabase'

function RootLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const session = useAtomValue(workoutSessionAtom)
  const summary = useAtomValue(workoutSummaryAtom)
  const settings = useAtomValue(settingsAtom)
  const isOffline = useAtomValue(isOfflineAtom)
  const setIsOffline = useSetAtom(isOfflineAtom)
  const setDeferredPrompt = useSetAtom(deferredInstallPromptAtom)

  const [completedWorkoutCount, setCompletedWorkoutCount] = useState(0)

  // Apply theme on load and whenever it changes
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [settings.theme])

  // Redirect: hitting root while logged out should land on /welcome
  // Other protected routes still redirect to /login
  useEffect(() => {
    const publicPaths = ['/login', '/reset-password', '/welcome']
    if (loading || user) return
    if (publicPaths.includes(pathname)) return
    if (pathname === '/') {
      navigate({ to: '/welcome' })
    } else {
      navigate({ to: '/login' })
    }
  }, [loading, user, pathname, navigate])

  // Online / offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOffline(!window.navigator.onLine)
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setIsOffline])

  // Capture beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return
    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [setDeferredPrompt])

  // Track completed workout count for install prompt gating
  useEffect(() => {
    if (!user) { setCompletedWorkoutCount(0); return }
    let cancelled = false
    supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .not('completedAt', 'is', null)
      .then(({ count }) => {
        if (!cancelled) setCompletedWorkoutCount(count ?? 0)
      })
    return () => { cancelled = true }
  }, [user])

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

  const publicPaths = ['/login', '/reset-password', '/welcome']
  const isPublicPage = publicPaths.includes(pathname)

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--bg-primary)]">
      <div className="bloom-primary" aria-hidden="true" />
      <div className="bloom-secondary" aria-hidden="true" />

      <AnimatePresence>
        {isOffline && (
          <motion.div
            key="offline-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed top-0 left-0 right-0 z-[150] banner-offline px-5 pb-2"
            role="status"
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 justify-center">
              <WifiOff size={14} style={{ color: 'var(--warning)' }} />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--warning)', fontFamily: "'Manrope', sans-serif" }}
              >
                You're offline — changes won't save until you reconnect
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        className={`flex-1 ${isPublicPage ? '' : 'pb-20'} relative z-1`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.main>

      {!isPublicPage && !session && !summary && <BottomNav />}

      <AnimatePresence>
        {session && <ActiveWorkout key="active-workout" />}
      </AnimatePresence>

      <AnimatePresence>
        {summary && !session && <WorkoutSummary key="summary" />}
      </AnimatePresence>

      <Toast />

      {/* Onboarding for first-time users */}
      {user && !isPublicPage && <WelcomeFlow enabled />}

      {/* PWA install prompt — only after engagement */}
      {user && !isPublicPage && !session && !summary && (
        <InstallPrompt enabled={completedWorkoutCount >= 1} />
      )}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
