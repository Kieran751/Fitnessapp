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
      <h2 className="label-caption mb-3">Quick Start</h2>
      <div
        className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
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
              className="flex items-center gap-2.5 h-11 pl-4 pr-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-colors duration-150"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
                {template.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Play size={11} className="text-[var(--accent-on)]" fill="currentColor" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
