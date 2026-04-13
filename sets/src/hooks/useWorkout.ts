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
import { type Exercise, type Template } from '../db'
import { supabase } from '../lib/supabase'
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
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    const { data } = await supabase
      .from('workouts')
      .insert({ name: 'Freestyle Workout', startedAt: new Date(), userId })
      .select()
      .single()

    const workoutId = data!.id as number

    setSession({
      workoutId,
      workoutName: 'Freestyle Workout',
      startedAt: new Date(),
      exercises: [],
    })
  }

  async function startFromTemplate(template: Template) {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    const { data } = await supabase
      .from('workouts')
      .insert({ name: template.name, startedAt: new Date(), templateId: template.id, userId })
      .select()
      .single()

    const workoutId = data!.id as number

    const exercises: WorkoutExerciseState[] = []
    for (const te of template.exercises) {
      const { data: exercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', te.exerciseId)
        .single()

      if (!exercise) continue
      exercises.push(
        await buildExerciseState(
          te.exerciseId,
          exercise as Exercise,
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

  function logSet(exerciseIdx: number, setIdx: number) {
    if (!session) return
    const ex = session.exercises[exerciseIdx]
    const set = ex.sets[setIdx]

    // Capture values for background DB work
    const workoutId = session.workoutId
    const exerciseId = ex.exerciseId
    const setUuid = set.id
    const { setNumber, weight, reps, setType } = set
    const restSeconds = ex.restSeconds
    const exerciseName = ex.exercise.name

    // Optimistic UI — mark as logged instantly
    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((e, ei) => {
          if (ei !== exerciseIdx) return e
          return { ...e, sets: e.sets.map((s, si) => si === setIdx ? { ...s, isLogged: true } : s) }
        }),
      }
    })

    navigator.vibrate?.(50)

    setRestTimer({
      isActive: true,
      isMinimized: false,
      totalSeconds: restSeconds,
      remainingSeconds: restSeconds,
      exerciseName,
    })

    // Background: DB persist + PR check
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user!.id

        const { data: inserted } = await supabase
          .from('sets')
          .insert({ workoutId, exerciseId, setNumber, weight, reps, setType, timestamp: new Date(), userId })
          .select()
          .single()

        const dbId = inserted!.id as number

        // Store DB id (safe against reorder via UUID lookup)
        setSession(prev => {
          if (!prev) return prev
          return {
            ...prev,
            exercises: prev.exercises.map(e => ({
              ...e,
              sets: e.sets.map(s => s.id === setUuid ? { ...s, dbId } : s),
            })),
          }
        })

        if (weight > 0) {
          const { isPR } = await checkForPR(exerciseId, weight, reps, workoutId, dbId, userId)
          if (isPR) {
            navigator.vibrate?.([50, 30, 50, 30, 100])
            setSession(prev => {
              if (!prev) return prev
              return {
                ...prev,
                exercises: prev.exercises.map(e => ({
                  ...e,
                  sets: e.sets.map(s => s.id === setUuid ? { ...s, isPR: true } : s),
                })),
              }
            })
          }
        }
      } catch (err) {
        console.error('Failed to persist set:', err)
      }
    })()
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

  async function renameWorkout(name: string) {
    setSession(prev => prev ? { ...prev, workoutName: name } : prev)
    if (session) {
      await supabase.from('workouts').update({ name }).eq('id', session.workoutId)
    }
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

  function removeSet(exerciseIdx: number, setIdx: number) {
    if (!session) return
    const set = session.exercises[exerciseIdx]?.sets[setIdx]

    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((e, ei) => {
          if (ei !== exerciseIdx) return e
          return {
            ...e,
            sets: e.sets
              .filter((_, si) => si !== setIdx)
              .map((s, i) => ({ ...s, setNumber: i + 1 })),
          }
        }),
      }
    })

    if (set?.dbId) {
      supabase.from('sets').delete().eq('id', set.dbId)
    }
  }

  function removeExercise(exerciseIdx: number) {
    if (!session) return
    const ex = session.exercises[exerciseIdx]

    setSession(prev => {
      if (!prev) return prev
      return { ...prev, exercises: prev.exercises.filter((_, i) => i !== exerciseIdx) }
    })

    for (const s of ex.sets) {
      if (s.dbId) supabase.from('sets').delete().eq('id', s.dbId)
    }
  }

  async function finishWorkout() {
    if (!session) return
    const completedAt = new Date()
    await supabase.from('workouts').update({ completedAt, name: session.workoutName }).eq('id', session.workoutId)

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
    await supabase.from('sets').delete().eq('workoutId', session.workoutId)
    await supabase.from('workouts').delete().eq('id', session.workoutId)
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
    removeSet,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  }
}
