import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Play, Trash2 } from 'lucide-react'
import { type Template } from '../../db'

interface TemplateCardProps {
  template: Template
  onEdit: () => void
  onDelete: () => void
  onStart: () => void
  delay?: number
}

export function TemplateCard({ template, onEdit, onDelete, onStart, delay = 0 }: TemplateCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-80, -20], [1, 0])

  async function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -60) {
      setConfirmDelete(true)
      await animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    } else {
      await animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Delete reveal zone */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 w-20 bg-[var(--danger)] flex items-center justify-center rounded-r-3xl"
      >
        <Trash2 size={20} className="text-[var(--on-primary)]" />
      </motion.div>

      {/* Card */}
      <motion.div
        style={{
          x,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative rounded-3xl p-5 cursor-grab active:cursor-grabbing border border-[var(--glass-border)]"
      >
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onEdit} className="flex-1 text-left min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate tracking-tight">
              {template.name}
            </p>
            <p className="label-caption mt-1">
              {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
            </p>
          </button>
          <motion.div whileTap={{ scale: 0.95 }}>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onStart() }}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[var(--on-primary)] text-sm font-semibold shrink-0 transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 4px 16px rgba(79, 124, 255, 0.25)',
              }}
            >
              <Play size={14} fill="currentColor" />
              Start
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-3xl flex items-center justify-between px-4"
          style={{
            background: 'rgba(36, 46, 66, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-sm font-medium text-[var(--text-primary)]">Delete template?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-8 px-3 rounded-lg text-sm text-[var(--text-secondary)] border border-[var(--glass-border)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); onDelete() }}
              className="h-8 px-3 rounded-lg text-sm bg-[var(--danger)] text-[var(--on-primary)] font-semibold"
            >
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
