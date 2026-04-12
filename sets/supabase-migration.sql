-- SETS Fitness PWA — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- ============================================================
-- EXERCISES (shared seeds + user custom)
-- ============================================================
create table public.exercises (
  id            bigint generated always as identity primary key,
  name          text not null,
  "muscleGroup" text not null,
  "secondaryMuscles" text[] not null default '{}',
  equipment     text not null,
  "isCustom"    boolean not null default false,
  "userId"      uuid references auth.users(id) on delete cascade
);

create index idx_exercises_muscle_group on public.exercises("muscleGroup");
alter table public.exercises enable row level security;

-- Anyone can read shared (seed) exercises
create policy "read_shared_exercises" on public.exercises for select using ("userId" is null);
-- Users can read their own custom exercises
create policy "read_own_exercises" on public.exercises for select using (auth.uid() = "userId");
-- Users can insert custom exercises
create policy "insert_own_exercises" on public.exercises for insert with check (auth.uid() = "userId");
-- Users can update/delete own custom exercises
create policy "update_own_exercises" on public.exercises for update using (auth.uid() = "userId");
create policy "delete_own_exercises" on public.exercises for delete using (auth.uid() = "userId");

-- ============================================================
-- TEMPLATES (per-user)
-- ============================================================
create table public.templates (
  id           bigint generated always as identity primary key,
  "userId"     uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  exercises    jsonb not null default '[]',
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);

create index idx_templates_user on public.templates("userId");
alter table public.templates enable row level security;

create policy "crud_own_templates" on public.templates for all
  using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- ============================================================
-- WORKOUTS (per-user)
-- ============================================================
create table public.workouts (
  id            bigint generated always as identity primary key,
  "userId"      uuid not null references auth.users(id) on delete cascade,
  "templateId"  bigint references public.templates(id) on delete set null,
  name          text not null,
  "startedAt"   timestamptz not null default now(),
  "completedAt" timestamptz,
  notes         text
);

create index idx_workouts_user on public.workouts("userId");
create index idx_workouts_started on public.workouts("startedAt" desc);
alter table public.workouts enable row level security;

create policy "crud_own_workouts" on public.workouts for all
  using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- ============================================================
-- SETS (per-user)
-- ============================================================
create table public.sets (
  id            bigint generated always as identity primary key,
  "userId"      uuid not null references auth.users(id) on delete cascade,
  "workoutId"   bigint not null references public.workouts(id) on delete cascade,
  "exerciseId"  bigint not null references public.exercises(id) on delete cascade,
  "setNumber"   smallint not null,
  weight        numeric(7,2) not null default 0,
  reps          smallint not null default 0,
  "setType"     text not null default 'normal'
                check ("setType" in ('normal', 'warmup', 'dropset', 'failure')),
  timestamp     timestamptz not null default now()
);

create index idx_sets_workout on public.sets("workoutId");
create index idx_sets_exercise on public.sets("exerciseId");
create index idx_sets_user on public.sets("userId");
alter table public.sets enable row level security;

create policy "crud_own_sets" on public.sets for all
  using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- ============================================================
-- BODY_WEIGHTS (per-user)
-- ============================================================
create table public.body_weights (
  id        bigint generated always as identity primary key,
  "userId"  uuid not null references auth.users(id) on delete cascade,
  weight    numeric(5,2) not null,
  date      timestamptz not null default now()
);

create index idx_bw_user on public.body_weights("userId");
create index idx_bw_date on public.body_weights(date desc);
alter table public.body_weights enable row level security;

create policy "crud_own_body_weights" on public.body_weights for all
  using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- ============================================================
-- PERSONAL_RECORDS (per-user)
-- ============================================================
create table public.personal_records (
  id            bigint generated always as identity primary key,
  "userId"      uuid not null references auth.users(id) on delete cascade,
  "exerciseId"  bigint not null references public.exercises(id) on delete cascade,
  type          text not null check (type in ('1rm', 'maxWeight', 'maxReps', 'maxVolume')),
  value         numeric(10,2) not null,
  "achievedAt"  timestamptz not null default now(),
  "workoutId"   bigint references public.workouts(id) on delete set null,
  "setId"       bigint references public.sets(id) on delete set null
);

create index idx_pr_user on public.personal_records("userId");
create index idx_pr_exercise on public.personal_records("exerciseId");
alter table public.personal_records enable row level security;

create policy "crud_own_prs" on public.personal_records for all
  using (auth.uid() = "userId") with check (auth.uid() = "userId");

