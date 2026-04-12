import { AnimatePresence, motion } from 'framer-motion'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { toastAtom } from '../../store/atoms'

export function Toast() {
  const [toast, setToast] = useAtom(toastAtom)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast, setToast])

  const iconMap = {
    success: <CheckCircle size={18} className="text-[var(--success)] shrink-0" />,
    error: <XCircle size={18} className="text-[var(--danger)] shrink-0" />,
    info: <Info size={18} className="text-[var(--accent)] shrink-0" />,
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-4 left-4 right-4 z-[200] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-[var(--glass-border)] shadow-2xl"
            style={{
              maxWidth: 360,
              pointerEvents: 'auto',
              background: 'var(--bg-elevated)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {iconMap[toast.variant]}
            <p className="text-sm font-medium text-[var(--text-primary)]">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
