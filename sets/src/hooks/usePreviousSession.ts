import { useState, useEffect } from 'react'
import { db } from '../db'

export interface PreviousSet {
  setNumber: number
  weight: number
  reps: number
}

export async function fetchPreviousSets(
  exerciseId: number,
  currentWorkoutId: number,
): Promise<PreviousSet[]> {
  const allSets = await db.sets.where('exerciseId').equals(exerciseId).toArray()
  const otherWorkoutIds = [...new Set(allSets.map(s => s.workoutId))].filter(
    id => id !== currentWorkoutId,
  )
  if (otherWorkoutIds.length === 0) return []

  const workouts = await Promise.all(otherWorkoutIds.map(id => db.workouts.get(id)))
  const completed = workouts.filter(w => w?.completedAt) as NonNullable<typeof workouts[0]>[]
  if (completed.length === 0) return []

  const mostRecent = completed.sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
  )[0]

  return allSets
    .filter(s => s.workoutId === mostRecent.id)
    .sort((a, b) => a.setNumber - b.setNumber)
    .map(s => ({ setNumber: s.setNumber, weight: s.weight, reps: s.reps }))
}

export function usePreviousSession(exerciseId: number, currentWorkoutId: number) {
  const [previousSets, setPreviousSets] = useState<PreviousSet[]>([])

  useEffect(() => {
    fetchPreviousSets(exerciseId, currentWorkoutId).then(setPreviousSets)
  }, [exerciseId, currentWorkoutId])

  return previousSets
}
