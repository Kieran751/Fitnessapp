import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useStreak(): number {
  const streak = useLiveQuery(async () => {
    const workouts = await db.workouts
      .filter((w) => w.completedAt != null)
      .toArray()

    if (workouts.length === 0) return 0

    const days = new Set(
      workouts.map((w) => toDateKey(new Date(w.completedAt!)))
    )

    let count = 0
    const cursor = new Date()

    // If no workout today, start checking from yesterday
    if (!days.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
      // If no workout yesterday either, streak is 0
      if (!days.has(toDateKey(cursor))) return 0
    }

    while (days.has(toDateKey(cursor))) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }

    return count
  }, [])

  return streak ?? 0
}
