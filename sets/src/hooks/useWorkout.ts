import { useAtom, useAtomValue } from 'jotai'
import {
  workoutSessionAtom,
  restTimerAtom,
  workoutSummaryAtom,
  settingsAtom,
  type SetState,
  type WorkoutExerciseState,
  type PRRecord,
} from '../store/atoms'
import { db, type Exercise, type Template } from '../db'
import { checkForPR } from '../lib/pr'
import { fetchPreviousSets } from './usePreviousSession'

function makeSet(
  setNumber: number,
  weight: number,
  reps: number,
): SetState {
  return {
    id: crypto.randomUUID(),
    setNumber,
    weight,
    reps,
    setType: 'normal',
    isLogged: false,
  }
}

async function buildExerciseState(
  exerciseId: number,
  exercise: Exercise,
  targetSets: number,
  targetReps: number,
  restSeconds: number,
  workoutId: number,
): Promise<WorkoutExerciseState> {
  const prev = await fetchPreviousSets(exerciseId, workoutId)
  const sets: SetState[] = Array.from({ length: targetSets }, (_, i) =>
    makeSet(i + 1, prev[i]?.weight ?? 0, prev[i]?.reps ?? targetReps),
  )
  return { exerciseId, exercise, sets, restSeconds, isExpanded: true }
}

export function useWorkout() {
  const [session, setSession] = useAtom(workoutSessionAtom)
  const [, setRestTimer] = useAtom(restTimerAtom)
  const [, setSummary] = useAtom(workoutSummaryAtom)
  const settings = useAtomValue(settingsAtom)

  async function startFreestyle() {
    const workoutId = (await db.workouts.add({
      name: 'Freestyle Workout',
      startedAt: new Date(),
    })) as number

    setSession({
      workoutId,
      workoutName: 'Freestyle Workout',
      startedAt: new Date(),
      exercises: [],
    })
  }

  async function startFromTemplate(template: Template) {
    const workoutId = (await db.workouts.add({
      name: template.name,
      startedAt: new Date(),
      templateId: template.id,
    })) as number

    const exercises: WorkoutExerciseState[] = []
    for (const te of template.exercises) {
      const exercise = await db.exercises.get(te.exerciseId)
      if (!exercise) continue
      exercises.push(
        await buildExerciseState(
          te.exerciseId,
          exercise,
          te.targetSets,
          te.targetReps,
          te.restSeconds,
          workoutId,
        ),
      )
    }

    setSession({
      workoutId,
      workoutName: template.name,
      startedAt: new Date(),
      templateId: template.id,
      exercises,
    })
  }

  async function addExercise(exercise: Exercise) {
    if (!session) return
    const state = await buildExerciseState(
      exercise.id!,
      exercise,
      1,
      10,
      settings.defaultRestSeconds,
      session.workoutId,
    )
    setSession(prev => prev ? { ...prev, exercises: [...prev.exercises, state] } : prev)
  }

  async function logSet(
    exerciseIdx: number,
    setIdx: number,
  ): Promise<{ isPR: boolean }> {
    if (!session) return { isPR: false }
    const ex = session.exercises[exerciseIdx]
    const set = ex.sets[setIdx]

    const setId = (await db.sets.add({
      workoutId: session.workoutId,
      exerciseId: ex.exerciseId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps,
      setType: set.setType,
      timestamp: new Date(),
    })) as number

    navigator.vibrate?.(50)

    const { isPR } = set.weight > 0
      ? await checkForPR(ex.exerciseId, set.weight, set.reps, session.workoutId, setId)
      : { isPR: false }

    if (isPR) navigator.vibrate?.([50, 30, 50, 30, 100])

    setRestTimer({
      isActive: true,
      isMinimized: false,
      totalSeconds: ex.restSeconds,
      remainingSeconds: ex.restSeconds,
      exerciseName: ex.exercise.name,
    })

    setSession(prev => {
      if (!prev) return prev
      const exercises = prev.exercises.map((e, ei) => {
        if (ei !== exerciseIdx) return e
        const sets = e.sets.map((s, si) =>
          si === setIdx ? { ...s, isLogged: true, dbId: setId, isPR } : s,
        )
        // Append a new empty set after the last one is logged
        if (setIdx === sets.length - 1) {
          sets.push(makeSet(sets.length + 1, set.weight, set.reps))
        }
        return { ...e, sets }
      })
      return { ...prev, exercises }
    })

    return { isPR }
  }

  function updateSetField(
    exerciseIdx: number,
    setIdx: number,
    updates: Partial<Pick<SetState, 'weight' | 'reps' | 'setType'>>,
  ) {
    setSession(prev => {
      if (!prev) return prev
      const exercises = prev.exercises.map((e, ei) => {
        if (ei !== exerciseIdx) return e
        const sets = e.sets.map((s, si) => si === setIdx ? { ...s, ...updates } : s)
        return { ...e, sets }
      })
      return { ...prev, exercises }
    })
  }

  function addSet(exerciseIdx: number) {
    setSession(prev => {
      if (!prev) return prev
      const exercises = prev.exercises.map((e, ei) => {
        if (ei !== exerciseIdx) return e
        const last = e.sets[e.sets.length - 1]
        const newSet = makeSet(e.sets.length + 1, last?.weight ?? 0, last?.reps ?? 10)
        return { ...e, sets: [...e.sets, newSet] }
      })
      return { ...prev, exercises }
    })
  }

  function toggleExpanded(exerciseIdx: number) {
    setSession(prev => {
      if (!prev) return prev
      const exercises = prev.exercises.map((e, ei) =>
        ei === exerciseIdx ? { ...e, isExpanded: !e.isExpanded } : e,
      )
      return { ...prev, exercises }
    })
  }

  function renameWorkout(name: string) {
    setSession(prev => prev ? { ...prev, workoutName: name } : prev)
    if (session) db.workouts.update(session.workoutId, { name })
  }

  function uncompleteSet(exerciseIdx: number, setIdx: number) {
    setSession(prev => {
      if (!prev) return prev
      const exercises = prev.exercises.map((e, ei) => {
        if (ei !== exerciseIdx) return e
        const sets = e.sets.map((s, si) =>
          si === setIdx ? { ...s, isLogged: false, dbId: undefined, isPR: undefined } : s,
        )
        return { ...e, sets }
      })
      return { ...prev, exercises }
    })
  }

  async function finishWorkout() {
    if (!session) return
    const completedAt = new Date()
    await db.workouts.update(session.workoutId, { completedAt, name: session.workoutName })

    const prs: PRRecord[] = []
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        if (s.isPR) prs.push({ exerciseName: ex.exercise.name, type: 'New 1RM', value: s.weight })
      }
    }

    setSummary({
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      startedAt: session.startedAt,
      completedAt,
      exercises: session.exercises,
      prs,
    })
    setSession(null)
    setRestTimer(t => ({ ...t, isActive: false }))
  }

  async function cancelWorkout() {
    if (!session) return
    await db.workouts.delete(session.workoutId)
    // Also delete any saved sets
    await db.sets.where('workoutId').equals(session.workoutId).delete()
    setSession(null)
    setRestTimer(t => ({ ...t, isActive: false }))
  }

  return {
    session,
    startFreestyle,
    startFromTemplate,
    addExercise,
    logSet,
    updateSetField,
    addSet,
    toggleExpanded,
    renameWorkout,
    uncompleteSet,
    finishWorkout,
    cancelWorkout,
  }
}
