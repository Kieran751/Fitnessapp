import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { Download, Share, Plus, X } from 'lucide-react'
import { Button } from './Button'
import { deferredInstallPromptAtom } from '../../store/atoms'

const DISMISS_KEY = 'sets-install-dismissed'
const DISMISS_DAYS = 7

interface InstallPromptProps {
  /** Set true once a workout has been completed and the user is engaged enough to ask. */
  enabled: boolean
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari
  // @ts-expect-error – non-standard but real
  return window.navigator.standalone === true
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/.test(window.navigator.userAgent)
}

function isRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (Number.isNaN(ts)) return false
    const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24)
    return ageDays < DISMISS_DAYS
  } catch {
    return false
  }
}

export function InstallPrompt({ enabled }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useAtom(deferredInstallPromptAtom)
  const [showIosInfo, setShowIosInfo] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) { setVisible(false); return }
    if (isStandalone()) { setVisible(false); return }
    if (isRecentlyDismissed()) { setVisible(false); return }
    if (deferredPrompt) { setVisible(true); return }
    if (isIOS()) { setVisible(true); return }
    setVisible(false)
  }, [enabled, deferredPrompt])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
    setVisible(false)
    setShowIosInfo(false)
  }

  async function install() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setDeferredPrompt(null)
          setVisible(false)
        } else {
          dismiss()
        }
      } catch {
        dismiss()
      }
    } else if (isIOS()) {
      setShowIosInfo(true)
    }
  }

  return (
    <>
      <AnimatePresence>
        {visible && !showIosInfo && (
          <motion.div
            key="install-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed left-3 right-3 z-[55] bottom-[calc(env(safe-area-inset-bottom,0px)+88px)]"
          >
            <div
              className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] p-3 pl-4 shadow-2xl"
              style={{
                background: 'var(--bg-elevated)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-surface)' }}
              >
                <Download size={18} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-[var(--text-primary)] tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Install SETS
                </p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  Add to your home screen for quick access
                </p>
              </div>
              <Button size="sm" onClick={install}>Install</Button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIosInfo && (
          <>
            <motion.div
              key="ios-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70]"
              style={{
                background: 'rgba(9, 14, 24, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              onClick={dismiss}
            />
            <motion.div
              key="ios-sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed z-[71] left-0 right-0 bottom-0 rounded-t-[28px] border-t border-x border-[var(--glass-border)] pb-safe"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="px-7 pt-7 pb-10 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--primary-surface)' }}
                    >
                      <Download size={20} className="text-[var(--accent)]" />
                    </div>
                    <h2
                      className="text-xl font-semibold text-[var(--text-primary)] tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Install on iPhone
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Close"
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  iOS doesn't let apps prompt you directly — it takes two taps in Safari.
                </p>

                <div className="flex flex-col gap-3">
                  <IosStep
                    n={1}
                    icon={<Share size={18} className="text-[var(--accent)]" />}
                    title="Tap the Share icon"
                    body="It's in the Safari toolbar at the bottom (or top on iPad)."
                  />
                  <IosStep
                    n={2}
                    icon={<Plus size={18} className="text-[var(--accent)]" />}
                    title="Tap 'Add to Home Screen'"
                    body="Scroll the share sheet if you don't see it right away."
                  />
                </div>

                <Button fullWidth variant="secondary" onClick={dismiss}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function IosStep({
  n,
  icon,
  title,
  body,
}: {
  n: number
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-4 border border-[var(--glass-border)]"
      style={{ background: 'var(--glass)' }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0"
        style={{ background: 'var(--primary-surface)', color: 'var(--accent)' }}
      >
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{body}</p>
      </div>
    </div>
  )
}
