import { supabase } from './supabase'

export async function checkForPR(
  exerciseId: number,
  weight: number,
  reps: number,
  workoutId: number,
  setId: number,
  userId: string,
): Promise<{ isPR: boolean }> {
  if (weight <= 0) return { isPR: false }

  let isPR = false
  const now = new Date()

  // Estimated 1RM (Epley formula)
  const estimated1RM = Math.round((weight * (1 + reps / 30)) * 10) / 10

  const { data: existing1RM } = await supabase
    .from('personal_records')
    .select('*')
    .eq('exerciseId', exerciseId)
    .eq('type', '1rm')
    .maybeSingle()

  if (!existing1RM || estimated1RM > existing1RM.value) {
    if (existing1RM?.id !== undefined) {
      await supabase
        .from('personal_records')
        .update({ value: estimated1RM, achievedAt: now, workoutId, setId })
        .eq('id', existing1RM.id)
    } else {
      await supabase
        .from('personal_records')
        .insert({ exerciseId, type: '1rm', value: estimated1RM, achievedAt: now, workoutId, setId, userId })
    }
    isPR = true
  }

  // Max weight
  const { data: existingMax } = await supabase
    .from('personal_records')
    .select('*')
    .eq('exerciseId', exerciseId)
    .eq('type', 'maxWeight')
    .maybeSingle()

  if (!existingMax || weight > existingMax.value) {
    if (existingMax?.id !== undefined) {
      await supabase
        .from('personal_records')
        .update({ value: weight, achievedAt: now, workoutId, setId })
        .eq('id', existingMax.id)
    } else {
      await supabase
        .from('personal_records')
        .insert({ exerciseId, type: 'maxWeight', value: weight, achievedAt: now, workoutId, setId, userId })
    }
    isPR = true
  }

  return { isPR }
}
