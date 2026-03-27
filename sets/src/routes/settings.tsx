import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Scale, Timer, Moon } from 'lucide-react'
import { useAtom } from 'jotai'
import { Card } from '../components/ui/Card'
import { settingsAtom } from '../store/atoms'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [settings, setSettings] = useAtom(settingsAtom)

  return (
    <div className="flex flex-col min-h-full px-4 pt-safe">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 pt-6 pb-2"
      >
        <Link to="/">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <ArrowLeft size={18} />
          </motion.div>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex flex-col gap-3 mt-4"
      >
        {/* Units */}
        <Card header={
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Scale size={16} />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Weight Units</span>
          </div>
        }>
          <div className="grid grid-cols-2 gap-2">
            {(['kg', 'lbs'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setSettings((s) => ({ ...s, units: unit }))}
                className={[
                  'h-10 rounded-lg font-semibold text-sm transition-colors duration-150',
                  settings.units === unit
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
                ].join(' ')}
              >
                {unit}
              </button>
            ))}
          </div>
        </Card>

        {/* Rest timer */}
        <Card header={
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Default Rest Time</span>
          </div>
        }>
          <div className="grid grid-cols-3 gap-2">
            {[60, 90, 120, 150, 180, 240].map((secs) => (
              <button
                key={secs}
                onClick={() => setSettings((s) => ({ ...s, defaultRestSeconds: secs }))}
                className={[
                  'h-10 rounded-lg font-semibold text-sm transition-colors duration-150',
                  settings.defaultRestSeconds === secs
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
                ].join(' ')}
              >
                {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
              </button>
            ))}
          </div>
        </Card>

        {/* Theme */}
        <Card header={
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Theme</span>
          </div>
        }>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => setSettings((s) => ({ ...s, theme }))}
                className={[
                  'h-10 rounded-lg font-semibold text-sm capitalize transition-colors duration-150',
                  settings.theme === theme
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
                ].join(' ')}
              >
                {theme}
              </button>
            ))}
          </div>
        </Card>

        {/* App info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">SETS v0.1.0</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Built with love for lifters</p>
        </div>
      </motion.div>
    </div>
  )
}
