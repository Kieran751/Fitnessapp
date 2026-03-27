import { db } from '../db'

export async function checkForPR(
  exerciseId: number,
  weight: number,
  reps: number,
  workoutId: number,
  setId: number,
): Promise<{ isPR: boolean }> {
  if (weight <= 0) return { isPR: false }

  let isPR = false
  const now = new Date()

  // Estimated 1RM (Epley formula)
  const estimated1RM = Math.round((weight * (1 + reps / 30)) * 10) / 10

  const existing1RM = await db.personalRecords
    .where('exerciseId').equals(exerciseId)
    .and(r => r.type === '1rm')
    .first()

  if (!existing1RM || estimated1RM > existing1RM.value) {
    if (existing1RM?.id !== undefined) {
      await db.personalRecords.update(existing1RM.id, {
        value: estimated1RM, achievedAt: now, workoutId, setId,
      })
    } else {
      await db.personalRecords.add({
        exerciseId, type: '1rm', value: estimated1RM, achievedAt: now, workoutId, setId,
      })
    }
    isPR = true
  }

  // Max weight
  const existingMax = await db.personalRecords
    .where('exerciseId').equals(exerciseId)
    .and(r => r.type === 'maxWeight')
    .first()

  if (!existingMax || weight > existingMax.value) {
    if (existingMax?.id !== undefined) {
      await db.personalRecords.update(existingMax.id, {
        value: weight, achievedAt: now, workoutId, setId,
      })
    } else {
      await db.personalRecords.add({
        exerciseId, type: 'maxWeight', value: weight, achievedAt: now, workoutId, setId,
      })
    }
    isPR = true
  }

  return { isPR }
}
