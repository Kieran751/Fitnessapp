export const nivoTheme = {
  background: 'transparent',
  text: {
    fill: 'var(--text-secondary)',
    fontFamily: "'Manrope', sans-serif",
    fontSize: 11,
  },
  axis: {
    ticks: {
      text: {
        fill: 'var(--text-tertiary)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
    },
    legend: {
      text: {
        fill: 'var(--text-secondary)',
        fontFamily: "'Manrope', sans-serif",
        fontSize: 12,
      },
    },
  },
  grid: {
    line: {
      stroke: 'var(--border-subtle)',
      strokeWidth: 0.5,
    },
  },
  crosshair: {
    line: {
      stroke: 'var(--accent)',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
  tooltip: {
    container: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      padding: '8px 12px',
      color: 'var(--text-primary)',
      fontFamily: "'Manrope', sans-serif",
      fontSize: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
  },
} as const

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL'

export function getDateBoundary(range: TimeRange): string | null {
  if (range === 'ALL') return null
  const now = new Date()
  const months: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }
  now.setMonth(now.getMonth() - months[range])
  return now.toISOString()
}
