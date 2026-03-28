import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { type Exercise } from '../db'

export interface Settings {
  units: 'kg' | 'lbs'
  defaultRestSeconds: number
  theme: 'dark' | 'light'
}

const defaultSettings: Settings = {
  units: 'kg',
  defaultRestSeconds: 90,
  theme: 'dark',
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsAtom = atomWithStorage<Settings>('sets-settings', defaultSettings)

// ─── Workout session types ────────────────────────────────────────────────────
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure'

export interface SetState {
  id: string          // local UUID for React keys
  dbId?: number       // Dexie id after saving
  setNumber: number
  weight: number
  reps: number
  setType: SetType
  isLogged: boolean
  isPR?: boolean
}

export interface WorkoutExerciseState {
  exerciseId: number
  exercise: Exercise
  sets: SetState[]
  restSeconds: number
  isExpanded: boolean
}

export interface WorkoutSession {
  workoutId: number
  workoutName: string
  startedAt: Date
  templateId?: number
  exercises: WorkoutExerciseState[]
}

// ─── Rest timer ───────────────────────────────────────────────────────────────
export interface RestTimerState {
  isActive: boolean
  isMinimized: boolean
  totalSeconds: number
  remainingSeconds: number
  exerciseName: string
}

const defaultRestTimer: RestTimerState = {
  isActive: false,
  isMinimized: false,
  totalSeconds: 90,
  remainingSeconds: 90,
  exerciseName: '',
}

// ─── Workout summary ──────────────────────────────────────────────────────────
export interface PRRecord {
  exerciseName: string
  type: string
  value: number
}

export interface WorkoutSummaryState {
  workoutId: number
  workoutName: string
  startedAt: Date
  completedAt: Date
  exercises: WorkoutExerciseState[]
  prs: PRRecord[]
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface ToastState {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}
export const toastAtom = atom<ToastState | null>(null)

// ─── Atoms ────────────────────────────────────────────────────────────────────
export const workoutSessionAtom = atom<WorkoutSession | null>(null)
export const restTimerAtom = atom<RestTimerState>(defaultRestTimer)
export const workoutSummaryAtom = atom<WorkoutSummaryState | null>(null)

// Derived
export const isWorkoutActiveAtom = atom((get) => get(workoutSessionAtom) !== null)
// Keep legacy activeWorkoutAtom shape for BottomNav reference
export const activeWorkoutAtom = atom<null>(null)