-- ============================================================
-- SEED EXERCISES (shared, userId = NULL)
-- ============================================================
insert into public.exercises (name, "muscleGroup", "secondaryMuscles", equipment, "isCustom", "userId") values
  ('Bench Press (Barbell)', 'Chest', '{"Triceps","Front Delts"}', 'Barbell', false, null),
  ('Incline Bench Press (Barbell)', 'Chest', '{"Triceps","Front Delts"}', 'Barbell', false, null),
  ('Dumbbell Bench Press', 'Chest', '{"Triceps","Front Delts"}', 'Dumbbell', false, null),
  ('Incline Dumbbell Press', 'Chest', '{"Triceps","Front Delts"}', 'Dumbbell', false, null),
  ('Dumbbell Flyes', 'Chest', '{"Front Delts"}', 'Dumbbell', false, null),
  ('Cable Flyes', 'Chest', '{"Front Delts"}', 'Cable', false, null),
  ('Machine Chest Press', 'Chest', '{"Triceps"}', 'Machine', false, null),
  ('Push-Ups', 'Chest', '{"Triceps","Front Delts"}', 'Bodyweight', false, null),
  ('Dips (Chest)', 'Chest', '{"Triceps","Front Delts"}', 'Bodyweight', false, null),
  ('Pec Deck', 'Chest', '{}', 'Machine', false, null),
  ('Deadlift (Barbell)', 'Back', '{"Glutes","Hamstrings","Traps"}', 'Barbell', false, null),
  ('Bent Over Row (Barbell)', 'Back', '{"Biceps","Rear Delts"}', 'Barbell', false, null),
  ('Pull-Ups', 'Back', '{"Biceps"}', 'Bodyweight', false, null),
  ('Lat Pulldown', 'Back', '{"Biceps"}', 'Cable', false, null),
  ('Seated Cable Row', 'Back', '{"Biceps","Rear Delts"}', 'Cable', false, null),
  ('Dumbbell Row', 'Back', '{"Biceps"}', 'Dumbbell', false, null),
  ('T-Bar Row', 'Back', '{"Biceps","Rear Delts"}', 'Barbell', false, null),
  ('Face Pulls', 'Back', '{"Rear Delts","Traps"}', 'Cable', false, null),
  ('Straight Arm Pulldown', 'Back', '{"Triceps"}', 'Cable', false, null),
  ('Machine Row', 'Back', '{"Biceps"}', 'Machine', false, null),
  ('Overhead Press (Barbell)', 'Shoulders', '{"Triceps","Traps"}', 'Barbell', false, null),
  ('Dumbbell Shoulder Press', 'Shoulders', '{"Triceps"}', 'Dumbbell', false, null),
  ('Lateral Raises', 'Shoulders', '{}', 'Dumbbell', false, null),
  ('Front Raises', 'Shoulders', '{"Upper Chest"}', 'Dumbbell', false, null),
  ('Rear Delt Flyes', 'Shoulders', '{"Upper Back"}', 'Dumbbell', false, null),
  ('Arnold Press', 'Shoulders', '{"Triceps"}', 'Dumbbell', false, null),
  ('Upright Row', 'Shoulders', '{"Traps","Biceps"}', 'Barbell', false, null),
  ('Cable Lateral Raises', 'Shoulders', '{}', 'Cable', false, null),
  ('Barbell Curl', 'Biceps', '{"Forearms"}', 'Barbell', false, null),
  ('Dumbbell Curl', 'Biceps', '{"Forearms"}', 'Dumbbell', false, null),
  ('Hammer Curl', 'Biceps', '{"Forearms","Brachialis"}', 'Dumbbell', false, null),
  ('Preacher Curl', 'Biceps', '{}', 'Barbell', false, null),
  ('Incline Dumbbell Curl', 'Biceps', '{}', 'Dumbbell', false, null),
  ('Cable Curl', 'Biceps', '{"Forearms"}', 'Cable', false, null),
  ('Tricep Pushdown', 'Triceps', '{}', 'Cable', false, null),
  ('Overhead Tricep Extension', 'Triceps', '{}', 'Dumbbell', false, null),
  ('Skull Crushers', 'Triceps', '{}', 'Barbell', false, null),
  ('Close Grip Bench Press', 'Triceps', '{"Chest"}', 'Barbell', false, null),
  ('Tricep Dips', 'Triceps', '{"Chest","Shoulders"}', 'Bodyweight', false, null),
  ('Cable Kickbacks', 'Triceps', '{}', 'Cable', false, null),
  ('Squat (Barbell)', 'Quads', '{"Glutes","Hamstrings"}', 'Barbell', false, null),
  ('Front Squat', 'Quads', '{"Glutes","Core"}', 'Barbell', false, null),
  ('Leg Press', 'Quads', '{"Glutes","Hamstrings"}', 'Machine', false, null),
  ('Lunges', 'Quads', '{"Glutes","Hamstrings"}', 'Bodyweight', false, null),
  ('Bulgarian Split Squat', 'Quads', '{"Glutes","Hamstrings"}', 'Dumbbell', false, null),
  ('Leg Extension', 'Quads', '{}', 'Machine', false, null),
  ('Hack Squat', 'Quads', '{"Glutes","Hamstrings"}', 'Machine', false, null),
  ('Goblet Squat', 'Quads', '{"Glutes","Core"}', 'Dumbbell', false, null),
  ('Romanian Deadlift', 'Hamstrings', '{"Glutes","Lower Back"}', 'Barbell', false, null),
  ('Leg Curl (Lying)', 'Hamstrings', '{}', 'Machine', false, null),
  ('Leg Curl (Seated)', 'Hamstrings', '{}', 'Machine', false, null),
  ('Stiff Leg Deadlift', 'Hamstrings', '{"Glutes","Lower Back"}', 'Barbell', false, null),
  ('Good Mornings', 'Hamstrings', '{"Lower Back","Glutes"}', 'Barbell', false, null),
  ('Nordic Curl', 'Hamstrings', '{}', 'Bodyweight', false, null),
  ('Hip Thrust (Barbell)', 'Glutes', '{"Hamstrings"}', 'Barbell', false, null),
  ('Glute Bridge', 'Glutes', '{"Hamstrings","Core"}', 'Bodyweight', false, null),
  ('Cable Pull Through', 'Glutes', '{"Hamstrings"}', 'Cable', false, null),
  ('Sumo Deadlift', 'Glutes', '{"Hamstrings","Quads"}', 'Barbell', false, null),
  ('Step Ups', 'Glutes', '{"Quads","Hamstrings"}', 'Bodyweight', false, null),
  ('Standing Calf Raise', 'Calves', '{}', 'Machine', false, null),
  ('Seated Calf Raise', 'Calves', '{}', 'Machine', false, null),
  ('Donkey Calf Raise', 'Calves', '{}', 'Machine', false, null),
  ('Crunches', 'Abs', '{}', 'Bodyweight', false, null),
  ('Hanging Leg Raises', 'Abs', '{"Hip Flexors"}', 'Bodyweight', false, null),
  ('Cable Crunches', 'Abs', '{}', 'Cable', false, null),
  ('Plank', 'Abs', '{"Core","Shoulders"}', 'Bodyweight', false, null),
  ('Ab Wheel Rollout', 'Abs', '{"Shoulders","Lats"}', 'Other', false, null),
  ('Decline Sit-Ups', 'Abs', '{"Hip Flexors"}', 'Bodyweight', false, null),
  ('Wrist Curls', 'Forearms', '{}', 'Barbell', false, null),
  ('Reverse Wrist Curls', 'Forearms', '{}', 'Barbell', false, null),
  ('Farmer''s Walk', 'Forearms', '{"Traps","Core"}', 'Dumbbell', false, null),
  ('Decline Bench Press', 'Chest', '{"Triceps"}', 'Barbell', false, null),
  ('Cable Crossover', 'Chest', '{}', 'Cable', false, null),
  ('Chin-Ups', 'Back', '{"Biceps"}', 'Bodyweight', false, null),
  ('Rack Pull', 'Back', '{"Traps","Glutes"}', 'Barbell', false, null),
  ('Pendlay Row', 'Back', '{"Biceps"}', 'Barbell', false, null),
  ('Machine Shoulder Press', 'Shoulders', '{"Triceps"}', 'Machine', false, null),
  ('Cable Front Raise', 'Shoulders', '{}', 'Cable', false, null),
  ('Reverse Pec Deck', 'Shoulders', '{"Upper Back"}', 'Machine', false, null),
  ('EZ Bar Curl', 'Biceps', '{"Forearms"}', 'Barbell', false, null),
  ('Concentration Curl', 'Biceps', '{}', 'Dumbbell', false, null),
  ('JM Press', 'Triceps', '{}', 'Barbell', false, null),
  ('Diamond Push-Ups', 'Triceps', '{"Chest"}', 'Bodyweight', false, null),
  ('Sissy Squat', 'Quads', '{}', 'Bodyweight', false, null),
  ('Walking Lunges', 'Quads', '{"Glutes","Hamstrings"}', 'Dumbbell', false, null),
  ('Single Leg Curl', 'Hamstrings', '{}', 'Machine', false, null),
  ('Donkey Kicks', 'Glutes', '{"Hamstrings"}', 'Bodyweight', false, null),
  ('Russian Twists', 'Abs', '{"Obliques"}', 'Bodyweight', false, null),
  ('Dragon Flag', 'Abs', '{"Core"}', 'Bodyweight', false, null),
  ('Pallof Press', 'Abs', '{"Obliques"}', 'Cable', false, null),
  ('Barbell Shrugs', 'Traps', '{"Forearms"}', 'Barbell', false, null),
  ('Dumbbell Shrugs', 'Traps', '{}', 'Dumbbell', false, null),
  ('Cable Shrugs', 'Traps', '{}', 'Cable', false, null),
  ('Treadmill', 'Cardio', '{}', 'Machine', false, null),
  ('Rowing Machine', 'Cardio', '{"Back","Biceps"}', 'Machine', false, null),
  ('Stationary Bike', 'Cardio', '{}', 'Machine', false, null),
  ('Stairmaster', 'Cardio', '{"Glutes","Calves"}', 'Machine', false, null);
