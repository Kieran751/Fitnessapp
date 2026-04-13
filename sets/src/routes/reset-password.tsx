import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { passwordRecovery, updatePassword, loading } = useAuth()
  const navigate = useNavigate()
  const { show: showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Redirect if user navigated here directly (no recovery token)
  useEffect(() => {
    if (!loading && !passwordRecovery) {
      navigate({ to: '/login' })
    }
  }, [loading, passwordRecovery, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const { error: err } = await updatePassword(password)
      if (err) {
        setError(err.message)
        return
      }
      showToast('Password updated successfully', 'success')
      navigate({ to: '/' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full h-14 px-4 rounded-2xl text-base text-[var(--text-primary)] placeholder-[var(--text-tertiary)] border border-[var(--glass-border)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:[box-shadow:0_0_0_3px_var(--accent-ring)]'

  const inputStyle = {
    background: 'var(--glass)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    fontFamily: "'Manrope', sans-serif",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--bg-primary)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
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
          Set a new password
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="new-password"
              required
              minLength={6}
            />

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
                {submitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
