export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Overload 1: takes ms number (legacy)
export function formatDuration(ms: number): string
// Overload 2: takes two Dates
export function formatDuration(start: Date, end: Date): string
export function formatDuration(startOrMs: number | Date, end?: Date): string {
  let totalMinutes: number
  if (startOrMs instanceof Date && end instanceof Date) {
    totalMinutes = Math.floor((end.getTime() - startOrMs.getTime()) / 60000)
  } else {
    totalMinutes = Math.floor((startOrMs as number) / 60000)
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${totalMinutes}min`
}

export function formatVolume(totalVolume: number, unit: 'kg' | 'lbs' = 'kg'): string {
  const value = unit === 'lbs' ? Math.round(totalVolume * 2.205) : totalVolume
  return value.toLocaleString() + ' ' + unit
}

export function formatRestTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  const dayName = DAY_NAMES[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  const day = date.getDate()

  // Older than ~6 months: show year
  if (diffDays > 180) {
    return `${day} ${monthName} ${date.getFullYear()}`
  }
  return `${dayName} ${day} ${monthName}`
}

export function formatDate(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  const day = date.getDate()
  return `${dayName} ${day} ${monthName} ${date.getFullYear()}`
}
