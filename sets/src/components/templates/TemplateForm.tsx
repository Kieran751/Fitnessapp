import { useState, useEffect } from 'react'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import { GripVertical, Trash2, Plus, ChevronDown } from 'lucide-react'
import { db, type Template, type Exercise } from '../../db'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { NumberStepper } from '../ui/NumberStepper'
import { ExercisePicker } from '../workout/ExercisePicker'

const REST_OPTIONS = [60, 90, 120, 150, 180]

interface TemplateExerciseRow {
  id: string
  exerciseId: number
  exercise: Exercise
  targetSets: number
  targetReps: number
  restSeconds: number
}

interface TemplateFormProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  template?: Template
}

export function TemplateForm({ isOpen, onClose, onSaved, template }: TemplateFormProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<TemplateExerciseRow[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [nameError, setNameError] = useState('')
  const isEditing = !!template

  useEffect(() => {
    if (!isOpen) return
    if (template) {
      setName(template.name)
      // Load exercises from DB
      Promise.all(
        template.exercises.map(async te => {
          const ex = await db.exercises.get(te.exerciseId)
          if (!ex) return null
          return {
            id: crypto.randomUUID(),
            exerciseId: te.exerciseId,
            exercise: ex,
            targetSets: te.targetSets,
            targetReps: te.targetReps,
            restSeconds: te.restSeconds,
          } satisfies TemplateExerciseRow
        }),
      ).then(rows => setExercises(rows.filter(Boolean) as TemplateExerciseRow[]))
    } else {
      setName('')
      setExercises([])
    }
  }, [isOpen, template])

  function handleSelectExercise(exercise: Exercise) {
    setExercises(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id!,
        exercise,
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
    ])
  }

  function updateRow(id: string, updates: Partial<TemplateExerciseRow>) {
    setExercises(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  function cycleRest(id: string, current: number) {
    const idx = REST_OPTIONS.indexOf(current)
    const next = REST_OPTIONS[(idx + 1) % REST_OPTIONS.length]
    updateRow(id, { restSeconds: next })
  }

  async function handleSave() {
    setNameError('')
    if (!name.trim()) { setNameError('Name is required'); return }
    if (exercises.length === 0) return

    const data: Omit<Template, 'id'> = {
      name: name.trim(),
      exercises: exercises.map(r => ({
        exerciseId: r.exerciseId,
        targetSets: r.targetSets,
        targetReps: r.targetReps,
        restSeconds: r.restSeconds,
      })),
      createdAt: template?.createdAt ?? new Date(),
      updatedAt: new Date(),
    }

    if (isEditing && template?.id !== undefined) {
      await db.templates.update(template.id, data)
    } else {
      await db.templates.add(data)
    }
    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="form"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-[var(--text-secondary)] font-medium"
              >
                Cancel
              </button>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {isEditing ? 'Edit Template' : 'New Template'}
              </h2>
              <Button size="sm" onClick={handleSave} disabled={!name.trim() || exercises.length === 0}>
                Save
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 flex flex-col gap-4">
              {/* Name */}
              <Input
                label="Template name"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Push Day A"
                error={nameError}
              />

              {/* Exercise list */}
              {exercises.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={exercises}
                  onReorder={setExercises}
                  className="flex flex-col gap-3"
                >
                  {exercises.map(row => (
                    <Reorder.Item key={row.id} value={row} className="list-none">
                      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--border)]">
                          <GripVertical size={16} className="text-[var(--text-tertiary)] cursor-grab touch-none" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{row.exercise.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{row.exercise.muscleGroup}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExercises(prev => prev.filter(r => r.id !== row.id))}
                            className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-around px-3 py-3 gap-2">
                          <NumberStepper
                            label="Sets"
                            value={row.targetSets}
                            onChange={v => updateRow(row.id, { targetSets: v })}
                            min={1}
                            max={10}
                            step={1}
                          />
                          <NumberStepper
                            label="Reps"
                            value={row.targetReps}
                            onChange={v => updateRow(row.id, { targetReps: v })}
                            min={1}
                            max={50}
                            step={1}
                          />
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Rest</span>
                            <button
                              type="button"
                              onClick={() => cycleRest(row.id, row.restSeconds)}
                              className="h-12 px-3 flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold"
                            >
                              {row.restSeconds}s
                              <ChevronDown size={12} className="text-[var(--text-tertiary)]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Add exercise */}
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Add Exercise</span>
              </button>
            </div>

            <ExercisePicker
              isOpen={showPicker}
              onClose={() => setShowPicker(false)}
              onSelect={handleSelectExercise}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
