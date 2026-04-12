import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password)
        if (err) {
          setError(err.message)
          return
        }
      } else {
        if (!displayName.trim()) {
          setError('Display name is required')
          return
        }
        const { error: err } = await signUp(email, password, displayName.trim())
        if (err) {
          setError(err.message)
          return
        }
      }
      navigate({ to: '/' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
  }

  const inputClass =
    'w-full h-14 px-4 rounded-2xl text-base text-[var(--text-primary)] placeholder-[var(--text-tertiary)] border border-[var(--glass-border)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:[box-shadow:0_0_0_3px_var(--accent-ring)]'

  const inputStyle = {
    background: 'var(--glass)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    fontFamily: "'Manrope', sans-serif",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <h1
          className="text-5xl font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}
        >
          SETS
        </h1>
        <p
          className="text-sm text-[var(--text-secondary)] mt-2 tracking-wide"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Track your strength
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl border border-[var(--glass-border)] p-6"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Mode toggle */}
          <div className="flex mb-6 rounded-xl overflow-hidden border border-[var(--glass-border)]"
            style={{ background: 'var(--bg-primary)' }}
          >
            <button
              type="button"
              className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: "'Manrope', sans-serif",
                background: mode === 'signin' ? 'var(--accent)' : 'transparent',
                color: mode === 'signin' ? '#fff' : 'var(--text-secondary)',
                borderRadius: '10px',
              }}
              onClick={() => { setMode('signin'); setError(null) }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: "'Manrope', sans-serif",
                background: mode === 'signup' ? 'var(--accent)' : 'transparent',
                color: mode === 'signup' ? '#fff' : 'var(--text-secondary)',
                borderRadius: '10px',
              }}
              onClick={() => { setMode('signup'); setError(null) }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm text-[var(--danger)] text-center"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-2">
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting
                  ? 'Loading...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>

        {/* Toggle link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-center mt-6 text-sm text-[var(--text-secondary)]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-[var(--accent)] font-semibold cursor-pointer bg-transparent border-none"
            onClick={toggleMode}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}
