import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { SetRow } from './SetRow'
import { settingsAtom, type WorkoutExerciseState, type SetState } from '../../store/atoms'
import { usePreviousSession } from '../../hooks/usePreviousSession'

interface ExerciseSectionProps {
  exercise: WorkoutExerciseState
  exerciseIdx: number
  workoutId: number
  onLog: (exerciseIdx: number, setIdx: number) => Promise<{ isPR: boolean }>
  onUpdate: (exerciseIdx: number, setIdx: number, updates: Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>) => void
  onUncomplete: (exerciseIdx: number, setIdx: number) => void
  onAddSet: (exerciseIdx: number) => void
  onToggle: (exerciseIdx: number) => void
}

export function ExerciseSection({
  exercise, exerciseIdx, workoutId,
  onLog, onUpdate, onUncomplete, onAddSet, onToggle,
}: ExerciseSectionProps) {
  const settings = useAtomValue(settingsAtom)
  const previousSets = usePreviousSession(exercise.exerciseId, workoutId)

  const completedSets = exercise.sets.filter(s => s.isLogged).length
  const totalSets = exercise.sets.length

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Exercise header */}
      <button
        type="button"
        onClick={() => onToggle(exerciseIdx)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
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
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-t border-[var(--border-subtle)]">
              <span className="w-9 text-center label-caption">Set</span>
              <span className="w-16 text-center label-caption">Prev</span>
              <span className="flex-1 text-center label-caption">{settings.units}</span>
              <span className="flex-1 text-center label-caption">Reps</span>
              <span className="w-10" />
            </div>

            {/* Set rows */}
            <div className="flex flex-col gap-2 px-2 pt-1 pb-3">
              {exercise.sets.map((set, setIdx) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: setIdx * 0.04 }}
                >
                  <SetRow
                    set={set}
                    setIdx={setIdx}
                    exerciseIdx={exerciseIdx}
                    previousWeight={previousSets[setIdx]?.weight}
                    previousReps={previousSets[setIdx]?.reps}
                    unit={settings.units}
                    onLog={onLog}
                    onUpdate={onUpdate}
                    onUncomplete={onUncomplete}
                  />
                </motion.div>
              ))}
            </div>

            {/* Add set */}
            <button
              type="button"
              onClick={() => onAddSet(exerciseIdx)}
              className="w-full flex items-center justify-center gap-1.5 h-11 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)] hover:text-[var(--accent)] border-t border-[var(--border-subtle)] transition-colors"
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
