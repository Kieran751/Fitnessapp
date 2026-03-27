import { db, type Exercise } from '../db'

type ExerciseSeed = Omit<Exercise, 'id'>

export const exerciseSeeds: ExerciseSeed[] = [
  // Chest (10)
  { name: 'Bench Press (Barbell)', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Barbell', isCustom: false },
  { name: 'Incline Bench Press (Barbell)', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Flyes', muscleGroup: 'Chest', secondaryMuscles: ['Front Delts'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Flyes', muscleGroup: 'Chest', secondaryMuscles: ['Front Delts'], equipment: 'Cable', isCustom: false },
  { name: 'Machine Chest Press', muscleGroup: 'Chest', secondaryMuscles: ['Triceps'], equipment: 'Machine', isCustom: false },
  { name: 'Push-Ups', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Dips (Chest)', muscleGroup: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Pec Deck', muscleGroup: 'Chest', secondaryMuscles: [], equipment: 'Machine', isCustom: false },

  // Back (10)
  { name: 'Deadlift (Barbell)', muscleGroup: 'Back', secondaryMuscles: ['Glutes', 'Hamstrings', 'Traps'], equipment: 'Barbell', isCustom: false },
  { name: 'Bent Over Row (Barbell)', muscleGroup: 'Back', secondaryMuscles: ['Biceps', 'Rear Delts'], equipment: 'Barbell', isCustom: false },
  { name: 'Pull-Ups', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Lat Pulldown', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Cable', isCustom: false },
  { name: 'Seated Cable Row', muscleGroup: 'Back', secondaryMuscles: ['Biceps', 'Rear Delts'], equipment: 'Cable', isCustom: false },
  { name: 'Dumbbell Row', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Dumbbell', isCustom: false },
  { name: 'T-Bar Row', muscleGroup: 'Back', secondaryMuscles: ['Biceps', 'Rear Delts'], equipment: 'Barbell', isCustom: false },
  { name: 'Face Pulls', muscleGroup: 'Back', secondaryMuscles: ['Rear Delts', 'Traps'], equipment: 'Cable', isCustom: false },
  { name: 'Straight Arm Pulldown', muscleGroup: 'Back', secondaryMuscles: ['Triceps'], equipment: 'Cable', isCustom: false },
  { name: 'Machine Row', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Machine', isCustom: false },

  // Shoulders (8)
  { name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', secondaryMuscles: ['Triceps', 'Traps'], equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', secondaryMuscles: ['Triceps'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders', secondaryMuscles: [], equipment: 'Dumbbell', isCustom: false },
  { name: 'Front Raises', muscleGroup: 'Shoulders', secondaryMuscles: ['Upper Chest'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Rear Delt Flyes', muscleGroup: 'Shoulders', secondaryMuscles: ['Upper Back'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', secondaryMuscles: ['Triceps'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Upright Row', muscleGroup: 'Shoulders', secondaryMuscles: ['Traps', 'Biceps'], equipment: 'Barbell', isCustom: false },
  { name: 'Cable Lateral Raises', muscleGroup: 'Shoulders', secondaryMuscles: [], equipment: 'Cable', isCustom: false },

  // Biceps (6)
  { name: 'Barbell Curl', muscleGroup: 'Biceps', secondaryMuscles: ['Forearms'], equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps', secondaryMuscles: ['Forearms'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Hammer Curl', muscleGroup: 'Biceps', secondaryMuscles: ['Forearms', 'Brachialis'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Preacher Curl', muscleGroup: 'Biceps', secondaryMuscles: [], equipment: 'Barbell', isCustom: false },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', secondaryMuscles: [], equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Curl', muscleGroup: 'Biceps', secondaryMuscles: ['Forearms'], equipment: 'Cable', isCustom: false },

  // Triceps (6)
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps', secondaryMuscles: [], equipment: 'Cable', isCustom: false },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', secondaryMuscles: [], equipment: 'Dumbbell', isCustom: false },
  { name: 'Skull Crushers', muscleGroup: 'Triceps', secondaryMuscles: [], equipment: 'Barbell', isCustom: false },
  { name: 'Close Grip Bench Press', muscleGroup: 'Triceps', secondaryMuscles: ['Chest'], equipment: 'Barbell', isCustom: false },
  { name: 'Tricep Dips', muscleGroup: 'Triceps', secondaryMuscles: ['Chest', 'Shoulders'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Kickbacks', muscleGroup: 'Triceps', secondaryMuscles: [], equipment: 'Cable', isCustom: false },

  // Quads (8)
  { name: 'Squat (Barbell)', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Barbell', isCustom: false },
  { name: 'Front Squat', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Core'], equipment: 'Barbell', isCustom: false },
  { name: 'Leg Press', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Machine', isCustom: false },
  { name: 'Lunges', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Dumbbell', isCustom: false },
  { name: 'Leg Extension', muscleGroup: 'Quads', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Hack Squat', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Machine', isCustom: false },
  { name: 'Goblet Squat', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Core'], equipment: 'Dumbbell', isCustom: false },

  // Hamstrings (6)
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', secondaryMuscles: ['Glutes', 'Lower Back'], equipment: 'Barbell', isCustom: false },
  { name: 'Leg Curl (Lying)', muscleGroup: 'Hamstrings', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Leg Curl (Seated)', muscleGroup: 'Hamstrings', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Stiff Leg Deadlift', muscleGroup: 'Hamstrings', secondaryMuscles: ['Glutes', 'Lower Back'], equipment: 'Barbell', isCustom: false },
  { name: 'Good Mornings', muscleGroup: 'Hamstrings', secondaryMuscles: ['Lower Back', 'Glutes'], equipment: 'Barbell', isCustom: false },
  { name: 'Nordic Curl', muscleGroup: 'Hamstrings', secondaryMuscles: [], equipment: 'Bodyweight', isCustom: false },

  // Glutes (5)
  { name: 'Hip Thrust (Barbell)', muscleGroup: 'Glutes', secondaryMuscles: ['Hamstrings'], equipment: 'Barbell', isCustom: false },
  { name: 'Glute Bridge', muscleGroup: 'Glutes', secondaryMuscles: ['Hamstrings', 'Core'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Pull Through', muscleGroup: 'Glutes', secondaryMuscles: ['Hamstrings'], equipment: 'Cable', isCustom: false },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes', secondaryMuscles: ['Hamstrings', 'Quads'], equipment: 'Barbell', isCustom: false },
  { name: 'Step Ups', muscleGroup: 'Glutes', secondaryMuscles: ['Quads', 'Hamstrings'], equipment: 'Bodyweight', isCustom: false },

  // Calves (3)
  { name: 'Standing Calf Raise', muscleGroup: 'Calves', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Seated Calf Raise', muscleGroup: 'Calves', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Donkey Calf Raise', muscleGroup: 'Calves', secondaryMuscles: [], equipment: 'Machine', isCustom: false },

  // Abs (6)
  { name: 'Crunches', muscleGroup: 'Abs', secondaryMuscles: [], equipment: 'Bodyweight', isCustom: false },
  { name: 'Hanging Leg Raises', muscleGroup: 'Abs', secondaryMuscles: ['Hip Flexors'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Crunches', muscleGroup: 'Abs', secondaryMuscles: [], equipment: 'Cable', isCustom: false },
  { name: 'Plank', muscleGroup: 'Abs', secondaryMuscles: ['Core', 'Shoulders'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Ab Wheel Rollout', muscleGroup: 'Abs', secondaryMuscles: ['Shoulders', 'Lats'], equipment: 'Other', isCustom: false },
  { name: 'Decline Sit-Ups', muscleGroup: 'Abs', secondaryMuscles: ['Hip Flexors'], equipment: 'Bodyweight', isCustom: false },

  // Forearms (3)
  { name: 'Wrist Curls', muscleGroup: 'Forearms', secondaryMuscles: [], equipment: 'Barbell', isCustom: false },
  { name: 'Reverse Wrist Curls', muscleGroup: 'Forearms', secondaryMuscles: [], equipment: 'Barbell', isCustom: false },
  { name: "Farmer's Walk", muscleGroup: 'Forearms', secondaryMuscles: ['Traps', 'Core'], equipment: 'Dumbbell', isCustom: false },

  // Additional exercises to reach ~100
  // More Chest
  { name: 'Decline Bench Press', muscleGroup: 'Chest', secondaryMuscles: ['Triceps'], equipment: 'Barbell', isCustom: false },
  { name: 'Cable Crossover', muscleGroup: 'Chest', secondaryMuscles: [], equipment: 'Cable', isCustom: false },

  // More Back
  { name: 'Chin-Ups', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Rack Pull', muscleGroup: 'Back', secondaryMuscles: ['Traps', 'Glutes'], equipment: 'Barbell', isCustom: false },
  { name: 'Pendlay Row', muscleGroup: 'Back', secondaryMuscles: ['Biceps'], equipment: 'Barbell', isCustom: false },

  // More Shoulders
  { name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', secondaryMuscles: ['Triceps'], equipment: 'Machine', isCustom: false },
  { name: 'Cable Front Raise', muscleGroup: 'Shoulders', secondaryMuscles: [], equipment: 'Cable', isCustom: false },
  { name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', secondaryMuscles: ['Upper Back'], equipment: 'Machine', isCustom: false },

  // More Biceps
  { name: 'EZ Bar Curl', muscleGroup: 'Biceps', secondaryMuscles: ['Forearms'], equipment: 'Barbell', isCustom: false },
  { name: 'Concentration Curl', muscleGroup: 'Biceps', secondaryMuscles: [], equipment: 'Dumbbell', isCustom: false },

  // More Triceps
  { name: 'JM Press', muscleGroup: 'Triceps', secondaryMuscles: [], equipment: 'Barbell', isCustom: false },
  { name: 'Diamond Push-Ups', muscleGroup: 'Triceps', secondaryMuscles: ['Chest'], equipment: 'Bodyweight', isCustom: false },

  // More Quads
  { name: 'Sissy Squat', muscleGroup: 'Quads', secondaryMuscles: [], equipment: 'Bodyweight', isCustom: false },
  { name: 'Walking Lunges', muscleGroup: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Dumbbell', isCustom: false },

  // More Hamstrings
  { name: 'Single Leg Curl', muscleGroup: 'Hamstrings', secondaryMuscles: [], equipment: 'Machine', isCustom: false },

  // More Glutes
  { name: 'Donkey Kicks', muscleGroup: 'Glutes', secondaryMuscles: ['Hamstrings'], equipment: 'Bodyweight', isCustom: false },

  // More Abs
  { name: 'Russian Twists', muscleGroup: 'Abs', secondaryMuscles: ['Obliques'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Dragon Flag', muscleGroup: 'Abs', secondaryMuscles: ['Core'], equipment: 'Bodyweight', isCustom: false },
  { name: 'Pallof Press', muscleGroup: 'Abs', secondaryMuscles: ['Obliques'], equipment: 'Cable', isCustom: false },

  // Traps
  { name: 'Barbell Shrugs', muscleGroup: 'Traps', secondaryMuscles: ['Forearms'], equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Shrugs', muscleGroup: 'Traps', secondaryMuscles: [], equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Shrugs', muscleGroup: 'Traps', secondaryMuscles: [], equipment: 'Cable', isCustom: false },

  // Cardio
  { name: 'Treadmill', muscleGroup: 'Cardio', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Rowing Machine', muscleGroup: 'Cardio', secondaryMuscles: ['Back', 'Biceps'], equipment: 'Machine', isCustom: false },
  { name: 'Stationary Bike', muscleGroup: 'Cardio', secondaryMuscles: [], equipment: 'Machine', isCustom: false },
  { name: 'Stairmaster', muscleGroup: 'Cardio', secondaryMuscles: ['Glutes', 'Calves'], equipment: 'Machine', isCustom: false },
]

export async function seedExercises() {
  const count = await db.exercises.count()
  if (count === 0) {
    await db.exercises.bulkAdd(exerciseSeeds)
  }
}
