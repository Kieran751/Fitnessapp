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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className={[
              'fixed z-50 bg-[var(--bg-elevated)] border border-[var(--border)] left-0 right-0 bottom-0',
              fullScreen
                ? 'top-0 rounded-none'
                : 'rounded-t-2xl max-h-[90dvh]',
            ].join(' ')}
          >
            <div className="flex items-center justify-between p-4 pb-3 border-b border-[var(--border)]">
              {title && (
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90dvh-60px)] p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
