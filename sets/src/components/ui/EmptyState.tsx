import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 py-16 px-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Glow halo */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Floating icon */}
        <motion.div
          className="relative w-20 h-20 rounded-3xl bg-[var(--primary-surface)] flex items-center justify-center"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={32} className="text-[var(--accent)]" strokeWidth={1.75} />
        </motion.div>
      </div>
      <div className="flex flex-col gap-2 max-w-[280px]">
        <p
          className="text-xl font-semibold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-sm text-[var(--text-secondary)] leading-relaxed"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
