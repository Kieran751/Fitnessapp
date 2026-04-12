import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface PreviousSet {
  setNumber: number
  weight: number
  reps: number
}

export async function fetchPreviousSets(
  exerciseId: number,
  currentWorkoutId: number,
): Promise<PreviousSet[]> {
  // Get all sets for this exercise
  const { data: allSets } = await supabase
    .from('sets')
    .select('*')
    .eq('exerciseId', exerciseId)

  if (!allSets || allSets.length === 0) return []

  const otherWorkoutIds = [...new Set(allSets.map(s => s.workoutId))].filter(
    id => id !== currentWorkoutId,
  )
  if (otherWorkoutIds.length === 0) return []

  // Get those workouts to find the most recent completed one
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .in('id', otherWorkoutIds)
    .not('completedAt', 'is', null)

  if (!workouts || workouts.length === 0) return []

  const mostRecent = workouts.sort(
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
