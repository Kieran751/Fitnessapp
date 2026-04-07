import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Dumbbell, Trophy, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { db } from '../db'
import { settingsAtom } from '../store/atoms'
import { formatDate, formatDuration, formatVolume } from '../lib/formatters'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export const Route = createFileRoute('/history/$workoutId')({
  component: WorkoutDetailPage,
})

const SET_TYPE_LABEL: Record<string, string> = {
  normal: '',
  warmup: 'W',
  dropset: 'D',
  failure: 'F',
}

function WorkoutDetailPage() {
  const { workoutId } = Route.useParams()
  const navigate = useNavigate()
  const settings = useAtomValue(settingsAtom)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)

  const wid = Number(workoutId)

  const data = useLiveQuery(async () => {
    const workout = await db.workouts.get(wid)
    if (!workout) return null
    const sets = await db.sets.where('workoutId').equals(wid).toArray()
    const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))]
    const exercises = await db.exercises.bulkGet(exerciseIds)
    const exerciseMap = new Map(
      exercises
        .filter((e): e is NonNullable<typeof e> => e != null)
        .map((e) => [e.id!, e]),
    )
    const prs = await db.personalRecords.where('workoutId').equals(wid).toArray()
    const prSetIds = new Set(prs.map((pr) => pr.setId))

    // Group sets by exerciseId, preserving order of first appearance
    const grouped = new Map<number, typeof sets>()
    for (const set of sets) {
      if (!grouped.has(set.exerciseId)) grouped.set(set.exerciseId, [])
      grouped.get(set.exerciseId)!.push(set)
    }

    const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)

    return { workout, grouped, exerciseMap, prSetIds, totalVolume, prCount: prs.length }
  }, [wid])

  async function handleDelete() {
    await db.sets.where('workoutId').equals(wid).delete()
    await db.personalRecords.where('workoutId').equals(wid).delete()
    await db.workouts.delete(wid)
    navigate({ to: '/history' })
  }

  if (data === undefined) {
    return (
      <div className="flex flex-col min-h-full px-4 pt-safe">
        <div className="pt-6 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]" />
          <div className="h-7 w-32 rounded-lg bg-[var(--bg-surface)]" />
        </div>
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="flex flex-col min-h-full px-4 pt-safe">
        <div className="pt-6 pb-2 flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.95 }}>
            <button
              type="button"
              onClick={() => navigate({ to: '/history' })}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              <ArrowLeft size={18} />
            </button>
          </motion.div>
          <p className="text-[var(--text-secondary)]">Workout not found</p>
        </div>
      </div>
    )
  }

  const { workout, grouped, exerciseMap, prSetIds, totalVolume, prCount } = data
  const duration =
    workout.completedAt && workout.startedAt
      ? formatDuration(new Date(workout.startedAt), new Date(workout.completedAt))
      : null

  return (
    <div className="flex flex-col min-h-full px-4 pt-safe pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 pt-6 pb-2"
      >
        <motion.div whileTap={{ scale: 0.95 }}>
          <button
            type="button"
            onClick={() => navigate({ to: '/history' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <ArrowLeft size={18} />
          </button>
        </motion.div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-3xl font-bold text-[var(--text-primary)] truncate"
            style={{ letterSpacing: '-0.03em' }}
          >
            {workout.name}
          </h1>
          {workout.completedAt && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {formatDate(new Date(workout.completedAt))}
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-2.5 mt-4"
      >
        {duration && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-2">
            <Clock size={12} className="text-[var(--text-tertiary)]" />
            <p className="font-mono tabular text-lg font-bold text-[var(--text-primary)]">{duration}</p>
            <p className="label-caption">Duration</p>
          </div>
        )}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-2">
          <Dumbbell size={12} className="text-[var(--text-tertiary)]" />
          <p className="font-mono tabular text-lg font-bold text-[var(--text-primary)]">
            {formatVolume(totalVolume, settings.units)}
          </p>
          <p className="label-caption">Volume</p>
        </div>
        {prCount > 0 && (
          <div className="bg-[var(--gold-muted)] border border-[var(--gold)]/30 rounded-2xl p-4 flex flex-col gap-2">
            <Trophy size={12} className="text-[var(--gold)]" />
            <p className="font-mono tabular text-lg font-bold text-[var(--gold)]">{prCount}</p>
            <p className="label-caption !text-[var(--gold)]/80">PRs</p>
          </div>
        )}
      </motion.div>

      {/* Exercise sections */}
      <div className="flex flex-col gap-4 mt-4">
        {[...grouped.entries()].map(([exId, sets], groupIdx) => {
          const exercise = exerciseMap.get(exId)
          return (
            <motion.div
              key={exId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + groupIdx * 0.04 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
                <p className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                  {exercise?.name ?? 'Unknown Exercise'}
                </p>
                {exercise && (
                  <p className="label-caption mt-1">{exercise.muscleGroup}</p>
                )}
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {/* Header row */}
                <div className="grid grid-cols-[32px_1fr_1fr_1fr] gap-2 px-5 py-2.5">
                  <span className="label-caption">Set</span>
                  <span className="label-caption">Type</span>
                  <span className="label-caption text-right">{settings.units}</span>
                  <span className="label-caption text-right">Reps</span>
                </div>
                {sets.map((set) => {
                  const isPR = prSetIds.has(set.id!)
                  return (
                    <div
                      key={set.id}
                      className={[
                        'grid grid-cols-[32px_1fr_1fr_1fr] gap-2 px-5 py-3 items-center',
                        isPR ? 'bg-[var(--gold-muted)]' : '',
                      ].join(' ')}
                    >
                      <span className="font-mono tabular text-sm font-semibold text-[var(--text-secondary)]">
                        {set.setNumber}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {set.setType !== 'normal' ? SET_TYPE_LABEL[set.setType] || set.setType : '—'}
                      </span>
                      <span className="font-mono tabular text-sm font-bold text-[var(--text-primary)] text-right">
                        {set.weight > 0 ? set.weight : '—'}
                      </span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-mono tabular text-sm font-bold text-[var(--text-primary)]">
                          {set.reps}
                        </span>
                        {isPR && <Trophy size={12} className="text-[var(--gold)]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Delete button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mt-8"
      >
        <Button
          variant="danger"
          fullWidth
          onClick={() => setDeleteStep(1)}
        >
          <Trash2 size={16} />
          Delete Workout
        </Button>
      </motion.div>

      {/* Step 1: first confirm */}
      <Modal
        isOpen={deleteStep === 1}
        onClose={() => setDeleteStep(0)}
        title="Delete Workout?"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This will permanently delete <strong className="text-[var(--text-primary)]">{workout.name}</strong> and all its sets and records. This cannot be undone.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => setDeleteStep(2)}>
            Yes, Delete
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setDeleteStep(0)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Step 2: final confirm */}
      <Modal
        isOpen={deleteStep === 2}
        onClose={() => setDeleteStep(0)}
        title="Are you sure?"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This action is irreversible. All sets and personal records for this workout will be lost.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={handleDelete}>
            Delete Forever
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setDeleteStep(0)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
