import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Zap, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/welcome')({
  component: WelcomePage,
})

function WelcomePage() {
  const navigate = useNavigate()

  function go(mode: 'signin' | 'signup') {
    navigate({ to: '/login', search: { mode } as never })
  }

  const features: Array<{ icon: React.ReactNode; title: string; body: string }> = [
    { icon: <Zap size={18} className="text-[var(--accent)]" />, title: 'Log fast', body: 'Tap-to-record sets between rests. No friction, no fluff.' },
    { icon: <Trophy size={18} className="text-[var(--gold)]" />, title: 'Track PRs', body: 'New 1RMs and best lifts surface the moment you hit them.' },
    { icon: <TrendingUp size={18} className="text-[var(--accent)]" />, title: 'See progress', body: 'Strength curves, volume trends, and a training heatmap.' },
  ]

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-safe pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center pt-16"
      >
        <h1
          className="text-[72px] font-bold text-[var(--text-primary)] leading-[0.95]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.05em' }}
        >
          SETS
        </h1>
        <p
          className="text-base text-[var(--text-secondary)] mt-4 max-w-[300px] leading-relaxed"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          The workout tracker built for lifters who give a sh*t.
        </p>
      </motion.div>

      {/* Demo mock */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="mt-10 mx-auto w-full max-w-sm"
      >
        <div
          className="rounded-3xl border border-[var(--glass-border)] p-4"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Bench Press</p>
            <span className="label-caption">CHEST</span>
          </div>
          {[
            { n: 1, w: 60, r: 10, done: true },
            { n: 2, w: 80, r: 8, done: true },
            { n: 3, w: 90, r: 6, done: true, pr: true },
            { n: 4, w: 90, r: 5, done: false },
          ].map((s) => (
            <div
              key={s.n}
              className="flex items-center gap-2 px-2 py-2.5 rounded-xl"
              style={{
                background: s.done ? 'rgba(79, 124, 255, 0.06)' : 'transparent',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tabular shrink-0"
                style={{
                  background: s.done ? 'var(--primary-surface)' : 'var(--glass)',
                  color: s.done ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                {s.n}
              </div>
              <span className="flex-1 font-mono tabular text-sm text-[var(--text-primary)] text-center">
                {s.w}<span className="text-[var(--text-tertiary)] text-xs"> × </span>{s.r}
              </span>
              {s.pr && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--gold-surface)] text-[var(--gold)]">
                  PR
                </span>
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={s.done ? {
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  color: '#fff',
                } : {
                  border: '2px solid var(--glass-border)',
                  color: 'var(--text-tertiary)',
                }}
              >
                {s.done ? '\u2713' : ''}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="mt-10 flex flex-col gap-3 max-w-sm w-full mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + i * 0.06 }}
            className="flex items-start gap-3 rounded-2xl p-4 border border-[var(--glass-border)]"
            style={{ background: 'var(--glass)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--bg-overlay)' }}
            >
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{f.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{f.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.45 }}
        className="mt-10 flex flex-col gap-3 max-w-sm w-full mx-auto"
      >
        <Button size="lg" fullWidth onClick={() => go('signup')}>Create Account</Button>
        <Button size="lg" variant="secondary" fullWidth onClick={() => go('signin')}>Sign In</Button>
      </motion.div>
    </div>
  )
}
