import { useState, useMemo, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { settingsAtom } from '../../store/atoms'
import { Modal } from '../ui/Modal'
import { NumberStepper } from '../ui/NumberStepper'

interface PlateCalculatorProps {
  isOpen: boolean
  onClose: () => void
  initialWeight?: number
}

const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const
const PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const

// Visual size + colour per plate weight
const PLATE_STYLE_KG: Record<number, { height: number; color: string }> = {
  25:    { height: 92, color: '#DC2626' }, // red
  20:    { height: 84, color: '#2563EB' }, // blue
  15:    { height: 76, color: '#EAB308' }, // yellow
  10:    { height: 64, color: '#16A34A' }, // green
  5:     { height: 50, color: '#FFFFFF' }, // white
  2.5:   { height: 40, color: '#9CA3AF' }, // gray
  1.25:  { height: 32, color: '#6B7280' }, // dark gray
}

const PLATE_STYLE_LBS: Record<number, { height: number; color: string }> = {
  45: { height: 92, color: '#2563EB' },
  35: { height: 80, color: '#EAB308' },
  25: { height: 68, color: '#16A34A' },
  10: { height: 54, color: '#FFFFFF' },
  5:  { height: 44, color: '#9CA3AF' },
  2.5:{ height: 36, color: '#6B7280' },
}

interface BarConfig {
  label: string
  weight: number
}

function calculatePlates(targetWeight: number, barWeight: number, plates: readonly number[]): {
  perSide: { weight: number; count: number }[]
  achievable: number
  remainder: number
} {
  if (targetWeight < barWeight) {
    return { perSide: [], achievable: barWeight, remainder: 0 }
  }

  const perSideTarget = (targetWeight - barWeight) / 2
  const result: { weight: number; count: number }[] = []
  let remaining = perSideTarget

  for (const plate of plates) {
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      result.push({ weight: plate, count })
      remaining = parseFloat((remaining - count * plate).toFixed(4))
    }
  }

  const platesTotal = result.reduce((sum, p) => sum + p.weight * p.count, 0) * 2
  const achievable = barWeight + platesTotal

  return {
    perSide: result,
    achievable,
    remainder: parseFloat((targetWeight - achievable).toFixed(4)),
  }
}

