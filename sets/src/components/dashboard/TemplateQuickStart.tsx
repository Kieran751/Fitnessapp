import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Template } from '../../db'

interface TemplateQuickStartProps {
  startFromTemplate: (template: Template) => void
}

export function TemplateQuickStart({ startFromTemplate }: TemplateQuickStartProps) {
  const templates = useLiveQuery(() => db.templates.toArray(), [])

  if (!templates || templates.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Quick Start
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0"
          >
            <button
              type="button"
              onClick={() => startFromTemplate(template)}
              className="flex items-center gap-2 h-10 pl-3 pr-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-colors duration-150"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap leading-tight">
                  {template.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-tight">
                  {template.exercises.length} ex
                </p>
              </div>
              <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center ml-1">
                <Play size={11} className="text-[var(--accent)]" fill="currentColor" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
