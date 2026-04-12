export interface Exercise {
  id?: number
  name: string
  muscleGroup: string
  secondaryMuscles: string[]
  equipment: string
  isCustom: boolean
}

export interface Template {
  id?: number
  name: string
  exercises: {
    exerciseId: number
    targetSets: number
    targetReps: number
    restSeconds: number
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Workout {
  id?: number
  templateId?: number
  name: string
  startedAt: Date
  completedAt?: Date
  notes?: string
}

export interface WorkoutSet {
  id?: number
  workoutId: number
  exerciseId: number
  setNumber: number
  weight: number
  reps: number
  setType: 'normal' | 'warmup' | 'dropset' | 'failure'
  timestamp: Date
}

export interface BodyWeight {
  id?: number
  weight: number
  date: Date
}

export interface PersonalRecord {
  id?: number
  exerciseId: number
  type: '1rm' | 'maxWeight' | 'maxReps' | 'maxVolume'
  value: number
  achievedAt: Date
  workoutId: number
  setId: number
}