export function PlateCalculator({ isOpen, onClose, initialWeight }: PlateCalculatorProps) {
  const settings = useAtomValue(settingsAtom)
  const unit = settings.units
  const isKg = unit === 'kg'

  const barOptions: BarConfig[] = useMemo(() => isKg
    ? [{ label: 'Standard', weight: 20 }, { label: 'Women\u2019s', weight: 15 }]
    : [{ label: 'Standard', weight: 45 }, { label: 'Women\u2019s', weight: 35 }],
    [isKg]
  )

  const defaultWeight = initialWeight ?? (isKg ? 60 : 135)
  const [weight, setWeight] = useState(defaultWeight)
  const [barIdx, setBarIdx] = useState(0)

  // Reset weight when modal reopens with a new initialWeight
  useEffect(() => {
    if (isOpen && initialWeight !== undefined) {
      setWeight(initialWeight)
    }
  }, [isOpen, initialWeight])

  const plates = isKg ? PLATES_KG : PLATES_LBS
  const styles = isKg ? PLATE_STYLE_KG : PLATE_STYLE_LBS
  const bar = barOptions[barIdx]
  const step = isKg ? 2.5 : 5

  const { perSide, achievable, remainder } = useMemo(
    () => calculatePlates(weight, bar.weight, plates),
    [weight, bar.weight, plates]
  )

  const isUnderBar = weight < bar.weight
  const isExact = !isUnderBar && Math.abs(remainder) < 0.01

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plate Calculator">
      <div className="flex flex-col gap-6">
        {/* Weight input */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Target Weight
          </span>
          <NumberStepper
            value={weight}
            onChange={setWeight}
            step={step}
            fastStep={step * 4}
            min={0}
            max={isKg ? 500 : 1000}
            unit={unit}
          />
        </div>

        {/* Bar selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Barbell
          </span>
          <div className="flex gap-2">
            {barOptions.map((b, i) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setBarIdx(i)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all duration-150 border"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  background: barIdx === i ? 'var(--accent)' : 'var(--glass)',
                  color: barIdx === i ? '#fff' : 'var(--text-secondary)',
                  borderColor: barIdx === i ? 'var(--accent)' : 'var(--glass-border)',
                }}
              >
                {b.label} <span className="opacity-70">· {b.weight}{unit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual barbell diagram */}
        <div
          className="rounded-2xl p-5 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            minHeight: 140,
          }}
        >
          {isUnderBar ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Weight is less than the barbell ({bar.weight}{unit})
            </p>
          ) : perSide.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Just the bar — no plates needed
            </p>
          ) : (
            <BarbellDiagram perSide={perSide} styles={styles} />
          )}
        </div>

        {/* Plate breakdown text */}
        {!isUnderBar && perSide.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Per Side
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {perSide.map(p => (
                <div
                  key={p.weight}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{
                    background: 'var(--glass)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <span className="font-mono tabular text-sm font-bold text-[var(--text-primary)]">
                    {p.count}×
                  </span>
                  <span className="font-mono tabular text-sm text-[var(--text-secondary)]">
                    {p.weight}{unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inexact-weight notice */}
        {!isUnderBar && !isExact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl px-4 py-3 text-center"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            <p className="text-xs text-[#F59E0B]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Closest achievable: <span className="font-mono font-bold">{achievable}{unit}</span>
              {remainder > 0 && <> ({remainder.toFixed(2)}{unit} short)</>}
            </p>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}

function BarbellDiagram({
  perSide,
  styles,
}: {
  perSide: { weight: number; count: number }[]
  styles: Record<number, { height: number; color: string }>
}) {
  // Flatten plates: largest closest to centre (bar), smallest at the ends
  const stack = perSide.flatMap(p => Array(p.count).fill(p.weight)) as number[]

  return (
    <div className="flex items-center justify-center w-full">
      {/* Left side — plates from outside in (smallest outside) */}
      <div className="flex items-center justify-end" style={{ height: 100 }}>
        <AnimatePresence initial={false}>
          {[...stack].reverse().map((w, i) => {
            const s = styles[w]
            return (
              <motion.div
                key={`l-${i}-${w}`}
                layout
                initial={{ opacity: 0, x: -10, scaleY: 0.6 }}
                animate={{ opacity: 1, x: 0, scaleY: 1 }}
                exit={{ opacity: 0, x: -10, scaleY: 0.6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  width: 9,
                  height: s?.height ?? 40,
                  background: s?.color ?? '#999',
                  borderRadius: 2,
                  marginRight: 1.5,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
                }}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* Sleeve (bar end) */}
      <div style={{ width: 18, height: 8, background: '#9CA3AF', borderRadius: 1 }} />

      {/* Bar */}
      <div style={{ flex: '0 1 80px', height: 5, background: 'linear-gradient(to bottom, #D1D5DB, #6B7280)', borderRadius: 1 }} />

      {/* Sleeve (bar end) */}
      <div style={{ width: 18, height: 8, background: '#9CA3AF', borderRadius: 1 }} />

      {/* Right side — mirror */}
      <div className="flex items-center justify-start" style={{ height: 100 }}>
        <AnimatePresence initial={false}>
          {stack.map((w, i) => {
            const s = styles[w]
            return (
              <motion.div
                key={`r-${i}-${w}`}
                layout
                initial={{ opacity: 0, x: 10, scaleY: 0.6 }}
                animate={{ opacity: 1, x: 0, scaleY: 1 }}
                exit={{ opacity: 0, x: 10, scaleY: 0.6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  width: 9,
                  height: s?.height ?? 40,
                  background: s?.color ?? '#999',
                  borderRadius: 2,
                  marginLeft: 1.5,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
                }}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
