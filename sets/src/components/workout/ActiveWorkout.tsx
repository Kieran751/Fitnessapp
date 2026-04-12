import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useWorkout } from '../../hooks/useWorkout'
import { ExerciseSection } from './ExerciseSection'
import { RestTimer } from './RestTimer'
import { ExercisePicker } from './ExercisePicker'
import { Button } from '../ui/Button'
import { type Exercise } from '../../db'
import { formatSeconds } from '../../lib/formatters'
import { type SetState } from '../../store/atoms'

export function ActiveWorkout() {
  const {
    session, addExercise, logSet, updateSetField,
    addSet, toggleExpanded, renameWorkout,
    uncompleteSet, finishWorkout, cancelWorkout,
  } = useWorkout()

  const [elapsed, setElapsed] = useState(0)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return
    const start = session.startedAt.getTime()
    setElapsed(Math.floor((Date.now() - start) / 1000))
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [session?.startedAt])

  useEffect(() => {
    if (editingName) setTimeout(() => nameInputRef.current?.focus(), 50)
  }, [editingName])

  if (!session) return null

  function handleSelectExercise(ex: Exercise) {
    addExercise(ex)
    setShowPicker(false)
  }

  function handleNameBlur() {
    if (nameVal.trim()) renameWorkout(nameVal.trim())
    setEditingName(false)
  }

  function startEditName() {
    setNameVal(session!.workoutName)
    setEditingName(true)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-4 border-b border-[var(--glass-border)]">
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="text-sm font-semibold text-[var(--danger)]"
        >
          Cancel
        </button>

        <div className="flex flex-col items-center">
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={e => e.key === 'Enter' && handleNameBlur()}
              className="text-base font-bold text-center bg-transparent border-b border-[var(--accent)] outline-none text-[var(--text-primary)] w-44"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          ) : (
            <button
              type="button"
              onClick={startEditName}
              className="text-base font-bold text-[var(--text-primary)] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {session.workoutName}
            </button>
          )}
          <span className="font-mono tabular text-xs text-[var(--accent)] mt-0.5">
            {formatSeconds(elapsed)}
          </span>
        </div>

        <Button size="sm" onClick={() => setShowFinishConfirm(true)}>
          Finish
        </Button>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-40 flex flex-col gap-3">
        {session.exercises.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[var(--primary-surface)] flex items-center justify-center mb-5">
              <Plus size={32} className="text-[var(--accent)]" strokeWidth={1.75} />
            </div>
            <p
              className="font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              No exercises yet
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Tap the button below to add one</p>
          </div>
        )}

        {session.exercises.map((ex, idx) => (
          <motion.div
            key={ex.exerciseId + '-' + idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ExerciseSection
              exercise={ex}
              exerciseIdx={idx}
              workoutId={session.workoutId}
              onLog={logSet}
              onUpdate={(ei, si, updates) => updateSetField(ei, si, updates as Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>)}
              onUncomplete={uncompleteSet}
              onAddSet={addSet}
              onToggle={toggleExpanded}
            />
          </motion.div>
        ))}

        {/* Add exercise button */}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-center gap-2 h-14 rounded-2xl border-2 border-dashed border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Exercise</span>
        </button>
      </div>

      {/* Rest timer */}
      <RestTimer />

      {/* Exercise picker */}
      <ExercisePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectExercise}
      />

      {/* Finish confirm */}
      <AnimatePresence>
        {showFinishConfirm && (
          <ConfirmModal
            title="Finish workout?"
            confirm="Finish"
            cancel="Keep Training"
            onConfirm={() => { setShowFinishConfirm(false); finishWorkout() }}
            onCancel={() => setShowFinishConfirm(false)}
          />
        )}
        {showCancelConfirm && (
          <ConfirmModal
            title="Discard this workout?"
            confirm="Discard"
            cancel="Keep Going"
            danger
            onConfirm={() => { setShowCancelConfirm(false); cancelWorkout() }}
            onCancel={() => setShowCancelConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ConfirmModal({
  title, confirm, cancel, danger = false, onConfirm, onCancel,
}: {
  title: string
  confirm: string
  cancel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60"
        style={{
          background: 'rgba(9, 14, 24, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed z-60 left-4 right-4 bottom-12 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-3xl p-6 flex flex-col gap-5"
      >
        <p
          className="text-base font-semibold text-[var(--text-primary)] text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>{cancel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>{confirm}</Button>
        </div>
      </motion.div>
    </>
  )
}
