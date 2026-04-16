import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { Dumbbell, Trophy, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useWorkout } from '../../hooks/useWorkout'
import { Button } from '../ui/Button'

const SEEN_KEY = 'sets-onboarding-seen'

interface WelcomeFlowProps {
  /** Pass true once auth has resolved AND there's a real signed-in user. */
  enabled: boolean
}

export function WelcomeFlow({ enabled }: WelcomeFlowProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const navigate = useNavigate()
  const { startFreestyle } = useWorkout()

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function check() {
      try {
        if (localStorage.getItem(SEEN_KEY)) return
      } catch { /* ignore */ }
      try {
        const [{ count: workoutCount }, { count: templateCount }] = await Promise.all([
          supabase.from('workouts').select('id', { count: 'exact', head: true }),
          supabase.from('templates').select('id', { count: 'exact', head: true }),
        ])
        if (cancelled) return
        if ((workoutCount ?? 0) === 0 && (templateCount ?? 0) === 0) {
          setOpen(true)
        }
      } catch {
        // If check fails, don't pop the modal
      }
    }
    check()
    return () => { cancelled = true }
  }, [enabled])

  function complete() {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }

  function next() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  function back() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleCreateTemplate() {
    complete()
    navigate({ to: '/templates' })
  }

  function handleQuickStart() {
    complete()
    void startFreestyle()
  }

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="welcome-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100]"
        style={{
          background: 'rgba(9, 14, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />
      <motion.div
        key="welcome-modal"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed z-[101] inset-0 flex items-center justify-center p-5"
      >
        <div
          className="relative w-full max-w-sm rounded-3xl border border-[var(--glass-border)] overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Step content */}
          <div className="px-7 pt-9 pb-6 min-h-[440px] flex flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <StepWrap key="0" direction={direction}>
                  <StepOne />
                </StepWrap>
              )}
              {step === 1 && (
                <StepWrap key="1" direction={direction}>
                  <StepTwo />
                </StepWrap>
              )}
              {step === 2 && (
                <StepWrap key="2" direction={direction}>
                  <StepThree
                    onCreateTemplate={handleCreateTemplate}
                    onQuickStart={handleQuickStart}
                  />
                </StepWrap>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="border-t border-[var(--glass-border)] px-5 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: step === i ? 18 : 6,
                    height: 6,
                    background: step === i ? 'var(--accent)' : 'var(--glass-border)',
                  }}
                />
              ))}
            </div>

            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={complete}
                className="text-sm font-semibold text-[var(--text-tertiary)]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function StepWrap({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <motion.div
      custom={direction}
      initial={{ opacity: 0, x: direction * 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  )
}

function StepOne() {
  return (
    <div className="flex-1 flex flex-col items-center text-center gap-6">
      <div className="relative w-28 h-28 flex items-center justify-center mt-4">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: 'var(--primary-surface)' }}
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="text-2xl font-bold text-[var(--accent)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}
          >
            SETS
          </span>
        </motion.div>
      </div>
      <div className="flex flex-col gap-2">
        <h2
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
        >
          Welcome to SETS
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[280px]">
          Track your workouts, beat your PRs, see your progress. Built for lifters who give a sh*t.
        </p>
      </div>
    </div>
  )
}

function StepTwo() {
  const items: Array<{ icon: React.ReactNode; title: string; body: string }> = [
    { icon: <Dumbbell size={18} className="text-[var(--accent)]" />, title: 'Log sets as you lift', body: 'Tap to record weight and reps between sets — fast.' },
    { icon: <Trophy size={18} className="text-[var(--gold)]" />, title: 'Track PRs automatically', body: 'New 1RMs and best lifts surface as soon as you hit them.' },
    { icon: <TrendingUp size={18} className="text-[var(--accent)]" />, title: 'See progress over time', body: 'Strength curves, volume trends, and consistency at a glance.' },
  ]
  return (
    <div className="flex-1 flex flex-col gap-5">
      <div className="flex flex-col gap-2 text-center">
        <h2
          className="text-2xl font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
        >
          How it works
        </h2>
      </div>
      <div className="flex flex-col gap-3 mt-2">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-2xl p-4 border border-[var(--glass-border)]"
            style={{ background: 'var(--glass)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--bg-overlay)' }}
            >
              {it.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{it.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{it.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StepThree({
  onCreateTemplate,
  onQuickStart,
}: {
  onCreateTemplate: () => void
  onQuickStart: () => void
}) {
  return (
    <div className="flex-1 flex flex-col gap-5 text-center">
      <h2
        className="text-2xl font-bold text-[var(--text-primary)] tracking-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
      >
        Start your first workout
      </h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[300px] mx-auto">
        Build a reusable template, or jump in freestyle and add exercises as you go.
      </p>
      <div className="flex flex-col gap-3 mt-4">
        <Button fullWidth onClick={onCreateTemplate}>Create a template</Button>
        <Button variant="secondary" fullWidth onClick={onQuickStart}>Quick start</Button>
      </div>
    </div>
  )
}
