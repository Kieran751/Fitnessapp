import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useStreak(): number {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: workouts } = await supabase
        .from('workouts')
        .select('completedAt')
        .not('completedAt', 'is', null)

      if (!workouts || workouts.length === 0) { setStreak(0); return }

      const days = new Set(
        workouts.map((w) => toDateKey(new Date(w.completedAt!)))
      )

      let count = 0
      const cursor = new Date()

      // If no workout today, start checking from yesterday
      if (!days.has(toDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1)
        // If no workout yesterday either, streak is 0
        if (!days.has(toDateKey(cursor))) { setStreak(0); return }
      }

      while (days.has(toDateKey(cursor))) {
        count++
        cursor.setDate(cursor.getDate() - 1)
      }

      setStreak(count)
    }
    load()
  }, [])

  return streak
}
