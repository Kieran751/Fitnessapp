import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Scale, Timer, Moon, Download, Upload, Trash2, LogOut,
} from 'lucide-react'
import { useAtom } from 'jotai'
import { useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { settingsAtom } from '../store/atoms'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

interface BackupData {
  format: string
  exportedAt: string
  exercises: unknown[]
  templates: unknown[]
  workouts: unknown[]
  sets: unknown[]
  bodyWeights: unknown[]
  personalRecords: unknown[]
}

function SettingsPage() {
  const [settings, setSettings] = useAtom(settingsAtom)
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { show: showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear data modals
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0)
  const [clearConfirmText, setClearConfirmText] = useState('')

  // Import modal
  const [importData, setImportData] = useState<BackupData | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  function handleThemeChange(theme: 'dark' | 'light') {
    setSettings((s) => ({ ...s, theme }))
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  async function handleExport() {
    try {
      const [
        { data: exercises },
        { data: templates },
        { data: workouts },
        { data: sets },
        { data: bodyWeights },
        { data: personalRecords },
      ] = await Promise.all([
        supabase.from('exercises').select('*'),
        supabase.from('templates').select('*'),
        supabase.from('workouts').select('*'),
        supabase.from('sets').select('*'),
        supabase.from('body_weights').select('*'),
        supabase.from('personal_records').select('*'),
      ])

      const backup: BackupData = {
        format: 'sets-backup-v1',
        exportedAt: new Date().toISOString(),
        exercises: exercises ?? [],
        templates: templates ?? [],
        workouts: workouts ?? [],
        sets: sets ?? [],
        bodyWeights: bodyWeights ?? [],
        personalRecords: personalRecords ?? [],
      }

      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().slice(0, 10)
      a.download = `sets-backup-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exported successfully', 'success')
    } catch {
      showToast('Export failed', 'error')
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as BackupData
      if (parsed.format !== 'sets-backup-v1') {
        showToast('Invalid backup file format', 'error')
        return
      }
      setImportData(parsed)
      setShowImportModal(true)
    } catch {
      showToast('Failed to read backup file', 'error')
    } finally {
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleImportConfirm() {
    if (!importData) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user!.id

      // Upsert data with userId
      if (importData.templates?.length) {
        const rows = (importData.templates as Record<string, unknown>[]).map(r => ({ ...r, userId }))
        await supabase.from('templates').upsert(rows)
      }
      if (importData.workouts?.length) {
        const rows = (importData.workouts as Record<string, unknown>[]).map(r => ({ ...r, userId }))
        await supabase.from('workouts').upsert(rows)
      }
      if (importData.sets?.length) {
        const rows = (importData.sets as Record<string, unknown>[]).map(r => ({ ...r, userId }))
        await supabase.from('sets').upsert(rows)
      }
      if (importData.bodyWeights?.length) {
        const rows = (importData.bodyWeights as Record<string, unknown>[]).map(r => ({ ...r, userId }))
        await supabase.from('body_weights').upsert(rows)
      }
      if (importData.personalRecords?.length) {
        const rows = (importData.personalRecords as Record<string, unknown>[]).map(r => ({ ...r, userId }))
        await supabase.from('personal_records').upsert(rows)
      }

      setShowImportModal(false)
      setImportData(null)
      showToast('Data imported successfully', 'success')
    } catch {
      showToast('Import failed', 'error')
    }
  }

  async function handleClearConfirm() {
    if (clearConfirmText !== 'DELETE') return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user!.id

      await supabase.from('personal_records').delete().eq('userId', userId)
      await supabase.from('sets').delete().eq('userId', userId)
      await supabase.from('workouts').delete().eq('userId', userId)
      await supabase.from('templates').delete().eq('userId', userId)
      await supabase.from('body_weights').delete().eq('userId', userId)

      setClearStep(0)
      setClearConfirmText('')
      showToast('All data cleared', 'success')
      navigate({ to: '/' })
    } catch {
      showToast('Failed to clear data', 'error')
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex flex-col min-h-full px-5 pt-safe pb-28">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-8 pb-2"
      >
        <h1
          className="text-4xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
        >
          Settings
        </h1>
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
                  'h-10 rounded-xl font-semibold text-sm transition-all duration-150',
                  settings.units === unit
                    ? 'text-[var(--on-primary)]'
                    : 'bg-[var(--glass)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
                ].join(' ')}
                style={settings.units === unit ? {
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                } : undefined}
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
                  'h-10 rounded-xl font-semibold text-sm transition-all duration-150',
                  settings.defaultRestSeconds === secs
                    ? 'text-[var(--on-primary)]'
                    : 'bg-[var(--glass)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
                ].join(' ')}
                style={settings.defaultRestSeconds === secs ? {
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                } : undefined}
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
                onClick={() => handleThemeChange(theme)}
                className={[
                  'h-10 rounded-xl font-semibold text-sm capitalize transition-all duration-150',
                  settings.theme === theme
                    ? 'text-[var(--on-primary)]'
                    : 'bg-[var(--glass)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
                ].join(' ')}
                style={settings.theme === theme ? {
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                } : undefined}
              >
                {theme}
              </button>
            ))}
          </div>
        </Card>

        {/* Data management */}
        <Card header={
          <span className="text-sm font-semibold text-[var(--text-primary)]">Data</span>
        }>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" fullWidth onClick={handleExport}>
              <Download size={16} />
              Export Data
            </Button>
            <Button variant="secondary" fullWidth onClick={handleImportClick}>
              <Upload size={16} />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </Card>

        {/* Sign Out */}
        <Card header={
          <span className="text-sm font-semibold text-[var(--text-primary)]">Account</span>
        }>
          <Button variant="secondary" fullWidth onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </Button>
        </Card>

        {/* Danger zone */}
        <div className="mt-2 p-4 rounded-3xl bg-[var(--danger-surface)]">
          <Button variant="danger" fullWidth onClick={() => setClearStep(1)}>
            <Trash2 size={16} />
            Clear All Data
          </Button>
        </div>

        {/* App info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">SETS v0.1.0</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Built with love for lifters</p>
        </div>
      </motion.div>

      {/* Clear data -- step 1 */}
      <Modal
        isOpen={clearStep === 1}
        onClose={() => setClearStep(0)}
        title="Clear All Data?"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This will permanently delete all your workouts, templates, personal records, and body weight entries. This cannot be undone.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => setClearStep(2)}>
            Continue
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setClearStep(0)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Clear data -- step 2: type DELETE */}
      <Modal
        isOpen={clearStep === 2}
        onClose={() => { setClearStep(0); setClearConfirmText('') }}
        title="Type DELETE to confirm"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Type <strong className="text-[var(--danger)]">DELETE</strong> in the box below to permanently erase all your data.
        </p>
        <input
          type="text"
          value={clearConfirmText}
          onChange={(e) => setClearConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full h-[52px] px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--danger)] transition-all duration-150 mb-4"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="danger"
            fullWidth
            disabled={clearConfirmText !== 'DELETE'}
            onClick={handleClearConfirm}
          >
            Erase Everything
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => { setClearStep(0); setClearConfirmText('') }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Import confirm modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportData(null) }}
        title="Import Backup?"
      >
        {importData && (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              This backup contains:
            </p>
            <div
              className="flex flex-col gap-1 mb-6 rounded-2xl p-3 text-sm border border-[var(--glass-border)]"
              style={{ background: 'var(--glass)' }}
            >
              <p className="text-[var(--text-primary)]">{(importData.exercises ?? []).length} exercises</p>
              <p className="text-[var(--text-primary)]">{(importData.templates ?? []).length} templates</p>
              <p className="text-[var(--text-primary)]">{(importData.workouts ?? []).length} workouts</p>
              <p className="text-[var(--text-primary)]">{(importData.sets ?? []).length} sets</p>
              <p className="text-[var(--text-primary)]">{(importData.bodyWeights ?? []).length} body weight entries</p>
              <p className="text-[var(--text-primary)]">{(importData.personalRecords ?? []).length} personal records</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Existing records with matching IDs will be overwritten. New records will be added.
            </p>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={handleImportConfirm}>
                Import
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => { setShowImportModal(false); setImportData(null) }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
