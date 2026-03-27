import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Plus, ChevronRight } from 'lucide-react'
import { db, type Exercise } from '../../db'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Traps', 'Forearms', 'Cardio',
]

const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other']

interface ExercisePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ isOpen, onClose, onSelect }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMuscle, setCustomMuscle] = useState('Chest')
  const [customEquipment, setCustomEquipment] = useState('Barbell')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      db.exercises.toArray().then(setExercises)
      setTimeout(() => searchRef.current?.focus(), 400)
    } else {
      setSearch('')
      setMuscleFilter('All')
      setShowCustomForm(false)
    }
  }, [isOpen])

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = muscleFilter === 'All' || e.muscleGroup === muscleFilter
    return matchesSearch && matchesMuscle
  })

  // Group by muscle group
  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
    acc[ex.muscleGroup].push(ex)
    return acc
  }, {})

  async function handleAddCustom() {
    if (!customName.trim()) return
    const exercise: Exercise = {
      name: customName.trim(),
      muscleGroup: customMuscle,
      secondaryMuscles: [],
      equipment: customEquipment,
      isCustom: true,
    }
    const id = (await db.exercises.add(exercise)) as number
    onSelect({ ...exercise, id })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add Exercise</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full h-11 pl-9 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Muscle group chips */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
              {MUSCLE_GROUPS.map(mg => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setMuscleFilter(mg)}
                  className={[
                    'shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors duration-150',
                    muscleFilter === mg
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
                  ].join(' ')}
                >
                  {mg}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto">
              {/* Custom exercise option */}
              <div className="px-4 pb-2">
                {showCustomForm ? (
                  <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3">
                    <Input
                      label="Exercise name"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="e.g. Plate Pinch"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Muscle Group</label>
                        <select
                          value={customMuscle}
                          onChange={e => setCustomMuscle(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
                        >
                          {MUSCLE_GROUPS.filter(m => m !== 'All').map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Equipment</label>
                        <select
                          value={customEquipment}
                          onChange={e => setCustomEquipment(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
                        >
                          {EQUIPMENT_OPTIONS.map(eq => (
                            <option key={eq} value={eq}>{eq}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setShowCustomForm(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddCustom} fullWidth>Add Exercise</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-medium">Custom Exercise</span>
                  </button>
                )}
              </div>

              {/* Grouped exercise list */}
              {Object.entries(grouped).map(([group, exs]) => (
                <div key={group}>
                  <div className="px-4 py-2">
                    <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{group}</span>
                  </div>
                  {exs.map(ex => (
                    <motion.button
                      key={ex.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { onSelect(ex); onClose() }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{ex.name}</p>
                        <span className="text-xs text-[var(--text-tertiary)]">{ex.equipment}</span>
                      </div>
                      <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
                    </motion.button>
                  ))}
                </div>
              ))}

              {filtered.length === 0 && !showCustomForm && (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)] text-sm">No exercises found</p>
                </div>
              )}

              <div className="h-8" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
