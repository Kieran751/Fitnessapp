import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import { type Template } from '../../db'
import { supabase } from '../../lib/supabase'

interface TemplateQuickStartProps {
  startFromTemplate: (template: Template) => void
}

export function TemplateQuickStart({ startFromTemplate }: TemplateQuickStartProps) {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('templates').select('*')
      setTemplates((data ?? []) as Template[])
    }
    load()
  }, [])

  if (templates.length === 0) return null

  return (
    <div>
      <h2
        className="text-lg font-semibold text-[var(--text-primary)] mb-3"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Your Templates
      </h2>
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
              className="flex items-center gap-2.5 h-11 pl-4 pr-2 rounded-full border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-all duration-150"
              style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              <span className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
                {template.name}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                }}
              >
                <Play size={11} className="text-[var(--on-primary)]" fill="currentColor" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
