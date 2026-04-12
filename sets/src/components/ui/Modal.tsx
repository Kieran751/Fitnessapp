import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  fullScreen?: boolean
}

export function Modal({ isOpen, onClose, title, children, fullScreen = false }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{
              background: 'rgba(9, 14, 24, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className={[
              'fixed z-[61] bg-[var(--bg-elevated)] border border-[var(--glass-border)] left-0 right-0 bottom-0',
              fullScreen
                ? 'top-0 rounded-none'
                : 'rounded-t-[28px] max-h-[90dvh] pb-safe',
            ].join(' ')}
          >
            <div className="flex items-center justify-between px-7 pt-7 pb-4">
              {title && (
                <h2
                  className="text-xl font-semibold text-[var(--text-primary)] tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex items-center justify-center w-9 h-9 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--glass)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90dvh-80px)] px-7 pb-10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
