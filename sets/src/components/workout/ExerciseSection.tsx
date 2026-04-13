import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { SetRow } from './SetRow'
import { settingsAtom, type WorkoutExerciseState, type SetState } from '../../store/atoms'
import { usePreviousSession } from '../../hooks/usePreviousSession'

interface ExerciseSectionProps {
  exercise: WorkoutExerciseState
  exerciseIdx: number
  workoutId: number
  onLog: (exerciseIdx: number, setIdx: number) => void
  onUpdate: (exerciseIdx: number, setIdx: number, updates: Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>) => void
  onUncomplete: (exerciseIdx: number, setIdx: number) => void
  onAddSet: (exerciseIdx: number) => void
  onToggle: (exerciseIdx: number) => void
  onRemoveSet: (exerciseIdx: number, setIdx: number) => void
  onRemoveExercise: (exerciseIdx: number) => void
}

export function ExerciseSection({
  exercise, exerciseIdx, workoutId,
  onLog, onUpdate, onUncomplete, onAddSet, onToggle,
  onRemoveSet, onRemoveExercise,
}: ExerciseSectionProps) {
  const settings = useAtomValue(settingsAtom)
  const previousSets = usePreviousSession(exercise.exerciseId, workoutId)

  const completedSets = exercise.sets.filter(s => s.isLogged).length
  const totalSets = exercise.sets.length

  return (
    <div
      className="rounded-3xl overflow-hidden border border-[var(--glass-border)]"
      style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Exercise header */}
      <div className="flex items-center px-5 py-4">
        <button
          type="button"
          onClick={() => onToggle(exerciseIdx)}
          className="flex-1 min-w-0 flex items-center justify-between text-left"
        >
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate tracking-tight">
              {exercise.exercise.name}
            </p>
            <p className="label-caption mt-1">{exercise.exercise.muscleGroup}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            {!exercise.isExpanded && (
              <span className="font-mono tabular text-xs font-semibold text-[var(--text-secondary)]">
                {completedSets}/{totalSets}
              </span>
            )}
            <motion.div
              animate={{ rotate: exercise.isExpanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown size={18} className="text-[var(--text-tertiary)]" />
            </motion.div>
          </div>
        </button>

        {/* Remove exercise */}
        <button
          type="button"
          onClick={() => onRemoveExercise(exerciseIdx)}
          className="ml-2 w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {exercise.isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Column headers */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-t border-[var(--glass-border)]">
              <span className="w-9 text-center label-caption">Set</span>
              <span style={{ width: 44 }} className="text-center label-caption shrink-0">Prev</span>
              <span className="flex-1 text-center label-caption">{settings.units}</span>
              <span className="flex-1 text-center label-caption">Reps</span>
              <span className="w-10 shrink-0" />
            </div>

            {/* Set rows */}
            <div className="flex flex-col gap-2 px-2 pt-1 pb-3">
              <AnimatePresence initial={false}>
                {exercise.sets.map((set, setIdx) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  >
                    <SetRow
                      set={set}
                      setIdx={setIdx}
                      exerciseIdx={exerciseIdx}
                      previousWeight={previousSets[setIdx]?.weight}
                      previousReps={previousSets[setIdx]?.reps}
                      unit={settings.units}
                      canDelete={exercise.sets.length > 1}
                      onLog={onLog}
                      onUpdate={onUpdate}
                      onUncomplete={onUncomplete}
                      onRemove={onRemoveSet}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add set */}
            <button
              type="button"
              onClick={() => onAddSet(exerciseIdx)}
              className="w-full flex items-center justify-center gap-1.5 h-11 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)] hover:text-[var(--accent)] border-t border-[var(--glass-border)] transition-colors"
            >
              <Plus size={14} />
              Add Set
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
