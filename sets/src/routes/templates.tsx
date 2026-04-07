import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { BookMarked, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { TemplateCard } from '../components/templates/TemplateCard'
import { TemplateForm } from '../components/templates/TemplateForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { db, type Template } from '../db'
import { useWorkout } from '../hooks/useWorkout'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>()
  const { startFromTemplate } = useWorkout()

  function refresh() {
    db.templates.toArray().then(setTemplates)
  }

  useEffect(() => { refresh() }, [])

  async function handleDelete(id: number) {
    await db.templates.delete(id)
    refresh()
  }

  function openCreate() {
    setEditingTemplate(undefined)
    setShowForm(true)
  }

  function openEdit(template: Template) {
    setEditingTemplate(template)
    setShowForm(true)
  }

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end justify-between pt-8 pb-2"
      >
        <div>
          <h1
            className="text-4xl font-bold text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Templates
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Saved workout plans</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} />
          New
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-4 flex flex-col gap-3 pb-8"
      >
        {templates.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No templates yet"
            description="Create a template to quickly start structured workouts"
            action={{ label: 'Create Template', onClick: openCreate }}
          />
        ) : (
          templates.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              delay={i * 0.05}
              onEdit={() => openEdit(t)}
              onDelete={() => t.id !== undefined && handleDelete(t.id)}
              onStart={() => startFromTemplate(t)}
            />
          ))
        )}
      </motion.div>

      <TemplateForm
        isOpen={showForm}
        template={editingTemplate}
        onClose={() => setShowForm(false)}
        onSaved={refresh}
      />
    </div>
  )
}
